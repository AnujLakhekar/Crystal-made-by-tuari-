import { ContextMenu } from "radix-ui";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import useEditorState from "../store/EditorState.ts";
import { useStageContextMenu } from "../hooks/useStageContextMenu.ts";

interface StageContextMenuProps {
    children: React.ReactNode;
    onAddShape: (type: "Rect" | "Circle") => void;
}

const menuItemClass =
    "group relative flex h-[28px] select-none items-center rounded-[4px] pl-[26px] pr-[8px] text-[13px] leading-none text-[var(--gray-12)] outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-[var(--accent-9)] data-[disabled]:text-[var(--gray-8)] data-[highlighted]:text-white cursor-pointer";

const shortcutClass =
    "ml-auto pl-6 text-[11px] text-[var(--gray-10)] group-data-[disabled]:text-[var(--gray-7)] group-data-[highlighted]:text-white/80";

/**
 * Right-click context menu for the stage with undo/redo, duplicate,
 * arrange (bring to front / send to back), shape insertion, tool selection,
 * and delete.
 */
export function StageContextMenu({ children, onAddShape }: StageContextMenuProps) {
    const { handleDuplicate } = useStageContextMenu();

    const canUndo = useEditorState((s) => s.canUndo);
    const canRedo = useEditorState((s) => s.canRedo);
    const undo = useEditorState((s) => s.undo);
    const redo = useEditorState((s) => s.redo);
    const selectedIds = useEditorState((s) => s.selectedIds);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const deleteShapes = useEditorState((s) => s.deleteShapes);
    const bringToFront = useEditorState((s) => s.bringToFront);
    const sendToBack = useEditorState((s) => s.sendToBack);


    const hasSelection = selectedIds.length > 0;

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

            <ContextMenu.Portal>
                <ContextMenu.Content
                    className="z-50 min-w-[210px] overflow-hidden rounded-lg p-1.5"
                    style={{
                        backgroundColor: "var(--color-panel-solid)",
                        border: "1px solid var(--gray-a6)",
                        boxShadow: "var(--shadow-5)",
                    }}
                >
                    <ContextMenu.Item className={menuItemClass} disabled={!canUndo} onSelect={undo}>
                        Undo
                        <div className={shortcutClass}>Ctrl+Z</div>
                    </ContextMenu.Item>

                    <ContextMenu.Item className={menuItemClass} disabled={!canRedo} onSelect={redo}>
                        Redo
                        <div className={shortcutClass}>Ctrl+Y</div>
                    </ContextMenu.Item>

                    <ContextMenu.Separator className="my-1.5 h-px bg-[var(--gray-a6)]"/>

                    <ContextMenu.Item
                        className={menuItemClass}
                        disabled={!hasSelection}
                        onSelect={handleDuplicate}
                    >
                        Duplicate
                        <div className={shortcutClass}>Ctrl+D</div>
                    </ContextMenu.Item>

                    <ContextMenu.Sub>
                        <ContextMenu.SubTrigger className={menuItemClass}>
                            Arrange & Insert
                            <div className={shortcutClass}>
                                <ChevronRightIcon/>
                            </div>
                        </ContextMenu.SubTrigger>
                        <ContextMenu.Portal>
                            <ContextMenu.SubContent
                                className="z-50 min-w-[180px] overflow-hidden rounded-lg p-1.5"
                                sideOffset={4}
                                alignOffset={-5}
                                style={{
                                    backgroundColor: "var(--color-panel-solid)",
                                    border: "1px solid var(--gray-a6)",
                                    boxShadow: "var(--shadow-5)",
                                }}
                            >
                                <ContextMenu.Item
                                    className={menuItemClass}
                                    disabled={!hasSelection}
                                    onSelect={() => bringToFront(selectedIds)}
                                >
                                    Bring to Front
                                </ContextMenu.Item>
                                <ContextMenu.Item
                                    className={menuItemClass}
                                    disabled={!hasSelection}
                                    onSelect={() => sendToBack(selectedIds)}
                                >
                                    Send to Back
                                </ContextMenu.Item>
                                <ContextMenu.Separator className="my-1.5 h-px bg-[var(--gray-a6)]"/>
                                <ContextMenu.Item
                                    className={menuItemClass}
                                    onSelect={() => onAddShape("Rect")}
                                >
                                    Add Rectangle
                                </ContextMenu.Item>
                                <ContextMenu.Item
                                    className={menuItemClass}
                                    onSelect={() => onAddShape("Circle")}
                                >
                                    Add Circle
                                </ContextMenu.Item>
                            </ContextMenu.SubContent>
                        </ContextMenu.Portal>
                    </ContextMenu.Sub>

                    <ContextMenu.Separator className="my-1.5 h-px bg-[var(--gray-a6)]"/>

                    <ContextMenu.Item
                        className="group relative flex h-[28px] cursor-pointer select-none items-center rounded-[4px] pl-[26px] pr-[8px] text-[13px] leading-none text-red-500 outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-red-600 data-[disabled]:text-[var(--gray-8)] data-[highlighted]:text-white"
                        disabled={!hasSelection}
                        onSelect={() => {
                            deleteShapes(selectedIds);
                            setSelectedIds([]);
                        }}
                    >
                        Delete
                        <div className={shortcutClass}>Del</div>
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}
