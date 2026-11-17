import { Stage, Layer, Line } from "react-konva";
import { useCallback, useRef } from "react";
import Konva from "konva";
import ToolTip from "./ToolTip.tsx";
import SelectionToolbar from "./ToolBar.tsx";
import ShapeItem from "./ShapeItem.tsx";
import { TransformerComponent } from "./TransformerComponent.tsx";
import { SelectionRectangle } from "./SelectionRectangle.tsx";
import { StageContextMenu } from "./StageContextMenu.tsx";
import { useStageResize } from "../hooks/useStageResize.ts";
import { useSelectionMarquee } from "../hooks/useSelectionMarquee.ts";
import { usePencilDrawing } from "../hooks/usePencilDrawing.ts";
import { useTransformer } from "../hooks/useTransformer.ts";
import { useStageContextMenu } from "../hooks/useStageContextMenu.ts";
import useEditorState, { TOOLS, ToolType, BaseShape } from "../store/EditorState.ts";

export default function StageKonva() {
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Store subscriptions ---
    const stageSize = useEditorState((s) => s.stage.size);
    const activeTool = useEditorState((s) => s.activeTool);
    const setActiveTool = useEditorState((s) => s.setActiveTool);
    const shapes = useEditorState((s) => s.shapes);
    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);
    const brushConfig = useEditorState((s) => s.brushConfig);

    // --- Composables ---
    useStageResize(containerRef);

    const { selectionRect, handleMouseDown: marqueeMouseDown, handleMouseMove: marqueeMouseMove, handleMouseUp: marqueeMouseUp } =
        useSelectionMarquee();

    const { draftPoints, handleMouseDown: pencilMouseDown, handleMouseMove: pencilMouseMove, handleMouseUp: pencilMouseUp } =
        usePencilDrawing();

    const { trRef, stageRef, toolbarPos, updateToolbarPosition } = useTransformer();

    const { handleStageContextMenu } = useStageContextMenu();

    // --- Combined stage event handlers ---
    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        pencilMouseDown(e);
        marqueeMouseDown(e);
    }, [pencilMouseDown, marqueeMouseDown]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        pencilMouseMove(e);
        marqueeMouseMove(e);
    }, [pencilMouseMove, marqueeMouseMove]);

    const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        pencilMouseUp(e);
        marqueeMouseUp(e);
    }, [pencilMouseUp, marqueeMouseUp]);

    // --- Shape creation ---
    const handleAddShape = useCallback((type: "Rect" | "Circle") => {
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
                    ? { width: 100, height: 100, fill: Konva.Util.getRandomColor(), cornerRadius: 8 }
                    : { radius: 50, fill: Konva.Util.getRandomColor() },
        };
        addShape(newShape);
        setActiveTool(TOOLS.CURSOR);
    }, [stageSize, addShape, setActiveTool]);

    // --- Tool change ---
    const handleActiveTools = useCallback((tool: ToolType) => {
        setActiveTool(tool);
    }, [setActiveTool]);

    return (
        <StageContextMenu onAddShape={handleAddShape}>
            <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onContextMenu={handleStageContextMenu}
                >
                    <Layer onDragMove={updateToolbarPosition}>
                        {/* Shapes */}
                        {shapes.map((el) => (
                            <ShapeItem
                                key={el.id}
                                el={el}
                                activeTool={activeTool}
                                onUpdate={updateShape}
                            />
                        ))}

                        {/* Pencil draft line */}
                        {draftPoints.length > 0 && (
                            <Line
                                points={draftPoints}
                                stroke={brushConfig.stroke}
                                strokeWidth={brushConfig.strokeWidth}
                                tension={brushConfig.tension}
                                lineCap="round"
                                lineJoin="round"
                                listening={false}
                            />
                        )}

                        {/* Transformer with Figma-style handles */}
                        <TransformerComponent ref={trRef} onTransform={updateToolbarPosition} />

                        {/* Drag-to-select marquee rectangle */}
                        <SelectionRectangle
                            visible={selectionRect.visible}
                            x1={selectionRect.x1}
                            y1={selectionRect.y1}
                            x2={selectionRect.x2}
                            y2={selectionRect.y2}
                        />
                    </Layer>
                </Stage>

                {/* Floating selection toolbar above selected shapes */}
                {toolbarPos.visible && (
                    <SelectionToolbar x={toolbarPos.x} y={toolbarPos.y} />
                )}

                {/* Bottom floating tool bar */}
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
        </StageContextMenu>
    );
}