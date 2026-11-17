import {Stage, Layer, Rect, Transformer, Line} from "react-konva";
import {useCallback, useEffect, useRef, useState} from "react";
import ToolTip from "./ToolTip.tsx";
import {TOOLS, ToolType} from "../store/EditorState.ts";
import useEditorState, {BaseShape} from "../store/EditorState.ts";
import Konva from "konva";
import ShapeItem from "./ShapeItem.tsx";
import SelectionToolbar from "../components/ToolBar.tsx"


export default function StageKonva() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageSize = useEditorState((s) => s.stage.size);
    const stageResize = useEditorState((s) => s.stageResize);
    const selectedIds = useEditorState((s) => s.selectedIds);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const activeTool = useEditorState((s) => s.activeTool);
    const setActiveTool = useEditorState((s) => s.setActiveTool);
    const isDrawingRef = useRef(false);
    const [draftPoints, setDraftPoints] = useState<number[]>([]);
    const [selectionRect, setSelectionRect] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const [toolbarPos, setToolbarPos] = useState<{
        visible: boolean;
        x: number;
        y: number;
    }>({visible: false, x: 0, y: 0});
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

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
        }


        if (e.target !== e.target.getStage()) return;

        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        if (activeTool === TOOLS.PENCIL) {
            isDrawingRef.current = true;
            setSelectedIds([]);
            setDraftPoints([pos.x, pos.y]);
            return;
        }


        if (activeTool !== TOOLS.SELECT) return;


        setSelectedIds([]);
        setSelectionRect({
            visible: true,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
        });

    }

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        if (activeTool === TOOLS.PENCIL && isDrawingRef.current) {
            setDraftPoints((prev) => [...prev, pos.x, pos.y]);
            return;
        }

        if (!selectionRect.visible) return;
        setSelectionRect((prev) => ({
            ...prev,
            x2: pos.x,
            y2: pos.y,
        }));
    }

    const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (activeTool === TOOLS.PENCIL && isDrawingRef.current) {
            isDrawingRef.current = false;

            if (draftPoints.length >= 4) {
                let minX = Infinity;
                let minY = Infinity;
                for (let i = 0; i < draftPoints.length; i += 2) {
                    if (draftPoints[i] < minX) minX = draftPoints[i];
                    if (draftPoints[i + 1] < minY) minY = draftPoints[i + 1];
                }

                const normalizedPoints = draftPoints.map((val, idx) =>
                    idx % 2 === 0 ? val - minX : val - minY
                );

                addShape({
                    id: crypto.randomUUID(),
                    type: "Line",
                    x: minX,
                    y: minY,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    props: {
                        points: normalizedPoints,
                        stroke: "#ffffff",
                        strokeWidth: 3,
                    },
                });
            }

            setDraftPoints([]);
            return;
        }


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

    const updateToolbarPosition = useCallback(() => {
        const tr = trRef.current;
        if (!tr || selectedIds.length === 0) {
            setToolbarPos((prev) => (prev.visible ? {...prev, visible: false} : prev));
            return;
        }

        const box = tr.getClientRect();
        setToolbarPos({
            visible: true,
            x: box.x + box.width / 2, // Centered horizontally above selection
            y: Math.max(16, box.y - 48), // 48px above top edge (clamped so it never goes off-screen)
        });
    }, [selectedIds]);


    // toolbar

    useEffect(() => {
        const tr = trRef.current;
        const stage = stageRef.current;
        if (!tr || !stage) return;

        const nodes = selectedIds
            .map((id) => stage.findOne(`#${id}`))
            .filter((node): node is Konva.Node => Boolean(node));

        tr.nodes(nodes);
        tr.getLayer()?.batchDraw();
        updateToolbarPosition();
    }, [selectedIds, shapes, updateToolbarPosition]);

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
                <Layer onDragMove={updateToolbarPosition}>
                    {
                        shapes.map((el) => (
                            <ShapeItem key={el.id} el={el} activeTool={activeTool} onUpdate={updateShape}/>
                        ))
                    }

                    {draftPoints.length > 0 && (
                        <Line
                            points={draftPoints}
                            stroke="#ffffff"
                            strokeWidth={3}
                            tension={0.4}
                            lineCap="round"
                            lineJoin="round"
                            listening={false}
                        />
                    )}

                    <Transformer
                        ref={trRef}
                        borderStroke="#3b82f6"
                        onTransform={updateToolbarPosition}
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

            {toolbarPos.visible && (
                <SelectionToolbar x={toolbarPos.x} y={toolbarPos.y}/>
            )}

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