import {
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    ScrollArea,
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
} from "lucide-react";
import { useState } from "react";
import useEditorState from "../store/EditorState.ts";

type SettingsSection = "canvas" | "pen" | "transformer";

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
        <Flex align="center" justify="between" gap="4" py="2">
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
            <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
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

    const stage = useEditorState((s) => s.stage);
    const setStageTransform = useEditorState((s) => s.setStageTransform);
    const resetViewport = useEditorState((s) => s.resetViewport);

    const navItems: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
        { id: "canvas", label: "Canvas & Grid", icon: <Monitor size={15} /> },
        { id: "pen", label: "Pen & Ink", icon: <PenTool size={15} /> },
        { id: "transformer", label: "Transformer", icon: <Scaling size={15} /> },
    ];

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <IconButton variant="ghost" color="gray" aria-label="Settings">
                    <SettingsIcon size={18} />
                </IconButton>
            </Dialog.Trigger>

            <Dialog.Content
                style={{
                    maxWidth: 680,
                    padding: 0,
                    overflow: "hidden",
                }}
            >
                <Flex style={{ height: 480 }}>
                    {/* Left Navigation Rail */}
                    <Flex
                        direction="column"
                        justify="between"
                        p="3"
                        style={{
                            width: 190,
                            backgroundColor: "var(--gray-2)",
                            borderRight: "1px solid var(--gray-a5)",
                        }}
                    >
                        <Flex direction="column" gap="1">
                            <Text size="2" weight="bold" style={{ padding: '4px 8px' }}>
                                Preferences
                            </Text>
                            {navItems.map((item) => {
                                const active = section === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSection(item.id)}
                                        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                                            active
                                                ? "bg-[var(--accent-a4)] text-[var(--accent-11)]"
                                                : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)]"
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </Flex>

                        <Text size="1" color="gray" style={{ paddingLeft: 8 }}>
                            {Math.round(stage.size.width)} × {Math.round(stage.size.height)} px
                        </Text>
                    </Flex>

                    {/* Right Settings Content */}
                    <Flex direction="column" style={{ flex: 1 }}>
                        <Box px="5" pt="4" pb="3" style={{ borderBottom: "1px solid var(--gray-a5)" }}>
                            <Dialog.Title size="4" mb="1">
                                {navItems.find((n) => n.id === section)?.label}
                            </Dialog.Title>
                            <Dialog.Description size="1" color="gray">
                                Changes apply immediately to the active workspace.
                            </Dialog.Description>
                        </Box>

                        <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
                            <Flex direction="column" gap="2" px="5" py="3">
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
                                                className="h-7 w-7 cursor-pointer rounded border border-[var(--gray-a6)] bg-transparent"
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
                                                style={{ width: 130 }}
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
                                                style={{ width: 110 }}
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
                                                className="h-7 w-7 cursor-pointer rounded border border-[var(--gray-a6)] bg-transparent"
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Nib Size (${brushConfig.strokeWidth}px)`}
                                            description="Base diameter of freehand ink"
                                        >
                                            <Slider
                                                style={{ width: 140 }}
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
                                                style={{ width: 140 }}
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
                                                style={{ width: 140 }}
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
                                                style={{ width: 140 }}
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
                                                className="h-7 w-7 cursor-pointer rounded border border-[var(--gray-a6)] bg-transparent"
                                            />
                                        </SettingRow>

                                        <SettingRow
                                            title={`Border Width (${trConfig.borderStrokeWidth}px)`}
                                            description="Thickness of selection outline"
                                        >
                                            <Slider
                                                style={{ width: 130 }}
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
                                                style={{ width: 130 }}
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
                                                style={{ width: 130 }}
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
                            justify="end"
                            px="5"
                            py="3"
                            style={{ borderTop: "1px solid var(--gray-a5)" }}
                        >
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
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
