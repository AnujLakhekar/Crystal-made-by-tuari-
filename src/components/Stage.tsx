import {Stage, Layer, Rect, Transformer} from "react-konva";
import {useEffect, useRef, useState} from "react";
import ToolTip, {TOOLS, ToolType} from "./ToolTip.tsx";
import useEditorState, {BaseShape} from "../store/EditorState.ts";
import Konva from "konva";
import ShapeItem from "./ShapeItem.tsx";


export default function StageKonva() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageSize = useEditorState((s) => s.stage.size);
    const stageResize = useEditorState((s) => s.stageResize);
    const [activeTool, setActiveTool] = useState<ToolType>(TOOLS.CURSOR);
    const selectedIds = useEditorState((s) => s.selectedIds);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const [selectionRect, setSelectionRect] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const stageRef = useRef<Konva.Stage>(null);
    const trRef = useRef<Konva.Transformer>(null);


    // states

    const shapes = useEditorState((s) => s.shapes)
    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);


    // resize the canvas
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleResize = () => {
            stageResize(el.clientWidth, el.clientHeight);
        }

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [stageResize]);

    function handleActiveTools(tool: ToolType) {
        setActiveTool(tool);
    }

    const handleAddShape = (type: "Rect" | "Circle") => {
        const newShape: BaseShape = {
            id: crypto.randomUUID(),
            type,
            x: stageSize.width / 2 - 50,
            y: stageSize.height / 2 - 50,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            props:
                type === "Rect"
                    ? {width: 100, height: 100, fill: Konva.Util.getRandomColor(), cornerRadius: 8}
                    : {radius: 50, fill: Konva.Util.getRandomColor()},
        };

        addShape(newShape);
        setActiveTool(TOOLS.CURSOR); // Switch back to cursor so you can drag it immediately
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
        }

        if (activeTool !== TOOLS.SELECT) return;
        if (e.target !== e.target.getStage()) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        setSelectedIds([]);
        setSelectionRect({
            visible: true,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
        });

    }

    useEffect(() => {
        const tr = trRef.current;
        const stage = stageRef.current;
        if (!tr || !stage) return;

        const nodes = selectedIds
            .map((id) => stage.findOne(`#${id}`))
            .filter((node): node is Konva.Node => Boolean(node));

        tr.nodes(nodes);
        tr.getLayer()?.batchDraw();
    }, [selectedIds, shapes]);

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!selectionRect.visible) return;

        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        setSelectionRect((prev) => ({
            ...prev,
            x2: pos.x,
            y2: pos.y,
        }));
    }

    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!selectionRect.visible) return;
        const stage = e.target.getStage();
        if (!stage) return;

        const box = {
            x: Math.min(selectionRect.x1, selectionRect.x2),
            y: Math.min(selectionRect.y1, selectionRect.y2),
            width: Math.abs(selectionRect.x2 - selectionRect.x1),
            height: Math.abs(selectionRect.y2 - selectionRect.y1),
        }

        const foundIds: string[] = [];
        stage.find(".shape").forEach((node) => {
            if (Konva.Util.haveIntersection(box, node.getClientRect())) {
                foundIds.push(node.id());
            }
        })

        setSelectedIds(foundIds);
        setSelectionRect((prev) => ({
            ...prev,
            visible: false,
        }))
    }

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <Layer>
                    {
                        shapes.map((el) => (
                            <ShapeItem el={el} activeTool={activeTool} onUpdate={updateShape} />
                        ))
                    }

                    <Transformer
                        ref={trRef}
                        borderStroke="#3b82f6"
                        borderStrokeWidth={1.5}
                        anchorFill="#ffffff"
                        anchorStroke="#3b82f6"
                        rotateEnabled={true}
                        anchorStrokeWidth={1.5}
                        anchorSize={8}
                        enabledAnchors={[
                            "top-left",
                            "top-right",
                            "top-center",
                            "middle-left",
                            "middle-right",
                            "bottom-left",
                            "bottom-center",
                            "bottom-right",
                        ]}
                        anchorCornerRadius={2}
                        rotateAnchorOffset={24}
                        rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                        flipEnabled={false}
                        ignoreStroke={true}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                        anchorStyleFunc={(anchor) => {

                            // Make side handles pill-shaped like Figma
                            if (anchor.hasName("middle-left") || anchor.hasName("middle-right")) {
                                anchor.height(16);
                                anchor.offsetY(8);
                                anchor.width(5);
                                anchor.offsetX(2.5);
                            }
                            if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
                                anchor.width(16);
                                anchor.offsetX(8);
                                anchor.height(5);
                                anchor.offsetY(2.5);
                            }
                            // Make rotation handle a circle
                            if (anchor.hasName("rotater")) {
                                anchor.cornerRadius(999);
                                anchor.size({width: 10, height: 10});
                                anchor.offset({x: 5, y: 5});
                            }
                        }}
                    />

                    {/* selector */}
                    {selectionRect.visible && (
                        <Rect
                            x={Math.min(selectionRect.x1, selectionRect.x2)}
                            y={Math.min(selectionRect.y1, selectionRect.y2)}
                            width={Math.abs(selectionRect.x2 - selectionRect.x1)}
                            height={Math.abs(selectionRect.y2 - selectionRect.y1)}
                            fill="rgba(59, 130, 246, 0.2)"
                            stroke="#3b82f6"
                            strokeWidth={1}
                            listening={false}
                        />
                    )}
                </Layer>
            </Stage>

            {/* Toolbar */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-50 flex justify-center">
                <div className="pointer-events-auto">
                    <ToolTip
                        activeTool={activeTool}
                        handleChangeState={handleActiveTools}
                        onAddShape={handleAddShape}
                    />
                </div>
            </div>
        </div>
    );
}