import { Box, Flex, IconButton, Separator, Text, TextField } from "@radix-ui/themes";
import {
    ArrowDown,
    ArrowDownToLine,
    ArrowUp,
    ArrowUpToLine,
    ChevronDown,
    ChevronRight,
    Copy,
    CopyPlus,
    FileCode2,
    Frame,
    Group,
    Image,
    Layers,
    Trash2,
    X,
} from "lucide-react";
import { useRef } from "react";
import useEditorState, { BaseShape } from "../store/EditorState.ts";

export interface Props {
    selectedIds: string[];
    shape: BaseShape;
}

export default function PropertiesBox({ shape, selectedIds }: Props) {
    const isSelected = selectedIds.includes(shape.id);
    const isExpanded = isSelected && selectedIds.length === 1;
    const colorInputRef = useRef<HTMLInputElement>(null);

    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);
    const deleteShapes = useEditorState((s) => s.deleteShapes);
    const shapes = useEditorState((s) => s.shapes ?? []);

    const rawFill = shape.props?.fill;
    const fillColor = typeof rawFill === "string" ? rawFill : "";
    const hasVisibleFill = fillColor !== "" && fillColor !== "transparent";

    const moveLayer = (direction: "front" | "forward" | "backward" | "back") => {
        const index = shapes.findIndex((s) => s.id === shape.id);
        if (index === -1) return;
        const next = [...shapes];
        const [item] = next.splice(index, 1);

        if (direction === "front") next.push(item);
        else if (direction === "back") next.unshift(item);
        else if (direction === "forward") next.splice(Math.min(next.length, index + 1), 0, item);
        else if (direction === "backward") next.splice(Math.max(0, index - 1), 0, item);

        useEditorState.setState({ shapes: next });
    };

    const handleDuplicate = () => {
        const copy: BaseShape = {
            ...shape,
            id: crypto.randomUUID(),
            x: shape.x + 20,
            y: shape.y + 20,
            props: { ...shape.props },
        };
        addShape(copy);
        setSelectedIds?.([copy.id]);
    };

    const handleCopyJson = () => {
        navigator.clipboard?.writeText(JSON.stringify(shape, null, 2));
    };

    const handleCopyMarkdown = () => {
        const md = `- **${shape.type}** (\`${shape.id.slice(0, 6)}\`) — X: ${Math.round(shape.x)}, Y: ${Math.round(shape.y)}`;
        navigator.clipboard?.writeText(md);
    };

    return (
        <Box
            className={`rounded-md transition-colors ${
                isExpanded
                    ? "border border-grayA-6 bg-gray-3/80"
                    : isSelected
                        ? "bg-grayA-4 text-gray-12"
                        : "hover:bg-grayA-3 text-gray-11"
            }`}
        >
            {/* ─── CLEAN LAYER ROW ─── */}
            <button
                type="button"
                onClick={() => setSelectedIds?.(isExpanded ? [] : [shape.id])}
                className="flex w-full items-center justify-between px-2 py-1.5 text-left cursor-pointer"
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    {isExpanded ? (
                        <ChevronDown size={12} className="shrink-0 text-gray-11" />
                    ) : (
                        <ChevronRight size={12} className="shrink-0 text-gray-10" />
                    )}
                    <span
                        className={`truncate text-xs font-medium ${
                            isSelected ? "text-gray-12" : "text-gray-11"
                        }`}
                    >
                        {shape.type}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && !isExpanded && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-9" />
                    )}
                    {hasVisibleFill && (
                        <span
                            className="h-3 w-3 rounded-[3px] border border-white/15 shadow-xs"
                            style={{ backgroundColor: fillColor }}
                        />
                    )}
                </div>
            </button>

            {/* ─── SINGLE-SHAPE INSPECTOR ─── */}
            {isExpanded && (
                <div className="flex flex-col gap-2.5 border-t border-grayA-4 px-2.5 py-2.5">
                    {/* Position */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-10">
                            Position
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                            <TextField.Root
                                size="1"
                                type="number"
                                value={Math.round(shape.x)}
                                onChange={(e) => updateShape?.(shape.id, { x: Number(e.target.value) })}
                            >
                                <TextField.Slot>
                                    <span className="text-[10px] font-medium text-gray-10">X</span>
                                </TextField.Slot>
                            </TextField.Root>

                            <TextField.Root
                                size="1"
                                type="number"
                                value={Math.round(shape.y)}
                                onChange={(e) => updateShape?.(shape.id, { y: Number(e.target.value) })}
                            >
                                <TextField.Slot>
                                    <span className="text-[10px] font-medium text-gray-10">Y</span>
                                </TextField.Slot>
                            </TextField.Root>
                        </div>
                    </div>

                    {/* Appearance / Fill */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-10">
                            Fill
                        </span>
                        <button
                            type="button"
                            onClick={() => colorInputRef.current?.click()}
                            className="flex h-7 w-full items-center justify-between rounded border border-grayA-5 bg-grayA-2 px-2 text-xs hover:border-grayA-7 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3.5 w-3.5 rounded-[3px] border border-white/20"
                                    style={{
                                        backgroundColor: hasVisibleFill ? fillColor : "transparent",
                                    }}
                                />
                                <span className="font-mono text-[11px] text-gray-12 uppercase">
                                    {hasVisibleFill ? fillColor : "None"}
                                </span>
                            </div>
                            <input
                                ref={colorInputRef}
                                type="color"
                                value={hasVisibleFill ? fillColor : "#3b82f6"}
                                onChange={(e) =>
                                    updateShape?.(shape.id, {
                                        props: { ...shape.props, fill: e.target.value },
                                    })
                                }
                                className="sr-only"
                            />
                        </button>
                    </div>

                    <Separator size="4" />

                    {/* Arrange */}
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-10">Arrange</span>
                        <Flex gap="1">
                            <IconButton size="1" variant="ghost" color="gray" title="Bring to Front" onClick={() => moveLayer("front")} className="cursor-pointer">
                                <ArrowUpToLine size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Bring Forward" onClick={() => moveLayer("forward")} className="cursor-pointer">
                                <ArrowUp size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Send Backward" onClick={() => moveLayer("backward")} className="cursor-pointer">
                                <ArrowDown size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Send to Back" onClick={() => moveLayer("back")} className="cursor-pointer">
                                <ArrowDownToLine size={13} />
                            </IconButton>
                        </Flex>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-10">Actions</span>
                        <Flex gap="1">
                            <IconButton size="1" variant="ghost" color="gray" title="Frame section" onClick={() => {}} className="cursor-pointer">
                                <Frame size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Group section" onClick={() => {}} className="cursor-pointer">
                                <Group size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Copy JSON" onClick={handleCopyJson} className="cursor-pointer">
                                <Copy size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Copy as Image" onClick={() => {}} className="cursor-pointer">
                                <Image size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Copy as Markdown" onClick={handleCopyMarkdown} className="cursor-pointer">
                                <FileCode2 size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="gray" title="Duplicate" onClick={handleDuplicate} className="cursor-pointer">
                                <CopyPlus size={13} />
                            </IconButton>
                            <IconButton size="1" variant="ghost" color="red" title="Delete" onClick={() => deleteShapes([shape.id])} className="cursor-pointer">
                                <Trash2 size={13} />
                            </IconButton>
                        </Flex>
                    </div>
                </div>
            )}
        </Box>
    );
}

