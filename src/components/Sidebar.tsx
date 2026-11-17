import {Box, Container} from "@radix-ui/themes";


export default function Sidebar() {

    return (
        <Box
            className="bg-gray-2"
            display={{initial: "none", md: "block"}}
            width="250px"
        >
            <Container size="1">
            </Container>
        </Box>
    );
}