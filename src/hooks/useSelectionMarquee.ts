import { useState, useCallback } from "react";
import Konva from "konva";
import useEditorState, { TOOLS } from "../store/EditorState.ts";

interface SelectionRect {
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Manages the drag-to-select (marquee) rectangle on the stage.
 * Returns state and handlers for mouseDown/mouseMove/mouseUp on the stage.
 */
export function useSelectionMarquee() {
    const [selectionRect, setSelectionRect] = useState<SelectionRect>({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });

    const activeTool = useEditorState((s) => s.activeTool);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
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
    }, [activeTool, setSelectedIds]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!selectionRect.visible) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        setSelectionRect((prev) => ({
            ...prev,
            x2: pos.x,
            y2: pos.y,
        }));
    }, [selectionRect.visible]);

    const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!selectionRect.visible) return;

        const stage = e.target.getStage();
        if (!stage) {
            setSelectionRect((prev) => ({ ...prev, visible: false }));
            return;
        }

        const box = {
            x: Math.min(selectionRect.x1, selectionRect.x2),
            y: Math.min(selectionRect.y1, selectionRect.y2),
            width: Math.abs(selectionRect.x2 - selectionRect.x1),
            height: Math.abs(selectionRect.y2 - selectionRect.y1),
        };

        const foundIds: string[] = [];
        stage.find(".shape").forEach((node: Konva.Node) => {
            if (Konva.Util.haveIntersection(box, node.getClientRect())) {
                foundIds.push(node.id());
            }
        });

        setSelectedIds(foundIds);
        setSelectionRect((prev) => ({ ...prev, visible: false }));
    }, [selectionRect, setSelectedIds]);

    // Clear selection when clicking empty stage (any tool)
    const handleStageClickClear = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
        }
    }, [setSelectedIds]);

    return {
        selectionRect,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleStageClickClear,
    };
}
