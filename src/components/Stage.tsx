import {Stage, Layer, Rect, Circle} from "react-konva";
import {useEffect, useRef, useState} from "react";
import ToolTip, {TOOLS, ToolType} from "./ToolTip.tsx";
import useEditorState, {BaseShape} from "../store/EditorState.ts";
import Konva from "konva";

interface StageProps {
    width?: number;
    height?: number;
}

export default function StageKonvas({width, height}: StageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({
        width: width ?? 800,
        height: height ?? window.innerHeight,
    });
    const [activeTool, setActiveTool] = useState<ToolType>(TOOLS.CURSOR);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionRect, setSelectionRect] = useState({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });


    // states

    const shapes = useEditorState((s) => s.shapes)
    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);


    // resize the canvas
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function shapeRender(el: BaseShape) {
        const isSelected = selectedIds.includes(el.id);

        const commonProps = {
            id: el.id,
            name: "shape",
            x: el.x,
            y: el.y,
            rotation: el.rotation,
            scaleX: el.scaleX,
            scaleY: el.scaleY,
            draggable: activeTool === TOOLS.CURSOR,
            // Highlight selected shapes with a blue outline
            stroke: isSelected ? "#2563eb" : undefined,
            strokeWidth: isSelected ? 1 : 0,
            onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
                updateShape(el.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                });
            },
            ...el.props,
        };

        switch (el.type) {
            case "Rect":
                return <Rect key={el.id} {...commonProps} />;
            case "Circle":
                return <Circle key={el.id} {...commonProps} />;
            default:
                return null;
        }
    }

    function handleActiveTools(tool: ToolType) {
        setActiveTool(tool);
    }

    const handleAddShape = (type: "Rect" | "Circle") => {
        const newShape: BaseShape = {
            id: crypto.randomUUID(),
            type,
            x: canvasSize.width / 2 - 50,
            y: canvasSize.height / 2 - 50,
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
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <Layer>
                    {shapes.map((el) => shapeRender(el))}

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

            {/* Tool bar */}
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