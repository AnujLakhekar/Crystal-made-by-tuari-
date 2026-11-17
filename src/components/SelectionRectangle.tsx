import { Rect } from "react-konva";

interface SelectionRectangleProps {
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Renders the drag-to-select marquee rectangle on the canvas.
 */
export function SelectionRectangle({ visible, x1, y1, x2, y2 }: SelectionRectangleProps) {
    if (!visible) return null;

    return (
        <Rect
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={1}
            listening={false}
        />
    );
}
