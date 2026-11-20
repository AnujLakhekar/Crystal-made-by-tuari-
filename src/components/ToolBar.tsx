import { Toolbar } from "radix-ui";
import { DropdownMenu, Tooltip } from "@radix-ui/themes";
import {
    Trash2,
    Copy,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd
} from "lucide-react";
import useEditorState from "../store/EditorState.ts";
import { useDevice } from "../hooks/useDevice.ts";
import { StyleInspectorPanel, BorderStyleType } from "../components/Swatch.tsx"

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

    const itemSize = isMobile ? 44 : 32;
    const iconSize = 18;

    const primaryShape = shapes.find((s) => s.id === selectedIds[0]);

    const currentFill = (primaryShape?.props?.fill as string) ?? "transparent";
    const currentStroke = (primaryShape?.props?.stroke as string) ?? "#FFFFFF";
    const currentStrokeWidth = Number(primaryShape?.props?.strokeWidth ?? 0);
    const currentDash = primaryShape?.props?.dash as number[] | undefined;

    const currentBorderStyle: BorderStyleType =
        currentStrokeWidth === 0
            ? "none"
            : Array.isArray(currentDash) && currentDash.length > 0
                ? "dashed"
                : "solid";

    const updateSelectedProps = (patch: Record<string, unknown>) => {
        selectedIds.forEach((id) => {
            const shape = useEditorState.getState().shapes.find((s) => s.id === id);
            if (!shape) return;
            updateShape(id, {
                props: { ...shape.props, ...patch },
            });
        });
    };

    const handleBorderStyleChange = (style: BorderStyleType) => {
        if (style === "none") {
            updateSelectedProps({ strokeWidth: 0, dash: [] });
        } else if (style === "dashed") {
            updateSelectedProps({
                stroke: currentStroke === "transparent" ? "#FFFFFF" : currentStroke,
                strokeWidth: currentStrokeWidth > 0 ? currentStrokeWidth : 2,
                dash: [6, 6],
            });
        } else {
            updateSelectedProps({
                stroke: currentStroke === "transparent" ? "#FFFFFF" : currentStroke,
                strokeWidth: currentStrokeWidth > 0 ? currentStrokeWidth : 2,
                dash: [],
            });
        }
    };

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
        "inline-flex cursor-pointer items-center justify-center rounded text-[var(--gray-11)] outline-none hover:bg-[var(--gray-a4)] hover:text-[var(--gray-12)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)] data-[state=on]:bg-[var(--accent-a4)] data-[state=on]:text-[var(--accent-11)]";

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
            {/* Fill & Border Style Dropdown */}
            <DropdownMenu.Root>
                <Tooltip content="Style & Color">
                    <DropdownMenu.Trigger>
                        <Toolbar.Button
                            className={itemClass}
                            style={{ width: itemSize, height: itemSize }}
                            aria-label="Style and Color"
                        >
                            <span
                                className="w-4 h-4 rounded-full"
                                style={{
                                    backgroundColor:
                                        currentFill === "transparent"
                                            ? "transparent"
                                            : currentFill,
                                    border:
                                        currentStrokeWidth > 0 &&
                                        currentStroke !== "transparent"
                                            ? `2px solid ${currentStroke}`
                                            : "1.5px solid var(--gray-a8)",
                                }}
                            />
                        </Toolbar.Button>
                    </DropdownMenu.Trigger>
                </Tooltip>

                <DropdownMenu.Content
                    sideOffset={8}
                    className="!p-0 !bg-transparent !border-0 !shadow-none"
                >
                    <StyleInspectorPanel
                        fillColor={currentFill}
                        borderColor={currentStroke}
                        borderWidth={currentStrokeWidth}
                        borderStyle={currentBorderStyle}
                        onChangeFill={(fill) => updateSelectedProps({ fill })}
                        onChangeBorderColor={(stroke) =>
                            updateSelectedProps({
                                stroke,
                                strokeWidth:
                                    stroke === "transparent"
                                        ? 0
                                        : currentStrokeWidth > 0
                                            ? currentStrokeWidth
                                            : 2,
                            })
                        }
                        onChangeBorderWidth={(strokeWidth) =>
                            updateSelectedProps({
                                stroke:
                                    currentStroke === "transparent"
                                        ? "#FFFFFF"
                                        : currentStroke,
                                strokeWidth,
                                dash: currentBorderStyle === "dashed" ? [6, 6] : [],
                            })
                        }
                        onChangeBorderStyle={handleBorderStyleChange}
                    />
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <Toolbar.Separator className="mx-1 h-4 w-px bg-[var(--gray-a6)]" />

            {/* Single ToggleGroup: Canvas Alignment */}
            <Toolbar.ToggleGroup
                type="single"
                onValueChange={handleAlign}
                className="flex items-center gap-1"
                aria-label="Canvas alignment"
            >
                <Tooltip content="Align Left">
                    <Toolbar.ToggleItem
                        value="left"
                        className={itemClass}
                        style={{ width: itemSize, height: itemSize }}
                        aria-label="Align Left"
                    >
                        <AlignHorizontalJustifyStart size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>

                <Tooltip content="Align Center">
                    <Toolbar.ToggleItem
                        value="center"
                        className={itemClass}
                        style={{ width: itemSize, height: itemSize }}
                        aria-label="Align Center"
                    >
                        <AlignHorizontalJustifyCenter size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>

                <Tooltip content="Align Right">
                    <Toolbar.ToggleItem
                        value="right"
                        className={itemClass}
                        style={{ width: itemSize, height: itemSize }}
                        aria-label="Align Right"
                    >
                        <AlignHorizontalJustifyEnd size={iconSize} />
                    </Toolbar.ToggleItem>
                </Tooltip>
            </Toolbar.ToggleGroup>

            <Toolbar.Separator className="mx-1 h-4 w-px bg-[var(--gray-a6)]" />

            {/* Action Buttons: Duplicate & Delete */}
            <Tooltip content="Duplicate">
                <Toolbar.Button
                    onClick={handleDuplicate}
                    className={itemClass}
                    style={{ width: itemSize, height: itemSize }}
                    aria-label="Duplicate"
                >
                    <Copy size={iconSize} />
                </Toolbar.Button>
            </Tooltip>

            <Tooltip content="Delete (Del)">
                <Toolbar.Button
                    onClick={handleDelete}
                    className="inline-flex cursor-pointer items-center justify-center rounded text-red-500 outline-none hover:bg-red-500/15 focus-visible:ring-2 focus-visible:ring-red-500"
                    style={{ width: itemSize, height: itemSize }}
                    aria-label="Delete"
                >
                    <Trash2 size={iconSize} />
                </Toolbar.Button>
            </Tooltip>

            {/*<Toolbar.Separator className="mx-1 h-4 w-px bg-[var(--gray-a6)]" />*/}

            {/*<Tooltip content="more">*/}
            {/*    <Toolbar.Button*/}
            {/*        onClick={()}*/}
            {/*        className={itemClass}*/}
            {/*        style={{ width: itemSize, height: itemSize }}*/}
            {/*        aria-label="more"*/}
            {/*    >*/}
            {/*        <EllipsisVertical size={iconSize} />*/}
            {/*    </Toolbar.Button>*/}
            {/*</Tooltip>*/}
        </Toolbar.Root>
    );
}