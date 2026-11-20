import {
    Badge,
    Box,
    Flex,
    IconButton,
    ScrollArea,
    Separator,
    Text,
    TextField,
} from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Download,
    FilePlus2,
    Folder,
    FolderPlus,
    Layers,
    LayoutGrid,
    LayoutTemplate,
    PanelLeft,
    PanelLeftClose,
    Pencil,
    Plus,
    Search,
    Square,
    Circle,
    Sparkles,
    Star,
    Trash2,
    Upload,
    Undo2,
} from "lucide-react";
import useEditorState, { BaseShape, TOOLS } from "../store/EditorState.ts";
import { ThemeToggle } from "../hooks/useTheme.tsx";
import Settings from "./Settings.tsx";
import Konva from "konva";

interface BoardItem {
    id: string;
    name: string;
    folder: string;
    favorite: boolean;
}

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
    const setSidebarOpen =
        externalOpen !== undefined
            ? (v: boolean | ((prev: boolean) => boolean)) => {
                const next = typeof v === "function" ? v(sidebarOpen) : v;
                onOpenChange?.(next);
            }
            : setInternalOpen;

    const stageResize = useEditorState((s) => s.stageResize);
    const shapes = useEditorState((s) => s.shapes ?? []);
    const selectedIds = useEditorState((s) => s.selectedIds ?? []);
    const setSelectedIds = useEditorState((s) => s.setSelectedIds);
    const deleteShapes = useEditorState((s) => s.deleteShapes);
    const addShape = useEditorState((s) => s.addShape);
    const setActiveTool = useEditorState((s) => s.setActiveTool);
    const stage = useEditorState((s) => s.stage);

    // Trash state for deleted shapes with restore
    const [trash, setTrash] = useState<BaseShape[]>([]);
    const [showTrashContent, setShowTrashContent] = useState(false);

    // Templates state
    const [showTemplates, setShowTemplates] = useState(false);

    // File input ref for import
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sidebar navigation & collapsible sections
    const [searchQuery, setSearchQuery] = useState("");
    const [activeNav, setActiveNav] = useState<"boards" | "templates" | "trash">("boards");
    const [favOpen, setFavOpen] = useState(true);
    const [organizeOpen, setOrganizeOpen] = useState(true);
    const [layersOpen, setLayersOpen] = useState(true);
    const [othersOpen, setOthersOpen] = useState(true);

    const [boards, setBoards] = useState<BoardItem[]>([
        { id: "default", name: "Untitled Canvas", folder: "First Folder", favorite: false },
        { id: "arch", name: "System Architecture", folder: "First Folder", favorite: true },
    ]);
    const [activeBoardId, setActiveBoardId] = useState("default");

    const filteredBoards = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return boards;
        return boards.filter(
            (b) => b.name.toLowerCase().includes(q) || b.folder.toLowerCase().includes(q)
        );
    }, [boards, searchQuery]);

    const favoriteBoards = useMemo(
        () => filteredBoards.filter((b) => b.favorite),
        [filteredBoards]
    );

    const handleCreateBoard = () => {
        const newBoard: BoardItem = {
            id: crypto.randomUUID(),
            name: `Canvas ${boards.length + 1}`,
            folder: "First Folder",
            favorite: false,
        };
        setBoards((prev) => [newBoard, ...prev]);
        setActiveBoardId(newBoard.id);
    };

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBoards((prev) =>
            prev.map((b) => (b.id === id ? { ...b, favorite: !b.favorite } : b))
        );
    };

    // --- Shape creation helpers (spawns in center of current viewport) ---
    const createShapeAtCenter = (type: "Rect" | "Circle" | "Freehand") => {
        const worldCenterX = (-stage.position.x + stage.size.width / 2) / stage.scale;
        const worldCenterY = (-stage.position.y + stage.size.height / 2) / stage.scale;

        const newShape: BaseShape = {
            id: crypto.randomUUID(),
            type,
            x: type === "Rect" ? worldCenterX - 50 : worldCenterX,
            y: type === "Rect" ? worldCenterY - 50 : worldCenterY,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            props:
                type === "Rect"
                    ? { width: 100, height: 100, fill: Konva.Util.getRandomColor(), cornerRadius: 8 }
                    : type === "Circle"
                    ? { radius: 50, fill: Konva.Util.getRandomColor() }
                    : { stroke: "#ffffff", strokeWidth: 4, rawPoints: [] },
        };
        addShape(newShape);
        setActiveTool(TOOLS.CURSOR);
    };

    // --- Templates: preset shape combinations ---
    const applyTemplate = (name: string) => {
        const worldCenterX = (-stage.position.x + stage.size.width / 2) / stage.scale;
        const worldCenterY = (-stage.position.y + stage.size.height / 2) / stage.scale;

        const shapesToAdd: BaseShape[] = [];

        if (name === "Wireframe") {
            // Header bar + content blocks
            shapesToAdd.push({
                id: crypto.randomUUID(), type: "Rect", x: worldCenterX - 150, y: worldCenterY - 120,
                rotation: 0, scaleX: 1, scaleY: 1,
                props: { width: 300, height: 40, fill: "#3b82f6", cornerRadius: 6 },
            });
            shapesToAdd.push({
                id: crypto.randomUUID(), type: "Rect", x: worldCenterX - 150, y: worldCenterY - 60,
                rotation: 0, scaleX: 1, scaleY: 1,
                props: { width: 140, height: 100, fill: "#64748b", cornerRadius: 6 },
            });
            shapesToAdd.push({
                id: crypto.randomUUID(), type: "Rect", x: worldCenterX + 10, y: worldCenterY - 60,
                rotation: 0, scaleX: 1, scaleY: 1,
                props: { width: 140, height: 100, fill: "#64748b", cornerRadius: 6 },
            });
        } else if (name === "Mind Map") {
            // Center circle + surrounding nodes
            shapesToAdd.push({
                id: crypto.randomUUID(), type: "Circle", x: worldCenterX, y: worldCenterY,
                rotation: 0, scaleX: 1, scaleY: 1,
                props: { radius: 40, fill: "#a855f7" },
            });
            const angles = [0, 72, 144, 216, 288];
            angles.forEach((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                shapesToAdd.push({
                    id: crypto.randomUUID(), type: "Circle",
                    x: worldCenterX + Math.cos(rad) * 120,
                    y: worldCenterY + Math.sin(rad) * 120,
                    rotation: 0, scaleX: 1, scaleY: 1,
                    props: { radius: 25, fill: ["#ef4444", "#22c55e", "#eab308", "#3b82f6", "#ec4899"][i] },
                });
            });
        } else if (name === "Flowchart") {
            // Start -> Process -> Decision -> End
            const colors = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"];
            const labels = ["Start", "Process", "Decision", "End"];
            labels.forEach((_, i) => {
                shapesToAdd.push({
                    id: crypto.randomUUID(), type: "Rect",
                    x: worldCenterX - 50, y: worldCenterY - 150 + i * 80,
                    rotation: 0, scaleX: 1, scaleY: 1,
                    props: { width: 100, height: 50, fill: colors[i], cornerRadius: i === 1 || i === 2 ? 25 : 8 },
                });
            });
        } else if (name === "Sketch Pad") {
            // Blank canvas with border guide
            shapesToAdd.push({
                id: crypto.randomUUID(), type: "Rect", x: worldCenterX - 200, y: worldCenterY - 150,
                rotation: 0, scaleX: 1, scaleY: 1,
                props: { width: 400, height: 300, fill: "transparent", stroke: "#64748b", strokeWidth: 2, cornerRadius: 12 },
            });
        }

        shapesToAdd.forEach((s) => addShape(s));
        setActiveTool(TOOLS.CURSOR);
        setShowTemplates(false);
    };

    // --- Quick Sketch: clear all shapes and start fresh ---
    const handleQuickSketch = () => {
        if (shapes.length === 0) return;
        deleteShapes(shapes.map((s) => s.id));
        setActiveTool(TOOLS.PENCIL);
    };

    // --- Import: load shapes from JSON file ---
    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                const importedShapes: BaseShape[] = Array.isArray(data) ? data : (data.shapes || []);
                importedShapes.forEach((s: BaseShape) => {
                    addShape({ ...s, id: crypto.randomUUID() });
                });
            } catch {
                console.error("Failed to import shapes: invalid JSON");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    // --- Export: download shapes as JSON ---
    const handleExport = () => {
        const data = JSON.stringify(shapes, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `canvas-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- Trash: move shapes to trash and restore ---
    const moveToTrash = (ids: string[]) => {
        const toTrash = shapes.filter((s) => ids.includes(s.id));
        setTrash((prev) => [...prev, ...toTrash]);
        deleteShapes(ids);
    };

    const restoreFromTrash = (id: string) => {
        const toRestore = trash.find((s) => s.id === id);
        if (toRestore) {
            addShape(toRestore);
            setTrash((prev) => prev.filter((s) => s.id !== id));
        }
    };

    const clearTrash = () => {
        setTrash([]);
    };

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
        <>
            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
            <Box
            display={mobile ? "block" : { initial: "none", md: "block" }}
            width={width}
            height="100vh"
            className={
                mobile
                    ? "bg-[var(--gray-2)]"
                    : "shrink-0 overflow-hidden border-r border-[var(--gray-a6)] bg-[var(--gray-2)]"
            }
            style={{
                transition: "width 150ms ease",
                ...(mobile
                    ? {
                        position: "fixed",
                        left: 0,
                        top: 0,
                        zIndex: 9999,
                        borderRight: "1px solid var(--gray-a6)",
                    }
                    : {}),
            }}
        >
            <Flex direction="column" justify="between" height="100%" p="2">
                {/* ─── TOP SECTION ─── */}
                <Flex direction="column" gap="2" p="1">
                    <Flex
                        align="center"
                        justify={sidebarOpen ? "between" : "center"}
                        width="100%"
                    >
                        {sidebarOpen && (
                            <Flex align="center" gap="2">
                                <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600" />
                                <Text size="2" weight="bold" truncate>
                                    Workspace
                                </Text>
                            </Flex>
                        )}
                        <IconButton
                            variant="ghost"
                            color="gray"
                            aria-label="Toggle sidebar"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="cursor-pointer"
                        >
                            {mobile ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                        </IconButton>
                    </Flex>

                    {/* Collapsed slim rail quick-add button */}
                    {!sidebarOpen && !mobile && (
                        <Flex direction="column" align="center" gap="2" mt="2">
                            <IconButton
                                size="1"
                                variant="soft"
                                onClick={handleCreateBoard}
                                title="New Board"
                                className="cursor-pointer"
                            >
                                <Plus size={15} />
                            </IconButton>
                        </Flex>
                    )}

                    {/* Search + Quick Add (+) when expanded */}
                    {sidebarOpen && (
                        <Flex gap="1" align="center" mt="1">
                            <Box style={{ flex: 1 }}>
                                <TextField.Root
                                    size="1"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                >
                                    <TextField.Slot>
                                        <Search size={13} />
                                    </TextField.Slot>
                                </TextField.Root>
                            </Box>
                            <IconButton
                                size="1"
                                variant="soft"
                                onClick={handleCreateBoard}
                                title="New Board"
                                className="cursor-pointer"
                            >
                                <Plus size={14} />
                            </IconButton>
                        </Flex>
                    )}
                </Flex>

                {/* ─── SCROLLABLE MIDDLE CONTENT ─── */}
                {sidebarOpen && (
                    <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
                        <Flex direction="column" gap="3" px="1" py="1">
                            {/* Primary Navigation */}
                            <Flex direction="column" gap="1">
                                <button
                                    type="button"
                                    onClick={() => { setActiveNav("boards"); setShowTemplates(false); setShowTrashContent(false); }}
                                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                        activeNav === "boards"
                                            ? "bg-[var(--accent-a3)] text-[var(--accent-11)]"
                                            : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)]"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <LayoutGrid size={14} />
                                        All Boards
                                    </span>
                                    <Badge size="1" variant="soft" color="gray">
                                        {boards.length}
                                    </Badge>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setActiveNav("templates"); setShowTemplates(true); setShowTrashContent(false); }}
                                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                        activeNav === "templates"
                                            ? "bg-[var(--accent-a3)] text-[var(--accent-11)]"
                                            : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)]"
                                    }`}
                                >
                                    <LayoutTemplate size={14} />
                                    Templates
                                </button>

                                <button
                                    type="button"
                                    onClick={handleQuickSketch}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] transition-colors cursor-pointer"
                                >
                                    <Sparkles size={14} />
                                    Quick Sketch
                                </button>
                            </Flex>

                            <Separator size="4" />

                            {/* Add Shapes Section */}
                            <Box>
                                <button
                                    type="button"
                                    onClick={() => setLayersOpen((v) => !v)}
                                    className="flex w-full items-center gap-1 px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-10)] hover:text-[var(--gray-12)] cursor-pointer"
                                >
                                    <Plus size={12} />
                                    Add Shapes
                                </button>

                                <Flex direction="column" gap="1" mt="1">
                                    <button
                                        type="button"
                                        onClick={() => createShapeAtCenter("Rect")}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] cursor-pointer"
                                    >
                                        <Square size={13} />
                                        Rectangle
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => createShapeAtCenter("Circle")}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] cursor-pointer"
                                    >
                                        <Circle size={13} />
                                        Circle
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTool(TOOLS.PENCIL); }}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] cursor-pointer"
                                    >
                                        <Pencil size={13} />
                                        Freehand
                                    </button>
                                </Flex>
                            </Box>

                            <Separator size="4" />

                            {/* Favorites */}
                            <Box>
                                <button
                                    type="button"
                                    onClick={() => setFavOpen((v) => !v)}
                                    className="flex w-full items-center gap-1 px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-10)] hover:text-[var(--gray-12)] cursor-pointer"
                                >
                                    {favOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    Favorites
                                </button>

                                {favOpen && (
                                    <Box mt="1">
                                        {favoriteBoards.length === 0 ? (
                                            <Flex
                                                direction="column"
                                                align="center"
                                                justify="center"
                                                py="3"
                                                gap="1"
                                                className="rounded-md border border-dashed border-[var(--gray-a5)]"
                                            >
                                                <Star size={14} className="text-[var(--gray-9)]" />
                                                <Text size="1" color="gray">
                                                    No favorites
                                                </Text>
                                            </Flex>
                                        ) : (
                                            <Flex direction="column" gap="1">
                                                {favoriteBoards.map((board) => (
                                                    <button
                                                        key={board.id}
                                                        type="button"
                                                        onClick={() => setActiveBoardId(board.id)}
                                                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                                                            activeBoardId === board.id
                                                                ? "bg-[var(--gray-a4)] font-medium text-[var(--gray-12)]"
                                                                : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)]"
                                                        }`}
                                                    >
                                                        <span className="truncate">{board.name}</span>
                                                        <Star
                                                            size={12}
                                                            onClick={(e) => toggleFavorite(board.id, e)}
                                                            className="shrink-0 fill-amber-400 text-amber-400"
                                                        />
                                                    </button>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {/* Organize / Folders */}
                            <Box>
                                <Flex align="center" justify="between" px="1.5" py="1">
                                    <button
                                        type="button"
                                        onClick={() => setOrganizeOpen((v) => !v)}
                                        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-10)] hover:text-[var(--gray-12)] cursor-pointer"
                                    >
                                        {organizeOpen ? (
                                            <ChevronDown size={12} />
                                        ) : (
                                            <ChevronRight size={12} />
                                        )}
                                        Organize
                                    </button>
                                    <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="gray"
                                        onClick={handleCreateBoard}
                                        title="New Board"
                                        className="cursor-pointer"
                                    >
                                        <FolderPlus size={12} />
                                    </IconButton>
                                </Flex>

                                {organizeOpen && (
                                    <Flex direction="column" gap="1" mt="1">
                                        <Flex
                                            align="center"
                                            gap="2"
                                            px="2"
                                            py="1"
                                            className="text-xs font-medium text-[var(--gray-11)]"
                                        >
                                            <Folder size={13} className="text-[var(--accent-11)]" />
                                            <span>First Folder</span>
                                        </Flex>

                                        {filteredBoards.map((board) => (
                                            <button
                                                key={board.id}
                                                type="button"
                                                onClick={() => setActiveBoardId(board.id)}
                                                className={`group flex items-center justify-between rounded-md pl-5 pr-2 py-1.5 text-xs transition-colors cursor-pointer ${
                                                    activeBoardId === board.id
                                                        ? "bg-[var(--accent-a3)] font-medium text-[var(--accent-11)]"
                                                        : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)]"
                                                }`}
                                            >
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <FilePlus2 size={12} />
                                                    <span className="truncate">{board.name}</span>
                                                </span>
                                                <Star
                                                    size={12}
                                                    onClick={(e) => toggleFavorite(board.id, e)}
                                                    className={`shrink-0 transition-opacity ${
                                                        board.favorite
                                                            ? "fill-amber-400 text-amber-400 opacity-100"
                                                            : "opacity-0 group-hover:opacity-70"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </Flex>
                                )}
                            </Box>

                            {/* Live Canvas Layers */}
                            <Box>
                                <Flex align="center" justify="between" px="1.5" py="1">
                                    <button
                                        type="button"
                                        onClick={() => setLayersOpen((v) => !v)}
                                        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-10)] hover:text-[var(--gray-12)] cursor-pointer"
                                    >
                                        {layersOpen ? (
                                            <ChevronDown size={12} />
                                        ) : (
                                            <ChevronRight size={12} />
                                        )}
                                        Layers ({shapes.length})
                                    </button>
                                    <Layers size={12} className="text-[var(--gray-9)]" />
                                </Flex>

                                {layersOpen && (
                                    <Flex direction="column" gap="1" mt="1">
                                        {shapes.length === 0 ? (
                                            <Text size="1" color="gray" style={{ padding: "4px 8px" }}>
                                                No shapes on canvas
                                            </Text>
                                        ) : (
                                            shapes.map((shape: any, idx: number) => {
                                                const isSelected = selectedIds.includes(shape.id);
                                                return (
                                                    <div
                                                        key={shape.id}
                                                        onClick={() => setSelectedIds?.([shape.id])}
                                                        className={`group flex items-center justify-between rounded-md px-2 py-1 text-xs cursor-pointer ${
                                                            isSelected
                                                                ? "bg-[var(--accent-a4)] font-medium text-[var(--accent-11)]"
                                                                : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)]"
                                                        }`}
                                                    >
                                                        <span className="truncate capitalize">
                                                            {shape.type || "Shape"} #{idx + 1}
                                                        </span>
                                                        <Trash2
                                                            size={11}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                moveToTrash([shape.id]);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-80 hover:text-red-500"
                                                        />
                                                    </div>
                                                );
                                            })
                                        )}
                                    </Flex>
                                )}
                            </Box>

                            {/* Others */}
                            <Box>
                                <button
                                    type="button"
                                    onClick={() => setOthersOpen((v) => !v)}
                                    className="flex w-full items-center gap-1 px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--gray-10)] hover:text-[var(--gray-12)] cursor-pointer"
                                >
                                    {othersOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    Others
                                </button>

                                {othersOpen && (
                                    <Flex direction="column" gap="1" mt="1">
                                        <button
                                            type="button"
                                            onClick={handleImport}
                                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] cursor-pointer"
                                        >
                                            <Download size={13} />
                                            Import
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExport}
                                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] cursor-pointer"
                                        >
                                            <Upload size={13} />
                                            Export
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setActiveNav("trash"); setShowTrashContent(true); setShowTemplates(false); }}
                                            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                                                activeNav === "trash"
                                                    ? "bg-[var(--accent-a3)] font-medium text-[var(--accent-11)]"
                                                    : "text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)]"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Trash2 size={13} />
                                                Trash
                                            </span>
                                            {trash.length > 0 && (
                                                <Badge size="1" variant="soft" color="gray">
                                                    {trash.length}
                                                </Badge>
                                            )}
                                        </button>
                                    </Flex>
                                )}
                            </Box>

                            {/* Templates Gallery — shown when Templates nav is active */}
                            {showTemplates && (
                                <>
                                    <Separator size="4" />
                                    <Box>
                                        <Text size="1" weight="bold" style={{ padding: "4px 8px" }}>
                                            Template Gallery
                                        </Text>
                                        <Flex direction="column" gap="1" mt="1">
                                            {["Wireframe", "Mind Map", "Flowchart", "Sketch Pad"].map((name) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => applyTemplate(name)}
                                                    className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] cursor-pointer"
                                                >
                                                    <LayoutTemplate size={13} />
                                                    <span>{name}</span>
                                                </button>
                                            ))}
                                        </Flex>
                                    </Box>
                                </>
                            )}

                            {/* Trash Content — shown when Trash nav is active */}
                            {showTrashContent && (
                                <>
                                    <Separator size="4" />
                                    <Box>
                                        <Flex align="center" justify="between" px="1.5" py="1">
                                            <Text size="1" weight="bold">
                                                Trash ({trash.length})
                                            </Text>
                                            {trash.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={clearTrash}
                                                    className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </Flex>

                                        {trash.length === 0 ? (
                                            <Text size="1" color="gray" style={{ padding: "4px 8px" }}>
                                                Trash is empty
                                            </Text>
                                        ) : (
                                            <Flex direction="column" gap="1" mt="1">
                                                {trash.map((shape) => (
                                                    <div
                                                        key={shape.id}
                                                        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-[var(--gray-11)] hover:bg-[var(--gray-a3)] cursor-pointer"
                                                    >
                                                        <span className="truncate capitalize">
                                                            {shape.type} #{shapes.indexOf(shape) + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => restoreFromTrash(shape.id)}
                                                            className="opacity-0 group-hover:opacity-80 text-[11px] text-[var(--accent-11)] hover:text-[var(--accent-12)] cursor-pointer"
                                                        >
                                                            <Undo2 size={11} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Flex>
                    </ScrollArea>
                )}

                {/* ─── BOTTOM SECTION ─── */}
                <Flex
                    align="center"
                    justify={sidebarOpen ? "between" : "center"}
                    gap="2"
                    p="1"
                    pb="2"
                    style={{ borderTop: "1px solid var(--gray-a5)", paddingTop: 8 }}
                >
                    {sidebarOpen && (
                        <Text size="2" weight="medium" truncate>
                            AnujLakhekar
                        </Text>
                    )}
                    <Flex align="center" gap="2">
                        {sidebarOpen && <ThemeToggle />}
                        <Settings />
                    </Flex>
                </Flex>
            </Flex>
        </Box>
        </>
    );
}