import {Box, Button, Container} from "@radix-ui/themes";
import useEditorState from "../store/EditorState.ts";

export default function Sidebar() {
    const addShape = useEditorState((s) => s.addShape);

    const handleAddTestRect = () => {
        addShape({
            id: crypto.randomUUID(),
            type: "Rect",
            x: 100,
            y: 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            props: {
                width: 120,
                height: 80,
                fill: "#3b82f6",
                cornerRadius: 8,
            },
        });
    };

    return (
        <Box
            className="bg-gray-2"
            display={{initial: "none", md: "block"}}
            width="250px"
        >
            <Container size="1">
                <Button onClick={handleAddTestRect}>
                    AddtestShape
                </Button>
            </Container>
        </Box>
    );
}