import { Toolbar } from "radix-ui";
import { Tooltip } from "@radix-ui/themes";
import {
    Trash2,
    Copy,
    Palette,
    Square,
    Sparkles,
    Minus,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
} from "lucide-react";
import useEditorState from "../store/EditorState.ts";
import Konva from "konva";
import { useDevice } from "../hooks/useDevice.ts";

export interface SelectionToolbarProps {
    x: number;
    y: number;
}

export default function SelectionToolbar({ x, y }: SelectionToolbarProps) {
    const shapes = useEditorState((s) => s.shapes);
    const selectedIds = useEditorState((s) => s.selectedIds);
    const deleteShapes = useEditorState((s) => s.deleteShapes);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);
    const stageWidth = useEditorState((s) => s.stage.size.width);
    const { isMobile } = useDevice();

    // Touch-friendly button size
    const itemSize = isMobile ? 44 : 32;
    const iconSize = isMobile ? 18 : 18;

    // Inspect the first selected shape to reflect active toggle states
    const primaryShape = shapes.find((s) => s.id === selectedIds[0]);

    // 1. Multiple ToggleGroup values (active styles on selected shape)
    const activeStyles: string[] = [];
    if (primaryShape?.props?.strokeWidth) activeStyles.push("stroke");
    if (Array.isArray(primaryShape?.props?.dash) && primaryShape.props.dash.length > 0) {
        activeStyles.push("dashed");
    }
    if (primaryShape?.props?.shadowBlur) activeStyles.push("shadow");

    const handleStyleToggle = (values: string[]) => {
        const hasStroke = values.includes("stroke");
        const hasDashed = values.includes("dashed");
        const hasShadow = values.includes("shadow");

        selectedIds.forEach((id) => {
            const shape = useEditorState.getState().shapes.find((s) => s.id === id);
            if (!shape) return;

            updateShape(id, {
                props: {
                    ...shape.props,
                    stroke: hasStroke || hasDashed ? "#ffffff" : undefined,
                    strokeWidth: hasStroke || hasDashed ? 2 : 0,
                    dash: hasDashed ? [6, 6] : [],
                    shadowColor: hasShadow ? "rgba(0,0,0,0.6)" : undefined,
                    shadowBlur: hasShadow ? 12 : 0,
                    shadowOffsetY: hasShadow ? 4 : 0,
                },
            });
        });
    };

    // 2. Single ToggleGroup value (horizontal alignment on canvas)
    const handleAlign = (alignment: string) => {
        if (!alignment) return;

        selectedIds.forEach((id) => {
            const shape = useEditorState.getState().shapes.find((s) => s.id === id);
            if (!shape) return;

            const width =
                shape.type === "Rect"
                    ? Number(shape.props.width ?? 100) * shape.scaleX
                    : Number(shape.props.radius ?? 50) * 2 * shape.scaleX;

            const offset = shape.type === "Circle" ? width / 2 : 0;

            let nextX = shape.x;
            if (alignment === "left") nextX = 24 + offset;
            if (alignment === "center") nextX = stageWidth / 2 - width / 2 + offset;
            if (alignment === "right") nextX = stageWidth - width - 24 + offset;

            updateShape(id, { x: nextX });
        });
    };

    const handleRandomColor = () => {
        const newColor = Konva.Util.getRandomColor();
        selectedIds.forEach((id) => {
            const shape = useEditorState.getState().shapes.find((s) => s.id === id);
            if (shape) {
                updateShape(id, {
                    props: { ...shape.props, fill: newColor },
                });
            }
        });
    };

    const handleDuplicate = () => {
        const newIds: string[] = [];
        selectedIds.forEach((id) => {
            const orig = useEditorState.getState().shapes.find((s) => s.id === id);
            if (!orig) return;
            const copyId = crypto.randomUUID();
            newIds.push(copyId);
            addShape({
                ...orig,
                id: copyId,
                x: orig.x + 20,
                y: orig.y + 20,
                props: { ...orig.props },
            });
        });
        setSelectedIds(newIds);
    };

    const handleDelete = () => {
        deleteShapes(selectedIds);
        setSelectedIds([]);
    };

    const itemClass =
        `inline-flex h-[${itemSize}px] w-[${itemSize}px] cursor-pointer items-center justify-center rounded text-[var(--gray-11)] outline-none hover:bg-[var(--gray-a4)] hover:text-[var(--gray-12)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)] data-[state=on]:bg-[var(--accent-a4)] data-[state=on]:text-[var(--accent-11)]`;

    return (
        <Toolbar.Root
            aria-label="Shape formatting options"
            className="flex min-w-max items-center gap-1 p-1.5"
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                transform: "translateX(-50%)",
                zIndex: 50,
                backgroundColor: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a6)",
                borderRadius: "var(--radius-4)",
                boxShadow: "var(--shadow-4)",
            }}
        >
            {/* Fill Color */}
            <Tooltip content="Random Fill">
                <Toolbar.Button onClick={handleRandomColor} className={itemClass} aria-label="Random Fill">
                    <Palette size={iconSize} />
                </Toolbar.Button>
            </Tooltip>

            <Toolbar.Separator className="mx-1 h-4 w-px bg-[var(--gray-a6)]" />


            {/* Multiple ToggleGroup: Border, Dashed, Shadow */}
            <Toolbar.ToggleGroup
                type="multiple"
                value={activeStyles}
                onValueChange={handleStyleToggle}
                className="flex items-center gap-1"
                aria-label="Shape styles"
            >
                <Tooltip content="Toggle Border">
                    <Toolbar.ToggleItem value="stroke" className={itemClass} aria-label="Border">
                        <Square size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>

                <Tooltip content="Dashed Border">
                    <Toolbar.ToggleItem value="dashed" className={itemClass} aria-label="Dashed">
                        <Minus size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>

                <Tooltip content="Drop Shadow">
                    <Toolbar.ToggleItem value="shadow" className={itemClass} aria-label="Shadow">
                        <Sparkles size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>
            </Toolbar.ToggleGroup>

            <Toolbar.Separator className="mx-1 h-4 w-px bg-[var(--gray-a6)]" />

            {/* Single ToggleGroup: Canvas Alignment */}
            <Toolbar.ToggleGroup
                type="single"
                onValueChange={handleAlign}
                className="flex items-center gap-1"
                aria-label="Canvas alignment"
            >
                <Tooltip content="Align Left">
                    <Toolbar.ToggleItem value="left" className={itemClass} aria-label="Align Left">
                        <AlignHorizontalJustifyStart size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>

                <Tooltip content="Align Center">
                    <Toolbar.ToggleItem value="center" className={itemClass} aria-label="Align Center">
                        <AlignHorizontalJustifyCenter size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>

                <Tooltip content="Align Right">
                    <Toolbar.ToggleItem value="right" className={itemClass} aria-label="Align Right">
                        <AlignHorizontalJustifyEnd size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>
            </Toolbar.ToggleGroup>

            <Toolbar.Separator className="mx-1 h-4 w-px bg-[var(--gray-a6)]" />

            {/* Action Buttons: Duplicate & Delete */}
            <Tooltip content="Duplicate">
                <Toolbar.Button onClick={handleDuplicate} className={itemClass} aria-label="Duplicate">
                    <Copy size={iconSize} />
                </Toolbar.Button>
            </Tooltip>

            <Tooltip content="Delete (Del)">
                <Toolbar.Button
                    onClick={handleDelete}
                    className={`inline-flex h-[${itemSize}px] w-[${itemSize}px] cursor-pointer items-center justify-center rounded text-red-500 outline-none hover:bg-red-500/15 focus-visible:ring-2 focus-visible:ring-red-500`}
                    aria-label="Delete"
                >
                    <Trash2 size={iconSize} />
                </Toolbar.Button>
            </Tooltip>
        </Toolbar.Root>
    );
}