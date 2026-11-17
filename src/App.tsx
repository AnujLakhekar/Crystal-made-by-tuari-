import {Grid, ScrollArea} from "@radix-ui/themes";
import StageKonvas from "./components/Stage.tsx";
import Sidebar from "./components/Sidebar.tsx";

export default function App() {
    return (
        <>
            <ScrollArea type="hover" scrollbars="vertical" >
                <Grid columns="240px 1fr" rows={"1"} gap="3" height="100vh" width="auto">
                    <Sidebar/>
                    <StageKonvas width={window.innerWidth as number} height={window.innerHeight as number}/>
                </Grid>
            </ScrollArea>
        </>
    )
}