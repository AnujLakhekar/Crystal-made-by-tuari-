import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";

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

export interface EditorState {
    shapes: BaseShape[];
    addShape: (shape: BaseShape) => void;
    updateShape: (id: string, patch: Partial<BaseShape>) => void;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    stage: {
        size: {
            width: number;
            height: number;
        };
    };
    stageResize: (width?: number, height?: number) => void;
}

const useEditorState = create<EditorState>()(
    subscribeWithSelector((set) => ({
        shapes: [],
        stage: {
            size: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
        },

        stageResize: (width = window.innerWidth, height = window.innerHeight) =>
            set((state) => ({
                stage: {
                    ...state.stage,
                    size: {
                        width,
                        height,
                    },
                },
            })),

        addShape: (shape) =>
            set((state) => ({
                shapes: [...state.shapes, shape],
            })),

        updateShape: (id, patch) =>
            set((state) => ({
                shapes: state.shapes.map((s) =>
                    s.id === id ? {...s, ...patch} : s
                ),
            })),
        selectedIds: [],
        setSelectedIds: (ids) => set({selectedIds: ids}),
    }))
);

export default useEditorState;