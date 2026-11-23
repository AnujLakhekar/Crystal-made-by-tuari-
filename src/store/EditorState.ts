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


export interface CanvasConfig {
    backgroundColor: string;
    showGrid: boolean;
    gridSize: number;
    snapToGrid: boolean;
}


export interface BrushConfig {
    stroke: string;
    strokeWidth: number;
    tension: number;
    thinning: number;
    smoothing: number;
    streamline: number;
    taperStart: boolean;
    taperEnd: boolean;
}


export interface TransformerConfig {
    borderStroke: string;
    borderStrokeWidth: number;
    anchorStroke: string;
    anchorStrokeWidth: number;
    anchorSize: number;
    padding: number;
    rotateEnabled: boolean;
    rotationSnapsEnabled: boolean;
    rotationSnapStep: number;
    keepRatio: boolean;
    centeredScaling: boolean;
    flipEnabled: boolean;
    ignoreStroke: boolean;
    minSize: number;
}

export type PerfTier = "auto" | "low" | "medium" | "high";

export interface OptimizerConfig {
    tier: PerfTier;
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
        position: { x: number; y: number };
        scale: number;
    };
    bringToFront: (ids: string[]) => void;
    sendToBack: (ids: string[]) => void;
    canvasConfig: CanvasConfig;
    setCanvasConfig: (patch: Partial<CanvasConfig>) => void;
    brushConfig: BrushConfig;
    setBrushConfig: (patch: Partial<BrushConfig>) => void;
    transformerConfig: TransformerConfig;
    setTransformerConfig: (patch: Partial<TransformerConfig>) => void;
    optimizerConfig: OptimizerConfig;
    setOptimizerConfig: (patch: Partial<OptimizerConfig>) => void;
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void,
    setStageTransform: (position: { x: number; y: number }, scale: number) => void;
    resetViewport: () => void;

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
    getShapesByIds: (ids: string[]) => BaseShape[];
    getShapesById: (id: string) => BaseShape | undefined;
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
    subscribeWithSelector((set, get) => ({
        shapes: [],
        selectedIds: [],

        stage: {
            size: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            position: {x: 0, y: 0},
            scale: 1,
        },
        activeTool: TOOLS.CURSOR,
        canvasConfig: {
            backgroundColor: "#18181b",
            showGrid: true,
            gridSize: 24,
            snapToGrid: false,
        },
        brushConfig: {
            stroke: "#ffffff",
            strokeWidth: 4,
            tension: 0.4,
            thinning: 0.55,
            smoothing: 0.5,
            streamline: 0.5,
            taperStart: false,
            taperEnd: false,
        },
        transformerConfig: {
            borderStroke: "#888888",
            borderStrokeWidth: 1.5,
            anchorStroke: "#888888",
            anchorStrokeWidth: 1.5,
            anchorSize: 8,
            padding: 6,
            rotateEnabled: true,
            rotationSnapsEnabled: true,
            rotationSnapStep: 15,
            keepRatio: false,
            centeredScaling: false,
            flipEnabled: true,
            ignoreStroke: false,
            minSize: 10,
        },
        optimizerConfig: {
            tier: "auto",
        },
        setStageTransform: (position, scale) =>
            set((state) => ({
                stage: {
                    ...state.stage,
                    position,
                    scale,
                },
            })),

        resetViewport: () =>
            set((state) => ({
                stage: {
                    ...state.stage,
                    position: {x: 0, y: 0},
                    scale: 1,
                },
            })),
        getShapesById: (id: string) => {
            return get().shapes.find((shape) => shape.id === id);
        },
        getShapesByIds: (ids) => {
            const idSet = new Set(ids);
            return get().shapes.filter((s) => idSet.has(s.id))
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
        setCanvasConfig: (patch) =>
            set((state) => ({
                canvasConfig: {...state.canvasConfig, ...patch},
            })),
        setBrushConfig: (patch) =>
            set((state) => ({
                brushConfig: {...state.brushConfig, ...patch},
            })),
        setTransformerConfig: (patch) =>
            set((state) => ({
                transformerConfig: {...state.transformerConfig, ...patch},
            })),
        setOptimizerConfig: (patch) =>
            set((state) => ({
                optimizerConfig: {...state.optimizerConfig, ...patch},
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