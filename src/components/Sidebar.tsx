import { Box, Container, Flex, IconButton } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import useEditorState from "../store/EditorState.ts";

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const stageResize = useEditorState((s) => s.stageResize); // No () here!

    useEffect(() => {
        const width = sidebarOpen ? window.innerWidth - 250 : window.innerWidth - 48;
        stageResize(width, window.innerHeight);
    }, [sidebarOpen, stageResize]);

    return (
        <Box
            className="bg-gray-2"
            display={{ initial: "none", md: "block" }}
            width={sidebarOpen ? "250px" : "48px"}
            style={{ transition: "width 150ms ease" }}
        >
            <Container size="1" p="2">
                <Flex align={"start"} p={"2"} direction="column" gap="2">
                    <IconButton
                        variant="ghost"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                    >
                        <PanelLeft size={18} />
                    </IconButton>

                    {sidebarOpen && (
                        <Box>
                            {/* Sidebar content */}

                        </Box>
                    )}
                </Flex>
            </Container>
        </Box>
    );
}