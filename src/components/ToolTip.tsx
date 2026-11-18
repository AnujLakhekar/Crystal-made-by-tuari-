import {CursorArrowIcon, BoxIcon, SquareIcon, CircleIcon} from "@radix-ui/react-icons";
import {useHistory} from "../hooks/useHistory.ts";
import {Flex, IconButton, Popover, Separator, Text, Tooltip, Slider} from "@radix-ui/themes";
import {Eclipse, Undo2, Redo2, Pencil, Paintbrush, StrokeLineJoinRound, Hand} from "lucide-react";
import {TOOLS, ToolType} from "../store/EditorState.ts";
import useEditorState from "../store/EditorState.ts";
import {useDevice} from "../hooks/useDevice.ts";

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
    mobilePanMode?: boolean;
    onToggleMobilePan?: () => void;
}

export default function ToolTip({activeTool, handleChangeState, onAddShape, mobilePanMode, onToggleMobilePan}: ToolTipProps) {
    const {canUndo, canRedo, undo, redo} = useHistory(true);
    const isPencilActive = activeTool === TOOLS.PENCIL;
    const {isMobile} = useDevice();

    const brushConfig = useEditorState((s) => s.brushConfig);
    const setBrushConfig = useEditorState((s) => s.setBrushConfig);

    // Touch-friendly button size
    const btnSize = isMobile ? "2" : "2";
    const mobileBtnMin = 36; // px — smaller touch target that fits more per row
    const mobileIcon = 16;   // px — icon size on mobile

    return (
        <Flex
            align="center"
            justify="center"
            gap={isMobile ? "1" : "1"}
            p={isMobile ? "2" : "2"}
            style={{
                width: isMobile ? undefined : "max-content",
                maxWidth: isMobile ? "calc(100vw - 32px)" : undefined,
                flexWrap: isMobile ? "wrap" : undefined,
                justifyContent: isMobile ? "center" : undefined,
                backgroundColor: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a6)",
                borderRadius: "var(--radius-4)",
                boxShadow: "var(--shadow-4)",
            }}
        >
            {isMobile && (
                <>
                    <Tooltip content={mobilePanMode ? "Pan Mode ON" : "Pan Mode OFF"}>
                        <IconButton
                            size={btnSize}
                            variant={mobilePanMode ? "solid" : "soft"}
                            color={mobilePanMode ? "blue" : "gray"}
                            onClick={onToggleMobilePan}
                            style={{minWidth: mobileBtnMin, minHeight: mobileBtnMin}}
                        >
                            <Hand size={mobileIcon}/>
                        </IconButton>
                    </Tooltip>
                    <Separator orientation="vertical" size="2"/>
                </>
            )}

            <Tooltip content="Cursor">
                <IconButton
                    size={btnSize}
                    variant={activeTool === TOOLS.CURSOR ? "solid" : "soft"}
                    color={activeTool === TOOLS.CURSOR ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.CURSOR)}
                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                >
                    <CursorArrowIcon width={mobileIcon} height={mobileIcon}/>
                </IconButton>
            </Tooltip>

            <Tooltip content="Pencil">
                <IconButton
                    size={btnSize}
                    variant={isPencilActive ? "solid" : "soft"}
                    color={isPencilActive ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.PENCIL)}
                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                >
                    <Pencil size={mobileIcon}/>
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
                                <IconButton size={btnSize} variant="soft" color="gray"
                                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                                >
                                    <Paintbrush color={brushConfig.stroke} size={mobileIcon}/>
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
                                                width: isMobile ? 28 : 22,
                                                height: isMobile ? 28 : 22,
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
                                            width: isMobile ? 30 : 24,
                                            height: isMobile ? 30 : 24,
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
                                <IconButton size={btnSize} variant="soft" color="gray"
                                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                                >
                                    <StrokeLineJoinRound size={mobileIcon}/>
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
                    size={btnSize}
                    variant={activeTool === TOOLS.SELECT ? "solid" : "soft"}
                    color={activeTool === TOOLS.SELECT ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.SELECT)}
                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                >
                    <BoxIcon width={mobileIcon} height={mobileIcon}/>
                </IconButton>
            </Tooltip>

            <Popover.Root>
                <Popover.Trigger>
                    <IconButton
                        size={btnSize}
                        variant={activeTool === TOOLS.SHAPE ? "solid" : "soft"}
                        color={activeTool === TOOLS.SHAPE ? undefined : "gray"}
                        onClick={() => handleChangeState(TOOLS.SHAPE)}
                        style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                    >
                        <Eclipse size={mobileIcon}/>
                    </IconButton>
                </Popover.Trigger>

                <Popover.Content side="top" sideOffset={20} size="1">
                    <Flex direction="column" gap="2">
                        <Text size="1" weight="bold" color="gray">
                            Add Shape
                        </Text>
                        <Flex gap="2">
                            <IconButton
                                size={btnSize}
                                variant="soft"
                                onClick={() => onAddShape?.("Rect")}
                                style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                            >
                                <SquareIcon width={mobileIcon} height={mobileIcon}/>
                            </IconButton>

                            <IconButton
                                size={btnSize}
                                variant="soft"
                                onClick={() => onAddShape?.("Circle")}
                                style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                            >
                                <CircleIcon width={mobileIcon} height={mobileIcon}/>
                            </IconButton>
                        </Flex>
                    </Flex>
                </Popover.Content>
            </Popover.Root>

            <Separator orientation="vertical" size="2"/>

            <Tooltip content="Undo (Ctrl+Z)">
                <IconButton
                    size={btnSize}
                    variant="soft"
                    color="gray"
                    disabled={!canUndo}
                    onClick={undo}
                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                >
                    <Undo2 size={mobileIcon}/>
                </IconButton>
            </Tooltip>

            <Tooltip content="Redo (Ctrl+Y)">
                <IconButton
                    size={btnSize}
                    variant="soft"
                    color="gray"
                    disabled={!canRedo}
                    onClick={redo}
                    style={isMobile ? {minWidth: mobileBtnMin, minHeight: mobileBtnMin} : undefined}
                >
                    <Redo2 size={mobileIcon}/>
                </IconButton>
            </Tooltip>
        </Flex>
    );
}