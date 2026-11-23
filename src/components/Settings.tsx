import {
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    ScrollArea,
    Select,
    Separator,
    Slider,
    Switch,
    Text,
    TextField,
} from "@radix-ui/themes";
import {
    Settings as SettingsIcon,
    Monitor,
    PenTool,
    Scaling,
    RotateCcw,
    Gauge,
} from "lucide-react";
import { useState } from "react";
import useEditorState from "../store/EditorState.ts";

type SettingsSection = "canvas" | "pen" | "transformer" | "performance";

function SettingRow({
                        title,
                        description,
                        children,
                    }: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Flex
            direction={{ initial: "column", sm: "row" }}
            align={{ initial: "stretch", sm: "center" }}
            justify="between"
            gap={{ initial: "2", sm: "4" }}
            py="2"
        >
            <Box style={{ flex: 1 }}>
                <Text as="div" size="2" weight="medium">
                    {title}
                </Text>
                {description && (
                    <Text as="div" size="1" color="gray">
                        {description}
                    </Text>
                )}
            </Box>
            <Flex
                align="center"
                justify={{ initial: "end", sm: "start" }}
                gap="2"
                style={{ flexShrink: 0 }}
            >
                {children}
            </Flex>
        </Flex>
    );
}

export default function Settings() {
    const [section, setSection] = useState<SettingsSection>("canvas");

    const canvasConfig = useEditorState((s) => s.canvasConfig);
    const setCanvasConfig = useEditorState((s) => s.setCanvasConfig);

    const brushConfig = useEditorState((s) => s.brushConfig);
    const setBrushConfig = useEditorState((s) => s.setBrushConfig);

    const trConfig = useEditorState((s) => s.transformerConfig);
    const setTrConfig = useEditorState((s) => s.setTransformerConfig);

    const optimizerConfig = useEditorState((s) => s.optimizerConfig);
    const setOptimizerConfig = useEditorState((s) => s.setOptimizerConfig);

    const stage = useEditorState((s) => s.stage);
    const setStageTransform = useEditorState((s) => s.setStageTransform);
    const resetViewport = useEditorState((s) => s.resetViewport);

    const navItems: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
        { id: "canvas", label: "Canvas & Grid", icon: <Monitor size={15} /> },
        { id: "pen", label: "Pen & Ink", icon: <PenTool size={15} /> },
        { id: "transformer", label: "Transformer", icon: <Scaling size={15} /> },
        { id: "performance", label: "Performance", icon: <Gauge size={15} /> },
    ];

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <IconButton variant="ghost" color="gray" aria-label="Settings" className="cursor-pointer">
                    <SettingsIcon size={18} />
                </IconButton>
            </Dialog.Trigger>

            <Dialog.Content
                style={{
                    maxWidth: 680,
                    width: "94vw",
                    padding: 0,
                    overflow: "hidden",
                }}
            >
                <Flex
                    direction={{ initial: "column", md: "row" }}
                    className="h-[82vh] max-h-[540px] md:h-[480px]"
                >
                    {/* Navigation: Horizontal tabs on mobile, Left rail on desktop */}
                    <Flex
                        direction={{ initial: "row", md: "column" }}
                        align={{ initial: "center", md: "stretch" }}
                        justify="between"
                        p={{ initial: "2", md: "3" }}
                        className="shrink-0 border-b border-grayA-5 bg-gray-2 md:w-[190px] md:border-b-0 md:border-r"
                    >
                        <Flex
                            direction={{ initial: "row", md: "column" }}
                            gap="1"
                            className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <Text
                                size="2"
                                weight="bold"
                                className="hidden md:block"
                                style={{ padding: "4px 8px" }}
                            >
                                Preferences
                            </Text>
                            {navItems.map((item) => {
                                const active = section === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSection(item.id)}
                                        className={`flex shrink-0 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer md:justify-start md:gap-2 md:py-2 ${
                                            active
                                                ? "bg-accentA-4 text-accent-11"
                                                : "text-gray-11 hover:bg-grayA-3 hover:text-gray-12"
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </Flex>

                        <Text
                            size="1"
                            color="gray"
                            className="hidden md:block"
                            style={{ paddingLeft: 8 }}
                        >
                            {Math.round(stage.size.width)} × {Math.round(stage.size.height)} px
                        </Text>
                    </Flex>

                    {/* Right Settings Content */}
                    <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
                        <Box
                            px={{ initial: "4", md: "5" }}
                            pt={{ initial: "3", md: "4" }}
                            pb={{ initial: "2", md: "3" }}
                            className="border-b border-grayA-5"
                        >
                            <Dialog.Title size={{ initial: "3", md: "4" }} mb="1">
                                {navItems.find((n) => n.id === section)?.label}
                            </Dialog.Title>
                            <Dialog.Description size="1" color="gray">
                                Changes apply immediately to the active workspace.
                            </Dialog.Description>
                        </Box>

                        <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
                            <Flex direction="column" gap="2" px={{ initial: "4", md: "5" }} py="3">
                                {/* ─── 1. CANVAS & GRID ─── */}
                                {section === "canvas" && (
                                    <>
                                        <SettingRow
                                            title="Background Color"
                                            description="Stage backdrop fill color"
                                        >
                                            <Text size="1" color="gray" className="font-mono">
                                                {canvasConfig.backgroundColor.toUpperCase()}
                                            </Text>
                                            <input
                                                type="color"
                                                value={canvasConfig.backgroundColor}
                                                onChange={(e) =>
                                                    setCanvasConfig({ backgroundColor: e.target.value })
                                                }
                                                className="h-7 w-7 cursor-pointer rounded border border-grayA-6 bg-transparent"
                                            />
                                        </SettingRow>

                                        <Separator size="4" />

                                        <SettingRow
                                            title="Show Grid"
                                            description="Display alignment grid dots on canvas"
                                        >
                                            <Switch
                                                checked={canvasConfig.showGrid}
                                                onCheckedChange={(v) => setCanvasConfig({ showGrid: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Grid Spacing (${canvasConfig.gridSize}px)`}
                                            description="Distance between grid subdivisions"
                                        >
                                            <Slider
                                                className="w-full sm:w-[130px]"
                                                min={8}
                                                max={96}
                                                step={4}
                                                value={[canvasConfig.gridSize]}
                                                onValueChange={([v]) => setCanvasConfig({ gridSize: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Snap to Grid"
                                            description="Snap dragged shapes to nearest grid point"
                                        >
                                            <Switch
                                                checked={canvasConfig.snapToGrid}
                                                onCheckedChange={(v) => setCanvasConfig({ snapToGrid: v })}
                                            />
                                        </SettingRow>

                                        <Separator size="4" />

                                        <SettingRow
                                            title={`Zoom Level (${Math.round(stage.scale * 100)}%)`}
                                            description="Viewport magnification"
                                        >
                                            <Slider
                                                className="w-full sm:w-[110px]"
                                                min={10}
                                                max={400}
                                                step={10}
                                                value={[Math.round(stage.scale * 100)]}
                                                onValueChange={([v]) =>
                                                    setStageTransform(stage.position, v / 100)
                                                }
                                            />
                                            <IconButton
                                                size="1"
                                                variant="soft"
                                                color="gray"
                                                onClick={resetViewport}
                                                title="Reset Zoom"
                                            >
                                                <RotateCcw size={13} />
                                            </IconButton>
                                        </SettingRow>
                                    </>
                                )}

                                {/* ─── 2. PEN & INK ─── */}
                                {section === "pen" && (
                                    <>
                                        <SettingRow title="Default Ink Color" description="Active stroke fill color">
                                            <Text size="1" color="gray" className="font-mono">
                                                {brushConfig.stroke.toUpperCase()}
                                            </Text>
                                            <input
                                                type="color"
                                                value={brushConfig.stroke}
                                                onChange={(e) => setBrushConfig({ stroke: e.target.value })}
                                                className="h-7 w-7 cursor-pointer rounded border border-grayA-6 bg-transparent"
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Nib Size (${brushConfig.strokeWidth}px)`}
                                            description="Base diameter of freehand ink"
                                        >
                                            <Slider
                                                className="w-full sm:w-[140px]"
                                                min={1}
                                                max={48}
                                                step={1}
                                                value={[brushConfig.strokeWidth]}
                                                onValueChange={([v]) => setBrushConfig({ strokeWidth: v })}
                                            />
                                        </SettingRow>

                                        <Separator size="4" />

                                        <SettingRow
                                            title={`Velocity Thinning (${Math.round(brushConfig.thinning * 100)}%)`}
                                            description="0% = uniform fineliner, 70%+ = expressive brush"
                                        >
                                            <Slider
                                                className="w-full sm:w-[140px]"
                                                min={0}
                                                max={95}
                                                step={5}
                                                value={[Math.round(brushConfig.thinning * 100)]}
                                                onValueChange={([v]) => setBrushConfig({ thinning: v / 100 })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Smoothing (${Math.round(brushConfig.smoothing * 100)}%)`}
                                            description="Softens sharp corners along stroke edges"
                                        >
                                            <Slider
                                                className="w-full sm:w-[140px]"
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={[Math.round(brushConfig.smoothing * 100)]}
                                                onValueChange={([v]) => setBrushConfig({ smoothing: v / 100 })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Streamline (${Math.round(brushConfig.streamline * 100)}%)`}
                                            description="Stabilizes shaky mouse/hand movement"
                                        >
                                            <Slider
                                                className="w-full sm:w-[140px]"
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={[Math.round(brushConfig.streamline * 100)]}
                                                onValueChange={([v]) => setBrushConfig({ streamline: v / 100 })}
                                            />
                                        </SettingRow>

                                        <Separator size="4" />

                                        <SettingRow title="Taper Stroke Start" description="Pointed entry tip">
                                            <Switch
                                                checked={brushConfig.taperStart}
                                                onCheckedChange={(v) => setBrushConfig({ taperStart: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow title="Taper Stroke End" description="Pointed exit tail">
                                            <Switch
                                                checked={brushConfig.taperEnd}
                                                onCheckedChange={(v) => setBrushConfig({ taperEnd: v })}
                                            />
                                        </SettingRow>
                                    </>
                                )}

                                {/* ─── 4. PERFORMANCE ─── */}
                                {section === "performance" && (
                                    <>
                                        <SettingRow
                                            title="Performance Tier"
                                            description="Override auto-detected rendering quality — higher tiers use more GPU and CPU"
                                        >
                                            <Select.Root
                                                value={optimizerConfig.tier}
                                                onValueChange={(v) => setOptimizerConfig({ tier: v as any })}
                                            >
                                                <Select.Trigger
                                                    style={{
                                                        width: 140,
                                                        fontSize: 13,
                                                    }}
                                                />
                                                <Select.Content>
                                                    <Select.Item value="auto">Auto (recommended)</Select.Item>
                                                    <Select.Item value="low">Low</Select.Item>
                                                    <Select.Item value="medium">Medium</Select.Item>
                                                    <Select.Item value="high">High</Select.Item>
                                                </Select.Content>
                                            </Select.Root>
                                        </SettingRow>

                                        <Separator size="4" />

                                        <SettingRow
                                            title="What this affects"
                                            description="Grid density, pencil draft preview, shadow effects, max shapes, and rotation snapping"
                                        >
                                            <Text size="1" color="gray">—</Text>
                                        </SettingRow>
                                    </>
                                )}

                                {/* ─── 3. TRANSFORMER ─── */}
                                {section === "transformer" && (
                                    <>
                                        <SettingRow title="Selection Accent" description="Bounding box & handle stroke color">
                                            <input
                                                type="color"
                                                value={trConfig.borderStroke}
                                                onChange={(e) =>
                                                    setTrConfig({
                                                        borderStroke: e.target.value,
                                                        anchorStroke: e.target.value,
                                                    })
                                                }
                                                className="h-7 w-7 cursor-pointer rounded border border-grayA-6 bg-transparent"
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Border Width (${trConfig.borderStrokeWidth}px)`}
                                            description="Thickness of selection outline"
                                        >
                                            <Slider
                                                className="w-full sm:w-[130px]"
                                                min={1}
                                                max={5}
                                                step={0.5}
                                                value={[trConfig.borderStrokeWidth]}
                                                onValueChange={([v]) => setTrConfig({ borderStrokeWidth: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Anchor Size (${trConfig.anchorSize}px)`}
                                            description="Dimensions of corner resize handles"
                                        >
                                            <Slider
                                                className="w-full sm:w-[130px]"
                                                min={4}
                                                max={16}
                                                step={1}
                                                value={[trConfig.anchorSize]}
                                                onValueChange={([v]) => setTrConfig({ anchorSize: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Padding (${trConfig.padding}px)`}
                                            description="Gap between shape bounds and selection box"
                                        >
                                            <Slider
                                                className="w-full sm:w-[130px]"
                                                min={0}
                                                max={24}
                                                step={2}
                                                value={[trConfig.padding]}
                                                onValueChange={([v]) => setTrConfig({ padding: v })}
                                            />
                                        </SettingRow>

                                        <Separator size="4" />

                                        <SettingRow title="Enable Rotation" description="Show top rotation handle">
                                            <Switch
                                                checked={trConfig.rotateEnabled}
                                                onCheckedChange={(v) => setTrConfig({ rotateEnabled: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Rotation Snapping"
                                            description={`Snap every ${trConfig.rotationSnapStep}° while rotating`}
                                        >
                                            <Switch
                                                checked={trConfig.rotationSnapsEnabled}
                                                onCheckedChange={(v) =>
                                                    setTrConfig({ rotationSnapsEnabled: v })
                                                }
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Keep Aspect Ratio"
                                            description="Lock proportions when dragging corner handles"
                                        >
                                            <Switch
                                                checked={trConfig.keepRatio}
                                                onCheckedChange={(v) => setTrConfig({ keepRatio: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Centered Scaling"
                                            description="Scale symmetrically around shape center"
                                        >
                                            <Switch
                                                checked={trConfig.centeredScaling}
                                                onCheckedChange={(v) => setTrConfig({ centeredScaling: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Allow Flipping"
                                            description="Mirror shape when dragging handle past opposite edge"
                                        >
                                            <Switch
                                                checked={trConfig.flipEnabled}
                                                onCheckedChange={(v) => setTrConfig({ flipEnabled: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Ignore Stroke Width"
                                            description="Exclude stroke thickness from bounding box"
                                        >
                                            <Switch
                                                checked={trConfig.ignoreStroke}
                                                onCheckedChange={(v) => setTrConfig({ ignoreStroke: v })}
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title="Minimum Box Size"
                                            description="Smallest allowed width/height in px"
                                        >
                                            <TextField.Root
                                                size="1"
                                                type="number"
                                                style={{ width: 70 }}
                                                value={trConfig.minSize}
                                                onChange={(e) =>
                                                    setTrConfig({ minSize: Math.max(4, Number(e.target.value)) })
                                                }
                                            />
                                        </SettingRow>
                                    </>
                                )}
                            </Flex>
                        </ScrollArea>

                        <Flex
                            align="center"
                            justify="between"
                            px={{ initial: "4", md: "5" }}
                            py={{ initial: "2", md: "3" }}
                            className="border-t border-grayA-5"
                        >
                            <Text size="1" color="gray" className="md:hidden">
                                {Math.round(stage.size.width)} × {Math.round(stage.size.height)} px
                            </Text>
                            <Dialog.Close>
                                <Button variant="soft" color="gray" className="ml-auto cursor-pointer">
                                    Done
                                </Button>
                            </Dialog.Close>
                        </Flex>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}