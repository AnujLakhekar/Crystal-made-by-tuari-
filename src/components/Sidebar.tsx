import {Box, Flex, IconButton, Text} from "@radix-ui/themes";
import {useEffect, useState} from "react";
import {PanelLeft, PanelLeftClose} from "lucide-react";
import useEditorState from "../store/EditorState.ts";
import {ThemeToggle} from "../hooks/useTheme.tsx";
import Settings from "./Settings.tsx";

export default function Sidebar({
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
    const setSidebarOpen = externalOpen !== undefined
        ? (v: boolean | ((prev: boolean) => boolean)) => {
            const next = typeof v === "function" ? v(sidebarOpen) : v;
            onOpenChange?.(next);
        }
        : setInternalOpen;
    const stageResize = useEditorState((s) => s.stageResize);

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = window.innerWidth >= 768;
            const sidebarWidth = !isDesktop ? 0 : sidebarOpen ? 250 : 48;
            stageResize(window.innerWidth - sidebarWidth, window.innerHeight);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [sidebarOpen, stageResize]);

    // On mobile, sidebar is a full-height overlay drawer — always fully open
    const width = mobile ? "250px" : sidebarOpen ? "250px" : "48px";

    return (
        <Box
            display={mobile ? "block" : {initial: "none", md: "block"}}
            width={width}
            height="100vh"
            className={mobile ? "" : "shrink-0 overflow-hidden border-r border-[var(--gray-a6)] bg-[var(--gray-2)]"}
            style={{
                transition: "width 150ms ease",
                ...(mobile ? {
                    position: "fixed",
                    left: 0,
                    top: 0,
                    zIndex: 9999,
                    borderRight: "2px solid #333",
                } : {}),
            }}
        >
            <Flex direction="column" justify="between" height="100%" p="2">
                {/* Top Section */}
                <Flex direction="column" gap="2" p="1">
                    <Flex
                        align="center"
                        justify={sidebarOpen ? "between" : "center"}
                        width="100%"
                    >
                        {sidebarOpen && (
                            <Text size="2" weight="bold" truncate>
                                Workspace
                            </Text>
                        )}
                        <IconButton
                            variant="ghost"
                            color="gray"
                            aria-label="Toggle sidebar"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                        >
                            {mobile ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                        </IconButton>
                    </Flex>

                    {sidebarOpen && (
                        <Box width="100%">
                            {/* Sidebar content */}
                        </Box>
                    )}
                </Flex>

                {/* Bottom Section */}
                <Flex
                    align="center"
                    justify={sidebarOpen ? "between" : "center"}
                    gap="2"
                    p="1"
                    pb="2"
                >
                    {sidebarOpen && (
                        <Text size="2" weight="medium" truncate>
                            AnujLakhekar
                        </Text>
                    )}
                    <Flex align={"center"} gap={"2"}>
                        {sidebarOpen && (<ThemeToggle/>)}
                        <Settings/>
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
}