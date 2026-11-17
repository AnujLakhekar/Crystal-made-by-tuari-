import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";
import {enablePatches, produceWithPatches, applyPatches, Patch} from "immer";


enablePatches();

export enum TOOLS {
    CURSOR = "CURSOR",
    SELECT = "SELECT",
    SHAPE = "SHAPE",
    PENCIL = "PENCIL",
}


export interface BrushConfig {
    stroke: string;
    strokeWidth: number;
    tension: number;
}


export type ToolType = `${TOOLS}`;


export interface BaseShape {
    id: string;
    type: string;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    props: Record<string, unknown>;
}

export interface HistoryCommand {
    label: string;
    patches: Patch[];
    inversePatches: Patch[];
}

export interface EditorState {
    // Document state (tracked by undo/redo)
    shapes: BaseShape[];
    // Ephemeral UI state (NOT tracked by undo/redo)
    selectedIds: string[];
    stage: {
        size: {
            width: number;
            height: number;
        };
    };
    bringToFront: (ids: string[]) => void;
    sendToBack: (ids: string[]) => void;
    brushConfig: BrushConfig;
    setBrushConfig: (patch: Partial<BrushConfig>) => void;
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void,

    // Undo / Redo Stacks
    past: HistoryCommand[];
    future: HistoryCommand[];
    canUndo: boolean;
    canRedo: boolean;

    // Shape Commands
    addShape: (shape: BaseShape) => void;
    updateShape: (id: string, patch: Partial<BaseShape>) => void;
    deleteShapes: (ids: string[]) => void;

    // History Actions
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;

    // UI Actions
    setSelectedIds: (ids: string[]) => void;
    stageResize: (width?: number, height?: number) => void;
}

const MAX_HISTORY = 50;


function executeCommand(
    set: (fn: (state: EditorState) => Partial<EditorState>) => void,
    label: string,
    recipe: (draftShapes: BaseShape[]) => void
) {
    set((state) => {
        const [nextShapes, patches, inversePatches] = produceWithPatches(
            state.shapes,
            recipe
        );

        // If nothing actually changed (e.g., clicked a shape without moving it), skip recording
        if (patches.length === 0) return {};

        const nextPast = [
            ...state.past.slice(-(MAX_HISTORY - 1)),
            {label, patches, inversePatches},
        ];

        return {
            shapes: nextShapes,
            past: nextPast,
            future: [],
            canUndo: true,
            canRedo: false,
        };
    });
}

const useEditorState = create<EditorState>()(
    subscribeWithSelector((set) => ({
        shapes: [],
        selectedIds: [],
        stage: {
            size: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
        },
        activeTool: TOOLS.CURSOR,
        brushConfig: {
            stroke: "#ffffff",
            strokeWidth: 4,
            tension: 0.4,
        },
        bringToFront: (ids) =>
            executeCommand(set, "Bring to Front", (draft) => {
                const moving = draft.filter((s) => ids.includes(s.id));
                const rest = draft.filter((s) => !ids.includes(s.id));
                draft.splice(0, draft.length, ...rest, ...moving);
            }),

        sendToBack: (ids) =>
            executeCommand(set, "Send to Back", (draft) => {
                const moving = draft.filter((s) => ids.includes(s.id));
                const rest = draft.filter((s) => !ids.includes(s.id));
                draft.splice(0, draft.length, ...moving, ...rest);
            }),
        setBrushConfig: (patch) =>
            set((state) => ({
                brushConfig: {...state.brushConfig, ...patch},
            })),

        past: [],
        future: [],
        canUndo: false,
        canRedo: false,

        // --- Commands ---
        setActiveTool: (tool: ToolType) => set({
            activeTool: tool,
        }),
        addShape: (shape) =>
            executeCommand(set, `Add ${shape.type}`, (draft) => {
                draft.push(shape);
            }),

        updateShape: (id, patch) =>
            executeCommand(set, "Update Shape", (draft) => {
                const target = draft.find((s) => s.id === id);
                if (target) {
                    Object.assign(target, patch);
                }
            }),

        deleteShapes: (ids) =>
            executeCommand(set, "Delete Shapes", (draft) => {
                for (let i = draft.length - 1; i >= 0; i--) {
                    if (ids.includes(draft[i].id)) {
                        draft.splice(i, 1);
                    }
                }
            }),

        // --- Undo / Redo ---
        undo: () =>
            set((state) => {
                if (state.past.length === 0) return {};

                const command = state.past[state.past.length - 1];
                const nextPast = state.past.slice(0, -1);
                const nextShapes = applyPatches(state.shapes, command.inversePatches);
                const nextFuture = [command, ...state.future];

                return {
                    shapes: nextShapes,
                    past: nextPast,
                    future: nextFuture,
                    selectedIds: [], // Clear selection so Transformer doesn't point to deleted nodes
                    canUndo: nextPast.length > 0,
                    canRedo: true,
                };
            }),

        redo: () =>
            set((state) => {
                if (state.future.length === 0) return {};

                const [command, ...nextFuture] = state.future;
                const nextShapes = applyPatches(state.shapes, command.patches);
                const nextPast = [...state.past, command];

                return {
                    shapes: nextShapes,
                    past: nextPast,
                    future: nextFuture,
                    selectedIds: [],
                    canUndo: true,
                    canRedo: nextFuture.length > 0,
                };
            }),

        clearHistory: () =>
            set({
                past: [],
                future: [],
                canUndo: false,
                canRedo: false,
            }),

        // --- Ephemeral UI Actions ---
        setSelectedIds: (ids) => set({selectedIds: ids}),

        stageResize: (width = window.innerWidth, height = window.innerHeight) =>
            set((state) => ({
                stage: {
                    ...state.stage,
                    size: {width, height},
                },
            })),
    }))
);

export default useEditorState;