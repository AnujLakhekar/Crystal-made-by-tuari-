import { Flex, IconButton, Tooltip } from "@radix-ui/themes";
import { CursorArrowIcon, BoxIcon } from "@radix-ui/react-icons";

export enum TOOLS {
    CURSOR = "CURSOR",
    SELECT = "SELECT",
}

export type ToolType = `${TOOLS}`;

export interface ToolTipProps {
    activeTool: ToolType | null;
    handleChangeState: (tool: ToolType) => void;
}

export default function ToolTip({ activeTool, handleChangeState }: ToolTipProps) {
    return (
        <Flex
            align="center"
            justify="center"
            gap="2"
            p="2"
            style={{
                width: "max-content",
                backgroundColor: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a6)",
                borderRadius: "var(--radius-4)",
                boxShadow: "var(--shadow-4)",
            }}
        >
            <Tooltip content="Cursor">
                <IconButton
                    size="2"
                    variant={activeTool === TOOLS.CURSOR ? "solid" : "soft"}
                    color={activeTool === TOOLS.CURSOR ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.CURSOR)}
                >
                    <CursorArrowIcon width="16" height="16" />
                </IconButton>
            </Tooltip>

            <Tooltip content="Select">
                <IconButton
                    size="2"
                    variant={activeTool === TOOLS.SELECT ? "solid" : "soft"}
                    color={activeTool === TOOLS.SELECT ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.SELECT)}
                >
                    <BoxIcon width="16" height="16" />
                </IconButton>
            </Tooltip>
        </Flex>
    );
}