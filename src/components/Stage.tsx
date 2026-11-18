import {Stage, Layer, Path, Rect} from "react-konva";
import Konva from "konva";
import {useCallback, useRef, useMemo, useState} from "react";
import ToolTip from "./ToolTip.tsx";
import SelectionToolbar from "./ToolBar.tsx";
import ShapeItem from "./ShapeItem.tsx";
import {TransformerComponent} from "./TransformerComponent.tsx";
import {SelectionRectangle} from "./SelectionRectangle.tsx";
import {StageContextMenu} from "./StageContextMenu.tsx";
import {useStageResize} from "../hooks/useStageResize.ts";
import {useSelectionMarquee} from "../hooks/useSelectionMarquee.ts";
import {usePencilDrawing} from "../hooks/usePencilDrawing.ts";
import {useTransformer} from "../hooks/useTransformer.ts";
import {useStageContextMenu} from "../hooks/useStageContextMenu.ts";
import {useCanvasViewport} from "../hooks/useCanvasViewport.ts";
import {usePinchZoom} from "../hooks/usePinchZoom.ts";
import {getFreehandPath} from "../core/strokeGeometry.ts";
import useEditorState, {TOOLS, ToolType, BaseShape} from "../store/EditorState.ts";
import {useDevice} from "../hooks/useDevice.ts";
import {useClipboardShortcuts} from "../hooks/useClipboard.ts"
import {useOptimizer} from "../hooks/useOptimizer.ts"

