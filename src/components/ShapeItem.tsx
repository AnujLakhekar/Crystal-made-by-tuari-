import {memo} from "react";
import {Rect, Circle, Path} from "react-konva";
import Konva from "konva";
import useEditorState, {BaseShape} from "../store/EditorState.ts";
import {TOOLS, ToolType} from "../store/EditorState.ts";
import {useMemo} from "react";
import {getFreehandPath} from "../core/strokeGeometry.ts"


interface ShapeItemProps {
    el: BaseShape;
    activeTool: ToolType;
    onUpdate: (id: string, patch: Partial<BaseShape>) => void;
    hitStrokeWidth?: number;
}

const ShapeItem = memo(function ShapeItem({el, activeTool, onUpdate, hitStrokeWidth = 12}: ShapeItemProps) {
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
            const {selectedIds, setSelectedIds, setActiveTool} = useEditorState.getState();

            setActiveTool(TOOLS.CURSOR)

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

    const pathData = useMemo(() => {
        if (el.type !== "Freehand") return "";
        return getFreehandPath(el.props.rawPoints as number[][], {
            size: Number(el.props.strokeWidth ?? 6),
            thinning: Number(el.props.thinning ?? 0.55),
            smoothing: Number(el.props.smoothing ?? 0.3),
            streamline: Number(el.props.streamline ?? 0.5),
            start: { taper: Boolean(el.props.taperStart ?? false), cap: true },
            end: { taper: Boolean(el.props.taperEnd ?? true), cap: true },
        });
    }, [el.type, el.props.rawPoints, el.props.strokeWidth, el.props.thinning, el.props.smoothing, el.props.streamline, el.props.taperStart, el.props.taperEnd]);


    switch (el.type) {
        case "Rect":
            return <Rect {...commonProps} />;
        case "Circle":
            return <Circle {...commonProps} />;
        case "Freehand":
            return (
                <Path
                    {...commonProps}
                    data={pathData}
                    fill={String(el.props.stroke ?? "#ffffff")}
                    stroke={undefined}
                    strokeWidth={0}
                    hitStrokeWidth={hitStrokeWidth}
                />
            );
        default:
            return null;
    }
});

export default ShapeItem;