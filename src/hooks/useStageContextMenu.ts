import { useCallback } from "react";
import Konva from "konva";
import useEditorState, { ToolType } from "../store/EditorState.ts";

/**
 * Handles context menu actions on the stage: selecting shapes on right-click,
 * duplicating selected shapes, and managing tool selection.
 */
export function useStageContextMenu() {
    const selectedIds = useEditorState((s) => s.selectedIds);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const addShape = useEditorState((s) => s.addShape);
    const setActiveTool = useEditorState((s) => s.setActiveTool);

    const handleStageContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        // If right-clicked on a shape, ensure it is selected
        if (e.target !== stage && e.target.hasName("shape")) {
            const clickedId = e.target.id();
            if (!selectedIds.includes(clickedId)) {
                setSelectedIds([clickedId]);
            }
        } else if (e.target === stage) {
            setSelectedIds([]);
        }
    }, [selectedIds, setSelectedIds]);

    const handleDuplicate = useCallback(() => {
        const newIds: string[] = [];
        selectedIds.forEach((id) => {
            const orig = useEditorState.getState().shapes.find((s) => s.id === id);
            if (!orig) return;
            const copyId = crypto.randomUUID();
            newIds.push(copyId);
            addShape({
                ...orig,
                id: copyId,
                x: orig.x + 20,
                y: orig.y + 20,
                props: { ...orig.props },
            });
        });
        setSelectedIds(newIds);
    }, [selectedIds, addShape, setSelectedIds]);

    const handleSetTool = useCallback((tool: ToolType) => {
        setActiveTool(tool);
    }, [setActiveTool]);

    return {
        handleStageContextMenu,
        handleDuplicate,
        handleSetTool,
    };
}