/* ─── UNIFIED GROUP / MULTI-SELECT INSPECTOR ─── */
export function MultiPropertiesBox({ shapes }: { shapes: BaseShape[] }) {
    const colorInputRef = useRef<HTMLInputElement>(null);

    const updateShape = useEditorState((s) => s.updateShape);
    const addShape = useEditorState((s) => s.addShape);
    const deleteShapes = useEditorState((s) => s.deleteShapes);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const allShapes = useEditorState((s) => s.shapes ?? []);

    const selectedSet = new Set(shapes.map((s) => s.id));
    const minX = Math.min(...shapes.map((s) => s.x));
    const minY = Math.min(...shapes.map((s) => s.y));

    // Check if all selected shapes share the same fill color
    const firstFill = typeof shapes[0]?.props?.fill === "string" ? shapes[0].props.fill : "";
    const allSameFill = shapes.every((s) => s.props?.fill === firstFill);
    const sharedFill = allSameFill && firstFill && firstFill !== "transparent" ? firstFill : null;

    const handleGroupMove = (axis: "x" | "y", nextVal: number) => {
        const delta = nextVal - (axis === "x" ? minX : minY);
        if (Number.isNaN(delta) || delta === 0) return;
        shapes.forEach((s) => {
            updateShape?.(s.id, { [axis]: s[axis] + delta });
        });
    };

    const handleGroupFill = (color: string) => {
        shapes.forEach((s) => {
            updateShape?.(s.id, { props: { ...s.props, fill: color } });
        });
    };

    const handleGroupLayer = (direction: "front" | "back") => {
        const unselected = allShapes.filter((s) => !selectedSet.has(s.id));
        const selectedOrdered = allShapes.filter((s) => selectedSet.has(s.id));
        const next =
            direction === "front"
                ? [...unselected, ...selectedOrdered]
                : [...selectedOrdered, ...unselected];
        useEditorState.setState({ shapes: next });
    };

    const handleGroupDuplicate = () => {
        const newIds: string[] = [];
        shapes.forEach((s) => {
            const id = crypto.randomUUID();
            newIds.push(id);
            addShape({
                ...s,
                id,
                x: s.x + 20,
                y: s.y + 20,
                props: { ...s.props },
            });
        });
        setSelectedIds?.(newIds);
    };

    const handleGroupCopy = () => {
        navigator.clipboard?.writeText(JSON.stringify(shapes, null, 2));
    };

    return (
        <Box className="mb-1 rounded-md border border-grayA-6 bg-gray-3/80 p-2.5">
            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-accent-11" />
                    <Text size="1" weight="bold" className="text-gray-12">
                        {shapes.length} Selected
                    </Text>
                </div>
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    title="Deselect all"
                    onClick={() => setSelectedIds?.([])}
                    className="cursor-pointer"
                >
                    <X size={12} />
                </IconButton>
            </div>

            <div className="flex flex-col gap-2.5">
                {/* Group Position */}
                <div className="grid grid-cols-2 gap-1.5">
                    <TextField.Root
                        size="1"
                        type="number"
                        value={Math.round(minX)}
                        onChange={(e) => handleGroupMove("x", Number(e.target.value))}
                    >
                        <TextField.Slot>
                            <span className="text-[10px] font-medium text-gray-10">X</span>
                        </TextField.Slot>
                    </TextField.Root>

                    <TextField.Root
                        size="1"
                        type="number"
                        value={Math.round(minY)}
                        onChange={(e) => handleGroupMove("y", Number(e.target.value))}
                    >
                        <TextField.Slot>
                            <span className="text-[10px] font-medium text-gray-10">Y</span>
                        </TextField.Slot>
                    </TextField.Root>
                </div>

                {/* Custom Fill Swatch Row */}
                <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="flex h-7 w-full items-center justify-between rounded border border-grayA-5 bg-grayA-2 px-2 text-xs hover:border-grayA-7 cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="h-3.5 w-3.5 rounded-[3px] border border-white/20"
                            style={{
                                background: sharedFill
                                    ? sharedFill
                                    : "linear-gradient(135deg, #3b82f6 50%, #ec4899 50%)",
                            }}
                        />
                        <span className="font-mono text-[11px] text-gray-12 uppercase">
                            {sharedFill ?? "Mixed"}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-10">Fill</span>
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={sharedFill ?? "#3b82f6"}
                        onChange={(e) => handleGroupFill(e.target.value)}
                        className="sr-only"
                    />
                </button>

                <Separator size="4" />

                {/* Group Actions */}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-10">Actions</span>
                    <Flex gap="1">
                        <IconButton size="1" variant="ghost" color="gray" title="Bring Group to Front" onClick={() => handleGroupLayer("front")} className="cursor-pointer">
                            <ArrowUpToLine size={13} />
                        </IconButton>
                        <IconButton size="1" variant="ghost" color="gray" title="Send Group to Back" onClick={() => handleGroupLayer("back")} className="cursor-pointer">
                            <ArrowDownToLine size={13} />
                        </IconButton>
                        <IconButton size="1" variant="ghost" color="gray" title="Copy Selected" onClick={handleGroupCopy} className="cursor-pointer">
                            <Copy size={13} />
                        </IconButton>
                        <IconButton size="1" variant="ghost" color="gray" title="Duplicate Selected" onClick={handleGroupDuplicate} className="cursor-pointer">
                            <CopyPlus size={13} />
                        </IconButton>
                        <IconButton size="1" variant="ghost" color="red" title="Delete Selected" onClick={() => deleteShapes(shapes.map((s) => s.id))} className="cursor-pointer">
                            <Trash2 size={13} />
                        </IconButton>
                    </Flex>
                </div>
            </div>
        </Box>
    );
}