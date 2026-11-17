import {CursorArrowIcon, BoxIcon, SquareIcon, CircleIcon} from "@radix-ui/react-icons";
import {useHistory} from "../hooks/useHistory.ts";
import {Flex, IconButton, Popover, Separator, Text, Tooltip, Slider} from "@radix-ui/themes";
import {Eclipse, Undo2, Redo2, Pencil, Paintbrush, StrokeLineJoinRound} from "lucide-react";
import {TOOLS, ToolType} from "../store/EditorState.ts";
import useEditorState from "../store/EditorState.ts";

const BRUSH_COLORS = [
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
];

const STROKE_SIZES = [2, 4, 8, 14];

export interface ToolTipProps {
    activeTool: ToolType | null;
    handleChangeState: (tool: ToolType) => void;
    onAddShape?: (type: "Rect" | "Circle") => void;
}

export default function ToolTip({activeTool, handleChangeState, onAddShape}: ToolTipProps) {
    const {canUndo, canRedo, undo, redo} = useHistory(true);
    const isPencilActive = activeTool === TOOLS.PENCIL;

    const brushConfig = useEditorState((s) => s.brushConfig);
    const setBrushConfig = useEditorState((s) => s.setBrushConfig);

    return (
        <Flex
            align="center"
            justify="center"
            gap="2"
            p="2"
            style={{
                width: "max-content",
                backgroundColor: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a6)",
                borderRadius: "var(--radius-4)",
                boxShadow: "var(--shadow-4)",
            }}
        >
            <Tooltip content="Cursor">
                <IconButton
                    size="2"
                    variant={activeTool === TOOLS.CURSOR ? "solid" : "soft"}
                    color={activeTool === TOOLS.CURSOR ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.CURSOR)}
                >
                    <CursorArrowIcon width="16" height="16"/>
                </IconButton>
            </Tooltip>

            <Tooltip content="Pencil">
                <IconButton
                    size="2"
                    variant={isPencilActive ? "solid" : "soft"}
                    color={isPencilActive ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.PENCIL)}
                >
                    <Pencil size={16}/>
                </IconButton>
            </Tooltip>

            {/* Animated Painting Sub-tools Drawer */}
            <div className="tool-drawer" data-open={isPencilActive}>
                <div className="tool-drawer-inner">
                    <Separator orientation="vertical" size="2"/>

                    {/* 1. Brush Color Popover */}
                    <Popover.Root>
                        <Tooltip content="Brush Color">
                            <Popover.Trigger>
                                <IconButton size="2" variant="soft" color="gray">
                                    <Paintbrush color={brushConfig.stroke} size={16}/>
                                </IconButton>
                            </Popover.Trigger>
                        </Tooltip>

                        <Popover.Content side="top" sideOffset={20} size="1">
                            <Flex direction="column" gap="2">
                                <Text size="1" weight="bold" color="gray">
                                    Brush Color
                                </Text>
                                <Flex gap="1" wrap="wrap" style={{maxWidth: 140}}>
                                    {BRUSH_COLORS.map((hex) => (
                                        <button
                                            key={hex}
                                            type="button"
                                            onClick={() => setBrushConfig({stroke: hex})}
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: "999px",
                                                backgroundColor: hex,
                                                cursor: "pointer",
                                                border:
                                                    brushConfig.stroke === hex
                                                        ? "2px solid var(--accent-9)"
                                                        : "1px solid var(--gray-a6)",
                                            }}
                                            aria-label={`Color ${hex}`}
                                        />
                                    ))}
                                </Flex>

                                {/* Custom Hex Picker */}
                                <Flex align="center" justify="between" gap="2" pt="1">
                                    <Text size="1" color="gray">
                                        Custom
                                    </Text>
                                    <input
                                        type="color"
                                        value={brushConfig.stroke}
                                        onChange={(e) => setBrushConfig({stroke: e.target.value})}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                        }}
                                    />
                                </Flex>
                            </Flex>
                        </Popover.Content>
                    </Popover.Root>

                    {/* 2. Stroke Size Popover */}
                    <Popover.Root>
                        <Tooltip content={`Stroke Size (${brushConfig.strokeWidth}px)`}>
                            <Popover.Trigger>
                                <IconButton size="2" variant="soft" color="gray">
                                    <StrokeLineJoinRound size={18}/>
                                </IconButton>
                            </Popover.Trigger>
                        </Tooltip>

                        <Popover.Content side="top" sideOffset={20} size="1">
                            <Flex direction="column" gap="2" style={{width: 160}}>
                                <Flex justify="between" align="center">
                                    <Text size="1" weight="bold" color="gray">
                                        Stroke Size
                                    </Text>
                                    <Text size="1" color="gray">
                                        {brushConfig.strokeWidth}px
                                    </Text>
                                </Flex>

                                {/* Preset Dots */}
                                <Flex gap="1" justify="between">
                                    {STROKE_SIZES.map((size) => (
                                        <IconButton
                                            key={size}
                                            size="1"
                                            variant={brushConfig.strokeWidth === size ? "solid" : "soft"}
                                            color={brushConfig.strokeWidth === size ? undefined : "gray"}
                                            onClick={() => setBrushConfig({strokeWidth: size})}
                                        >
                                            <div
                                                style={{
                                                    width: Math.min(size + 2, 14),
                                                    height: Math.min(size + 2, 14),
                                                    borderRadius: "999px",
                                                    backgroundColor: "currentColor",
                                                }}
                                            />
                                        </IconButton>
                                    ))}
                                </Flex>

                                {/* Fine-grained Slider */}
                                <Slider
                                    size="1"
                                    min={1}
                                    max={32}
                                    value={[brushConfig.strokeWidth]}
                                    onValueChange={([val]) => setBrushConfig({strokeWidth: val})}
                                />
                            </Flex>
                        </Popover.Content>
                    </Popover.Root>

                    <Separator orientation="vertical" size="2"/>
                </div>
            </div>

            <Tooltip content="Select">
                <IconButton
                    size="2"
                    variant={activeTool === TOOLS.SELECT ? "solid" : "soft"}
                    color={activeTool === TOOLS.SELECT ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.SELECT)}
                >
                    <BoxIcon width="16" height="16"/>
                </IconButton>
            </Tooltip>

            <Popover.Root>
                <Popover.Trigger>
                    <IconButton
                        size="2"
                        variant={activeTool === TOOLS.SHAPE ? "solid" : "soft"}
                        color={activeTool === TOOLS.SHAPE ? undefined : "gray"}
                        onClick={() => handleChangeState(TOOLS.SHAPE)}
                    >
                        <Eclipse size="16"/>
                    </IconButton>
                </Popover.Trigger>

                <Popover.Content side="top" sideOffset={20} size="1">
                    <Flex direction="column" gap="2">
                        <Text size="1" weight="bold" color="gray">
                            Add Shape
                        </Text>
                        <Flex gap="2">
                            <IconButton
                                size="2"
                                variant="soft"
                                onClick={() => onAddShape?.("Rect")}
                            >
                                <SquareIcon width="16" height="16"/>
                            </IconButton>

                            <IconButton
                                size="2"
                                variant="soft"
                                onClick={() => onAddShape?.("Circle")}
                            >
                                <CircleIcon width="16" height="16"/>
                            </IconButton>
                        </Flex>
                    </Flex>
                </Popover.Content>
            </Popover.Root>

            <Separator orientation="vertical" size="2"/>

            <Tooltip content="Undo (Ctrl+Z)">
                <IconButton
                    size="2"
                    variant="soft"
                    color="gray"
                    disabled={!canUndo}
                    onClick={undo}
                >
                    <Undo2 size={16}/>
                </IconButton>
            </Tooltip>

            <Tooltip content="Redo (Ctrl+Y)">
                <IconButton
                    size="2"
                    variant="soft"
                    color="gray"
                    disabled={!canRedo}
                    onClick={redo}
                >
                    <Redo2 size={16}/>
                </IconButton>
            </Tooltip>
        </Flex>
    );
}