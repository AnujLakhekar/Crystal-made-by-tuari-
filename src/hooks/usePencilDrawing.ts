import { useRef, useState, useCallback } from "react";
import Konva from "konva";
import useEditorState, { TOOLS } from "../store/EditorState.ts";

/**
 * Manages the pencil (free-draw) tool: accumulates pointer points as a draft,
 * then commits the drawn line as a "Line" shape on mouse up.
 */
export function usePencilDrawing() {
    const isDrawingRef = useRef(false);
    const [draftPoints, setDraftPoints] = useState<number[]>([]);

    const activeTool = useEditorState((s) => s.activeTool);
    const addShape = useEditorState((s) => s.addShape);
    const brushConfig = useEditorState((s) => s.brushConfig);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (activeTool !== TOOLS.PENCIL) return;
        if (e.target !== e.target.getStage()) return;

        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        isDrawingRef.current = true;
        setSelectedIds([]);
        setDraftPoints([pos.x, pos.y]);
    }, [activeTool, setSelectedIds]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (activeTool !== TOOLS.PENCIL || !isDrawingRef.current) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        setDraftPoints((prev) => [...prev, pos.x, pos.y]);
    }, [activeTool]);

    const handleMouseUp = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
        if (activeTool !== TOOLS.PENCIL || !isDrawingRef.current) {
            return;
        }

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
                    stroke: brushConfig.stroke,
                    strokeWidth: brushConfig.strokeWidth,
                    tension: brushConfig.tension,
                },
            });
        }

        setDraftPoints([]);
    }, [activeTool, draftPoints, brushConfig, addShape]);

    return {
        draftPoints,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
}
