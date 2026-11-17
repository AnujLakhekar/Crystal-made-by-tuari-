import { useRef} from "react";
import {Box, Grid} from "@radix-ui/themes";
import StageKonvas from "./components/Stage.tsx";
import Sidebar from "./components/Sidebar.tsx";

export default function App() {
    const stageWrapperRef = useRef<HTMLDivElement>(null);

    return (
        <Grid
            columns={{initial: "1", md: "250px 1fr"}}
            rows="1"
            height="100vh"
            width="100vw"
            className="overflow-hidden"
        >
            <Sidebar/>
            <Box ref={stageWrapperRef} width="100%" height="100%" className="overflow-hidden">
                <StageKonvas width={window.innerWidth} height={window.innerHeight}/>
            </Box>
        </Grid>
    );
}