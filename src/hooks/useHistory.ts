// hooks/useHistory.ts
import { useEffect } from "react";
import useEditorState from "../store/EditorState.ts";

export function useHistory(enableShortcuts = true) {
    const canUndo = useEditorState((s) => s.canUndo);
    const canRedo = useEditorState((s) => s.canRedo);
    const undo = useEditorState((s) => s.undo);
    const redo = useEditorState((s) => s.redo);

    useEffect(() => {
        if (!enableShortcuts) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable
            ) {
                return;
            }

            const {
                undo: runUndo,
                redo: runRedo,
                deleteShapes,
                selectedIds,
                setSelectedIds,
            } = useEditorState.getState();

            const isMod = e.ctrlKey || e.metaKey;

            // Undo: Ctrl+Z / Cmd+Z
            if (isMod && e.key.toLowerCase() === "z" && !e.shiftKey) {
                e.preventDefault();
                runUndo();
            }
            // Redo: Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z
            else if (
                (isMod && e.key.toLowerCase() === "y") ||
                (isMod && e.shiftKey && e.key.toLowerCase() === "z")
            ) {
                e.preventDefault();
                runRedo();
            }
            // Delete selected shapes
            else if ((e.key === "Backspace" || e.key === "Delete") && selectedIds.length > 0) {
                e.preventDefault();
                deleteShapes(selectedIds);
                setSelectedIds([]);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enableShortcuts]);

    return { canUndo, canRedo, undo, redo };
}