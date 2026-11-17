import { useCallback, useEffect, useRef, useState } from "react";
import Konva from "konva";
import useEditorState from "../store/EditorState.ts";

interface ToolbarPosition {
    visible: boolean;
    x: number;
    y: number;
}

/**
 * Syncs the Konva Transformer with the currently selected shapes
 * and tracks the floating selection toolbar position above the selection.
 */
export function useTransformer() {
    const trRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);

    const selectedIds = useEditorState((s) => s.selectedIds);
    const shapes = useEditorState((s) => s.shapes);

    const [toolbarPos, setToolbarPos] = useState<ToolbarPosition>({
        visible: false,
        x: 0,
        y: 0,
    });

    const syncTransformerNodes = useCallback(() => {
        const tr = trRef.current;
        const stage = stageRef.current;
        if (!tr || !stage) return;

        const nodes = selectedIds
            .map((id) => stage.findOne(`#${id}`))
            .filter((node): node is Konva.Node => Boolean(node));

        tr.nodes(nodes);
        tr.getLayer()?.batchDraw();
    }, [selectedIds]);

    const updateToolbarPosition = useCallback(() => {
        const tr = trRef.current;
        if (!tr || selectedIds.length === 0) {
            setToolbarPos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            return;
        }

        const box = tr.getClientRect();
        setToolbarPos({
            visible: true,
            x: box.x + box.width / 2,
            y: Math.max(16, box.y - 48),
        });
    }, [selectedIds]);

    useEffect(() => {
        syncTransformerNodes();
        updateToolbarPosition();
    }, [selectedIds, shapes, syncTransformerNodes, updateToolbarPosition]);

    return {
        trRef,
        stageRef,
        toolbarPos,
        updateToolbarPosition,
    };
}
