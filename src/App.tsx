import { useRef } from "react";
import { Box, Grid, IconButton } from "@radix-ui/themes";
import { PanelLeft } from "lucide-react";
import StageKonva from "./components/Stage.tsx";
import Sidebar from "./components/Sidebar.tsx";
import RightSidebar from "./components/RightSidebar.tsx";
import { UpdateBanner } from "./components/UpdateBanner.tsx";
import { useDevice } from "./hooks/useDevice.ts";
import useInterface from "./store/InterfaceState.ts";

export default function App() {
    const stageWrapperRef = useRef<HTMLDivElement>(null);
    const { isMobile } = useDevice();

    const sidebarVisibility = useInterface((s) => s.sidebarVisibility);
    const setSidebarVisibility = useInterface((s) => s.setSidebarVisibility);

    return (
        <Grid
            columns={{ initial: "1", md: "auto 1fr auto" }}
            rows="1"
            height="100vh"
            width="100vw"
            className="overflow-hidden"
        >
            {/* Mobile top-left toggle */}
            {isMobile && (
                <div className="fixed left-4 top-4 z-[9998] flex h-8 w-8 items-center justify-center rounded-md border border-[var(--gray-a6)] bg-[var(--color-panel-solid)] shadow-sm">
                    <IconButton
                        size="1"
                        variant="ghost"
                        color="gray"
                        aria-label="Toggle sidebar"
                        onClick={() => setSidebarVisibility(true)}
                        className="cursor-pointer"
                    >
                        <PanelLeft size={16} />
                    </IconButton>
                </div>
            )}

            {/* Desktop left sidebar */}
            {!isMobile && <Sidebar />}

            {/* Mobile sidebar overlay drawer */}
            {isMobile && sidebarVisibility && (
                <>
                    <Box
                        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                        className="bg-black/50 backdrop-blur-[1px]"
                        onClick={() => setSidebarVisibility(false)}
                    />
                    <Sidebar
                        open={sidebarVisibility}
                        onOpenChange={setSidebarVisibility}
                        mobile={true}
                    />
                </>
            )}

            {/* Main Konva Canvas */}
            <Box ref={stageWrapperRef} width="100%" height="100%" className="relative overflow-hidden">
                <StageKonva />
            </Box>

            {/* Desktop right sidebar (rendered outside the mobile-only block) */}
            {!isMobile && <RightSidebar  />}

            {/* Auto-updater toast notification */}
            <UpdateBanner />
        </Grid>
    );
}