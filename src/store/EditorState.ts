import {create} from "zustand"
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
}

const useEditorState = create<EditorState>()(
    subscribeWithSelector((set) => ({
        shapes: [],
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
    }))
);

export default useEditorState