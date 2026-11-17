import {Flex, IconButton, Popover, Text, Tooltip} from "@radix-ui/themes";
import {CursorArrowIcon, BoxIcon, SquareIcon, CircleIcon} from "@radix-ui/react-icons";
import {Eclipse} from "lucide-react";
import {useHistory} from "../hooks/useHistory.ts"
import { Undo2, Redo2 } from "lucide-react";

export enum TOOLS {
    CURSOR = "CURSOR",
    SELECT = "SELECT",
    SHAPE = "SHAPE",
}

export type ToolType = `${TOOLS}`;

export interface ToolTipProps {
    activeTool: ToolType | null;
    handleChangeState: (tool: ToolType) => void;
    onAddShape?: (type: "Rect" | "Circle") => void;
}

export default function ToolTip({activeTool, handleChangeState, onAddShape}: ToolTipProps) {
    const {canUndo, canRedo, undo, redo} = useHistory(true);


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
                    <CursorArrowIcon width="16" height="16"/>
                </IconButton>
            </Tooltip>

            <Tooltip content="Select">
                <IconButton
                    size="2"
                    variant={activeTool === TOOLS.SELECT ? "solid" : "soft"}
                    color={activeTool === TOOLS.SELECT ? undefined : "gray"}
                    onClick={() => handleChangeState(TOOLS.SELECT)}
                >
                    <BoxIcon width="16" height="16"/>
                </IconButton>
            </Tooltip>

            <Popover.Root>
                <Popover.Trigger>
                    <IconButton
                        size="2"
                        variant={activeTool === TOOLS.SHAPE ? "solid" : "soft"}
                        color={activeTool === TOOLS.SHAPE ? undefined : "gray"}
                        onClick={() => handleChangeState(TOOLS.SHAPE)}
                    >
                        <Eclipse size="16"/>
                    </IconButton>
                </Popover.Trigger>

                <Popover.Content side="top" sideOffset={12} size="1">
                    <Flex direction="column" gap="2">
                        <Text size="1" weight="bold" color="gray">
                            Add Shape
                        </Text>
                        <Flex gap="2">

                            <IconButton
                                size="2"
                                variant="soft"
                                onClick={() => onAddShape?.("Rect")}
                            >
                                <SquareIcon width="16" height="16"/>
                            </IconButton>


                            <IconButton
                                size="2"
                                variant="soft"
                                onClick={() => onAddShape?.("Circle")}
                            >
                                <CircleIcon width="16" height="16"/>
                            </IconButton>

                        </Flex>
                    </Flex>
                </Popover.Content>
            </Popover.Root>

            <Tooltip content="Undo (Ctrl+Z)">
                <IconButton
                    size="2"
                    variant="soft"
                    color="gray"
                    disabled={!canUndo}
                    onClick={undo}
                >
                    <Undo2 size={16}/>
                </IconButton>
            </Tooltip>

            <Tooltip content="Redo (Ctrl+Y)">
                <IconButton
                    size="2"
                    variant="soft"
                    color="gray"
                    disabled={!canRedo}
                    onClick={redo}
                >
                    <Redo2 size={16}/>
                </IconButton>
            </Tooltip>
        </Flex>
    );
}