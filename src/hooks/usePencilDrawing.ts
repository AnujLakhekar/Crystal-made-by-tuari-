import { useRef, useState, useCallback, useEffect } from "react";
import Konva from "konva";
import useEditorState, { TOOLS } from "../store/EditorState.ts";

/**
 * Manages the pencil (free-draw) tool: accumulates pointer points as a draft,
 * then commits the drawn stroke as a "Freehand" shape on mouse/pointer up.
 * Freehand shapes use perfect-freehand for smooth, pressure-sensitive rendering.
 */
export function usePencilDrawing() {
    const isDrawingRef = useRef(false);
    const [draftPoints, setDraftPoints] = useState<number[][]>([]);

    const activeTool =  useEditorState((s) => s.activeTool);
    const addShape = useEditorState((s) => s.addShape);
    const brushConfig = useEditorState((s) => s.brushConfig);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);

    const commitStroke = useCallback(
        (points: number[][]) => {
            if (points.length < 2) return;

            // Find bounding box for shape positioning
            let minX = Infinity;
            let minY = Infinity;
            for (const [x, y] of points) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
            }

            // Normalize points relative to top-left corner
            const normalizedPoints = points.map(([x, y]) => [x - minX, y - minY]);

            addShape({
                id: crypto.randomUUID(),
                type: "Freehand",
                x: minX,
                y: minY,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                props: {
                    rawPoints: normalizedPoints,
                    stroke: brushConfig.stroke,
                    strokeWidth: brushConfig.strokeWidth,
                    thinning: brushConfig.thinning,
                    smoothing: brushConfig.smoothing,
                    streamline: brushConfig.streamline,
                    taperStart: brushConfig.taperStart,
                    taperEnd: brushConfig.taperEnd,
                },
            });
        },
        [addShape, brushConfig]
    );

    const handleMouseDown = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent | MouseEvent>) => {
            if (activeTool !== TOOLS.PENCIL || e.evt.button !== 0) return;

            const pos = e.target.getStage()?.getRelativePointerPosition();
            if (!pos) return;

            isDrawingRef.current = true;
            setSelectedIds([]);
            setDraftPoints([[pos.x, pos.y]]);
        },
        [activeTool, setSelectedIds]
    );

    const handleMouseMove = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent | MouseEvent>) => {
            if (activeTool !== TOOLS.PENCIL || !isDrawingRef.current) return;

            const pos = e.target.getStage()?.getRelativePointerPosition();
            if (!pos) return;

            setDraftPoints((prev) => [...prev, [pos.x, pos.y]]);
        },
        [activeTool]
    );

    const handleMouseUp = useCallback(
        (_e?: Konva.KonvaEventObject<PointerEvent | MouseEvent>) => {
            if (activeTool !== TOOLS.PENCIL || !isDrawingRef.current) {
                return;
            }

            isDrawingRef.current = false;
            commitStroke(draftPoints);
            setDraftPoints([]);
        },
        [activeTool, draftPoints, commitStroke]
    );

    // Finalize stroke cleanly if pointer is released outside the canvas
    useEffect(() => {
        const onWindowPointerUp = () => {
            if (isDrawingRef.current) {
                handleMouseUp();
            }
        };
        window.addEventListener("pointerup", onWindowPointerUp);
        return () => window.removeEventListener("pointerup", onWindowPointerUp);
    }, [handleMouseUp]);

    return {
        draftPoints,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
}