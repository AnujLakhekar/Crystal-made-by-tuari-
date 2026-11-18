import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useEditorState, { BaseShape } from "../store/EditorState.ts";

const CLIPBOARD_PREFIX = "TAURI_CANVAS_SHAPES:";

export function useClipboardShortcuts() {
    const clipboardRef = useRef<BaseShape[]>([]);
    const pasteCountRef = useRef(0);

    const copySelected = () => {
        const { selectedIds, getShapesByIds } = useEditorState.getState();
        if (selectedIds.length === 0) return;

        const selectedShapes = getShapesByIds(selectedIds);
        // Deep clone so future edits to the original don't mutate the clipboard
        const cloned = structuredClone(selectedShapes);

        clipboardRef.current = cloned;
        pasteCountRef.current = 0;

        // Also sync to system clipboard (non-blocking)
        navigator.clipboard
            ?.writeText(CLIPBOARD_PREFIX + JSON.stringify(cloned))
            .catch(() => {});
    };

    const pasteShapes = async () => {
        let itemsToPaste = clipboardRef.current;

        // Try reading from system clipboard first if available
        try {
            const text = await navigator.clipboard?.readText();
            if (text && text.startsWith(CLIPBOARD_PREFIX)) {
                itemsToPaste = JSON.parse(text.slice(CLIPBOARD_PREFIX.length));
            }
        } catch {
            // Fall back to internal clipboardRef in Tauri/restricted contexts
        }

        if (!itemsToPaste || itemsToPaste.length === 0) return;

        pasteCountRef.current += 1;
        const offset = pasteCountRef.current * 20;

        const { addShape, setSelectedIds } = useEditorState.getState();
        const newIds: string[] = [];

        for (const shape of itemsToPaste) {
            const newId = crypto.randomUUID();
            newIds.push(newId);

            addShape({
                ...structuredClone(shape),
                id: newId,
                x: shape.x + offset,
                y: shape.y + offset,
            });
        }

        // Automatically select the newly pasted shapes
        setSelectedIds(newIds);
    };

    // Copy (Ctrl+C / Cmd+C)
    useHotkeys(
        "mod+c",
        (e) => {
            e.preventDefault();
            copySelected();
        },
        { enableOnFormTags: false }
    );

    // Cut (Ctrl+X / Cmd+X)
    useHotkeys(
        "mod+x",
        (e) => {
            e.preventDefault();
            const { selectedIds, deleteShapes, setSelectedIds } = useEditorState.getState();
            if (selectedIds.length === 0) return;

            copySelected();
            deleteShapes(selectedIds);
            setSelectedIds([]);
        },
        { enableOnFormTags: false }
    );

    // Paste (Ctrl+V / Cmd+V)
    useHotkeys(
        "mod+v",
        (e) => {
            e.preventDefault();
            void pasteShapes();
        },
        { enableOnFormTags: false }
    );
}