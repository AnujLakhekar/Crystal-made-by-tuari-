import {memo} from "react";
import {Rect, Circle, Line} from "react-konva";
import Konva from "konva";
import useEditorState, {BaseShape} from "../store/EditorState.ts";
import {TOOLS, ToolType} from "../store/EditorState.ts";


interface ShapeItemProps {
    el: BaseShape;
    activeTool: ToolType;
    onUpdate: (id: string, patch: Partial<BaseShape>) => void;
}

const ShapeItem = memo(function ShapeItem({el, activeTool, onUpdate}: ShapeItemProps) {
    const commonProps = {
        id: el.id,
        name: "shape",
        x: el.x,
        y: el.y,
        rotation: el.rotation,
        scaleX: el.scaleX,
        scaleY: el.scaleY,
        strokeScaleEnabled: false,
        draggable: activeTool === TOOLS.CURSOR,
        onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
            const {selectedIds, setSelectedIds} = useEditorState.getState();

            if (e.evt.shiftKey) {
                setSelectedIds(
                    selectedIds.includes(el.id)
                        ? selectedIds.filter((id) => id !== el.id)
                        : [...selectedIds, el.id]
                );
            } else {
                setSelectedIds([el.id]);
            }
        },
        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
            onUpdate(el.id, {
                x: e.target.x(),
                y: e.target.y(),
            });
        },
        onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
            const node = e.target;
            onUpdate(el.id, {
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
            });
        },
        ...el.props,
    };

    switch (el.type) {
        case "Rect":
            return <Rect {...commonProps} />;
        case "Circle":
            return <Circle {...commonProps} />;
        case  "Line":
            return <Line {...commonProps}
                         hitStrokeWidth={12}
                         lineCap="round"
                         lineJoin="round"
                         tension={0.4}/>
        default:
            return null;
    }
});

export default ShapeItem;