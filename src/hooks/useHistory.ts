// hooks/useHistory.ts
import { useHotkeys } from "react-hotkeys-hook";
import useEditorState, {TOOLS} from "../store/EditorState.ts";

export function useHistory(enableShortcuts = true) {
    const canUndo = useEditorState((s) => s.canUndo);
    const canRedo = useEditorState((s) => s.canRedo);
    const undo = useEditorState((s) => s.undo);
    const redo = useEditorState((s) => s.redo);
    const setActiveTool = useEditorState((s) => s.setActiveTool);


    useHotkeys("s", () => {
        setActiveTool(TOOLS.SELECT)
    })

    useHotkeys("a", () => {
        setActiveTool(TOOLS.CURSOR)
    })

    useHotkeys("p", () => {
        setActiveTool(TOOLS.PENCIL)
    })

    // Undo: Ctrl+Z / Cmd+Z
    useHotkeys(
        "mod+z",
        (e) => {
            e.preventDefault();
            undo();
        },
        { enabled: enableShortcuts && canUndo }
    );



    // Redo: Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z
    useHotkeys(
        ["mod+y", "mod+shift+z"],
        (e) => {
            e.preventDefault();
            redo();
        },
        { enabled: enableShortcuts && canRedo }
    );

    // Delete / Backspace selected shapes
    useHotkeys(
        ["backspace", "delete"],
        (e) => {
            const { selectedIds, deleteShapes, setSelectedIds } = useEditorState.getState();
            if (selectedIds.length === 0) return;
            e.preventDefault();
            deleteShapes(selectedIds);
            setSelectedIds([]);
        },
        { enabled: enableShortcuts }
    );

    return { canUndo, canRedo, undo, redo };
}