export default function StageKonva() {
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Device detection ---
    const {isMobile, isTouchDevice} = useDevice();

    // --- Performance optimizer ---
    const optimizer = useOptimizer();

    // Mobile pan mode toggle — on mobile, single-finger drag pans the canvas
    const [mobilePanMode, setMobilePanMode] = useState(false);

    // --- Store subscriptions ---
    const stageSize = useEditorState((s) => s.stage.size);
    const activeTool = useEditorState((s) => s.activeTool);
    const setActiveTool = useEditorState((s) => s.setActiveTool);
    const shapes = useEditorState((s) => s.shapes);
    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);
    const brushConfig = useEditorState((s) => s.brushConfig);
    const canvasConfig = useEditorState((s) => s.canvasConfig);
    const resetViewport = useEditorState((s) => s.resetViewport);

    // --- Composables ---
    useStageResize(containerRef);
    useClipboardShortcuts()

    const {trRef, stageRef, toolbarPos, updateToolbarPosition} = useTransformer();

    // Pinch-to-zoom on touch devices
    usePinchZoom(stageRef);

    const {
        position,
        scale,
        isSpacePressed,
        isPanning,
        handleWheel,
        handlePanStart,
        handlePanMove,
        handlePanEnd,
    } = useCanvasViewport(updateToolbarPosition, isMobile && mobilePanMode);

    const {
        selectionRect,
        handleMouseDown: marqueeMouseDown,
        handleMouseMove: marqueeMouseMove,
        handleMouseUp: marqueeMouseUp,
    } = useSelectionMarquee();

    const {
        draftPoints,
        handleMouseDown: pencilMouseDown,
        handleMouseMove: pencilMouseMove,
        handleMouseUp: pencilMouseUp,
    } = usePencilDrawing();

    // Smooth preview path for pencil draft — disabled on low-tier devices
    const draftPath = useMemo(() => {
        if (draftPoints.length < 2 || !optimizer.draftPreview) return "";
        // Downsample points on low-tier devices
        const points = optimizer.draftStep > 1
            ? draftPoints.filter((_, i) => i % optimizer.draftStep === 0)
            : draftPoints;
        return getFreehandPath(points, {
            size: brushConfig.strokeWidth,
            thinning: brushConfig.thinning,
            smoothing: brushConfig.smoothing,
            streamline: brushConfig.streamline,
        });
    }, [draftPoints, brushConfig.strokeWidth, brushConfig.thinning, brushConfig.smoothing, brushConfig.streamline, optimizer.draftPreview, optimizer.draftStep]);

    const {handleStageContextMenu} = useStageContextMenu();

    // --- Combined stage pointer handlers (pan takes priority) ---
    const handlePointerDown = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent>) => {
            if (handlePanStart(e)) return;
            pencilMouseDown(e);
            marqueeMouseDown(e);
        },
        [handlePanStart, pencilMouseDown, marqueeMouseDown]
    );

    const handlePointerMove = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent>) => {
            if (handlePanMove(e)) return;
            pencilMouseMove(e);
            marqueeMouseMove(e);
        },
        [handlePanMove, pencilMouseMove, marqueeMouseMove]
    );

    const handlePointerUp = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent>) => {
            if (handlePanEnd()) return;
            pencilMouseUp(e);
            marqueeMouseUp(e);
        },
        [handlePanEnd, pencilMouseUp, marqueeMouseUp]
    );

    // --- Shape creation (spawns in center of current panned/zoomed viewport) ---
    const handleAddShape = useCallback(
        (type: "Rect" | "Circle") => {
            const worldCenterX = (-position.x + stageSize.width / 2) / scale;
            const worldCenterY = (-position.y + stageSize.height / 2) / scale;

            const newShape: BaseShape = {
                id: crypto.randomUUID(),
                type,
                x: type === "Rect" ? worldCenterX - 50 : worldCenterX,
                y: type === "Rect" ? worldCenterY - 50 : worldCenterY,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                props:
                    type === "Rect"
                        ? {width: 100, height: 100, fill: Konva.Util.getRandomColor(), cornerRadius: 8}
                        : {radius: 50, fill: Konva.Util.getRandomColor()},
            };
            addShape(newShape);
            setActiveTool(TOOLS.CURSOR);
        },
        [position, scale, stageSize, addShape, setActiveTool]
    );

    // --- Tool change ---
    const handleActiveTools = useCallback(
        (tool: ToolType) => {
            setActiveTool(tool);
        },
        [setActiveTool]
    );

    // --- Dynamic canvas cursor ---
    const stageCursor = isPanning
        ? "grabbing"
        : isSpacePressed || (isMobile && mobilePanMode)
            ? "grab"
            : activeTool === TOOLS.PENCIL
                ? "crosshair"
                : "default";

    // --- Touch-friendly sizing ---
    const hitStrokeWidth = isTouchDevice ? 20 : 12;
    const transformerAnchorSize = isTouchDevice ? 16 : 8;

    // --- Grid dots pattern (single Rect with canvas 2D repeating pattern) ---
    // Auto-hide grid when zoom is below device-specific threshold to save FPS
    const gridVisible = canvasConfig.showGrid && scale >= optimizer.gridMinZoom;
    const gridPatternImage = useMemo(() => {
        if (!gridVisible) return null;

        const { gridSize } = canvasConfig;
        const canvas = document.createElement("canvas");
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.fillStyle = "rgba(128, 128, 128, 0.4)";
        ctx.beginPath();
        ctx.arc(gridSize / 2, gridSize / 2, optimizer.gridDotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Konva runtime accepts HTMLCanvasElement but TS types only declare HTMLImageElement
        return canvas as unknown as HTMLImageElement;
    }, [gridVisible, canvasConfig.gridSize, optimizer.gridDotRadius]);

    return (
        <StageContextMenu onAddShape={handleAddShape}>
            <div ref={containerRef} className="relative h-screen w-full overflow-hidden" style={{backgroundColor: canvasConfig.backgroundColor}}>
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    x={position.x}
                    y={position.y}
                    scaleX={scale}
                    scaleY={scale}
                    style={{cursor: stageCursor}}
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onContextMenu={handleStageContextMenu}
                >
                    {/* Grid dots layer — single rect with repeating pattern; auto-hidden at low zoom on mobile */}
                    {gridPatternImage && (
                        <Layer listening={false}>
                            <Rect
                                x={-50000}
                                y={-50000}
                                width={100000}
                                height={100000}
                                fillPatternImage={gridPatternImage}
                                fillPatternRepeat="repeat"
                            />
                        </Layer>
                    )}

                    {/* Shape layer — limit rendered count on low-tier devices */}

                    <Layer onDragMove={updateToolbarPosition}>
                        {/* Shapes — limited count on low-tier devices for FPS */}
                        {shapes.slice(0, optimizer.maxShapes).map((el) => (
                            <ShapeItem
                                key={el.id}
                                el={el}
                                activeTool={activeTool}
                                onUpdate={updateShape}
                                hitStrokeWidth={hitStrokeWidth}
                            />
                        ))}

                        {/* Pencil draft preview — smooth filled path */}
                        {draftPath && (
                            <Path
                                data={draftPath}
                                fill={brushConfig.stroke}
                                listening={false}
                            />
                        )}

                        {/* Transformer with Figma-style handles */}
                        <TransformerComponent
                            ref={trRef}
                            onTransform={updateToolbarPosition}
                            anchorSize={transformerAnchorSize}
                        />

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
                    <SelectionToolbar x={toolbarPos.x} y={toolbarPos.y}/>
                )}

                {/* Bottom floating toolbar */}
                <div className="pointer-events-none absolute inset-x-0 bottom-4 z-50 flex justify-center">
                    <div className="pointer-events-auto">
                        <ToolTip
                            activeTool={activeTool}
                            handleChangeState={handleActiveTools}
                            onAddShape={handleAddShape}
                            mobilePanMode={mobilePanMode}
                            onToggleMobilePan={() => setMobilePanMode((p) => !p)}
                        />
                    </div>
                </div>

                {/* Zoom percentage badge (click to reset to 100%) */}
                <button
                    type="button"
                    onClick={() => {
                        resetViewport();
                        requestAnimationFrame(updateToolbarPosition);
                    }}
                    title="Reset Zoom & Pan"
                    className={`absolute right-4 z-50 cursor-pointer rounded-md border border-[var(--gray-a6)] bg-[var(--color-panel-solid)] px-2.5 py-1 text-xs font-medium text-[var(--gray-11)] shadow-sm hover:text-[var(--gray-12)] ${isMobile ? "top-4 text-base px-3 py-1.5" : "bottom-4"}`}
                >
                    {Math.round(scale * 100)}%
                </button>
            </div>
        </StageContextMenu>
    );
}