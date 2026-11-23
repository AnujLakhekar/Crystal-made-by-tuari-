import {
    Badge,
    Box,
    Flex,
    IconButton,
    Text,
} from "@radix-ui/themes";
import { useState } from "react";
import {
    Layers,
    MousePointer,
    PanelRight,
    PanelRightClose,
    SlidersHorizontal,
} from "lucide-react";
import useEditorState from "../store/EditorState.ts";
import PropertiesBox, { MultiPropertiesBox } from "./PropertiesBox.tsx";

export default function RightSidebar({
                                         open: externalOpen,
                                         onOpenChange,
                                         mobile = false,
                                     }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mobile?: boolean;
}) {
    const [internalOpen, setInternalOpen] = useState(true);
    const sidebarOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setSidebarOpen =
        externalOpen !== undefined
            ? (v: boolean | ((prev: boolean) => boolean)) => {
                const next = typeof v === "function" ? v(sidebarOpen) : v;
                onOpenChange?.(next);
            }
            : setInternalOpen;

    const shapes = useEditorState((s) => s.shapes ?? []);
    const selectedIds = useEditorState((s) => s.selectedIds ?? []);

    // Only show selected shapes in the sidebar
    const selectedShapes = shapes.filter((s) => selectedIds.includes(s.id));

    const width = mobile ? "280px" : sidebarOpen ? "280px" : "48px";

    return (
        <Box
            display={mobile ? "block" : { initial: "none", md: "block" }}
            width={width}
            height="100vh"
            className={
                mobile
                    ? "bg-gray-2"
                    : "shrink-0 overflow-hidden border-l border-grayA-5 bg-gray-2"
            }
            style={{
                transition: "width 200ms ease",
                ...(mobile
                    ? {
                        position: "fixed",
                        right: 0,
                        top: 0,
                        zIndex: 9999,
                        borderLeft: "1px solid var(--gray-a6)",
                    }
                    : {}),
            }}
        >
            <Flex direction="column" height="100%">
                {/* ─── TOP HEADER ─── */}
                <Flex
                    direction="column"
                    gap="1"
                    px="2"
                    pt="2"
                    pb="1"
                    className="border-b border-grayA-5"
                >
                    <Flex
                        align="center"
                        justify={sidebarOpen ? "between" : "center"}
                        width="100%"
                        gap="2"
                    >
                        {sidebarOpen && (
                            <Flex align="center" gap="2" style={{ flex: 1 }}>
                                <Box
                                    className="flex h-6 w-6 items-center justify-center rounded-md bg-accentA-3 text-accent-11"
                                >
                                    <SlidersHorizontal size={14} />
                                </Box>
                                <Text size="2" weight="bold" truncate>
                                    Properties
                                </Text>
                                {selectedIds.length > 0 && (
                                    <Badge
                                        variant="soft"
                                        color="gray"
                                        size="1"
                                        style={{ fontSize: 10 }}
                                    >
                                        {selectedIds.length}
                                    </Badge>
                                )}
                            </Flex>
                        )}

                        <IconButton
                            variant="ghost"
                            color="gray"
                            aria-label="Toggle properties sidebar"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="cursor-pointer shrink-0"
                            size="1"
                        >
                            {mobile ? (
                                <PanelRightClose size={16} />
                            ) : (
                                <PanelRight size={16} />
                            )}
                        </IconButton>
                    </Flex>
                </Flex>

                {/* ─── COLLAPSED ICONS ─── */}
                {!sidebarOpen && (
                    <Flex
                        direction="column"
                        align="center"
                        gap="2"
                        py="3"
                        style={{ flex: 1 }}
                    >
                        <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            title="Layers"
                            className="cursor-pointer"
                        >
                            <Layers size={16} />
                        </IconButton>
                        <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            title="Selection"
                            className="cursor-pointer"
                        >
                            <MousePointer size={16} />
                        </IconButton>
                    </Flex>
                )}

                {/* ─── SCROLLABLE PROPERTIES AREA ─── */}
                {sidebarOpen ? (
                    <Box
                        style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: shapes.length > 5 ? "auto" : "visible",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                        className="[&::-webkit-scrollbar]:hidden"
                    >
                        <Flex direction="column" gap="1.5" px="1" py="1">
                            {/* Single unified inspector when 2+ shapes are selected */}
                            {selectedShapes.length > 1 && (
                                <MultiPropertiesBox shapes={selectedShapes} />
                            )}

                            {/* Individual shape rows (only auto-expands when 1 shape is selected) */}
                            {shapes.map((s) => (
                                <PropertiesBox
                                    key={s.id}
                                    shape={s}
                                    selectedIds={selectedIds}
                                />
                            ))}
                        </Flex>
                    </Box>
                ) : (
                    <Box style={{ flex: 1 }} />
                )}

                {/* ─── FOOTER ─── */}
                {sidebarOpen && (
                    <Flex
                        align="center"
                        justify="between"
                        px="2"
                        py="2"
                        className="border-t border-grayA-5"
                    >
                        <Text size="1" className="text-gray-9">
                            {shapes.length} shape{shapes.length !== 1 ? "s" : ""}
                        </Text>
                        <Text size="1" className="text-gray-9">
                            {selectedIds.length} selected
                        </Text>
                    </Flex>
                )}
            </Flex>
        </Box>
    );
}