# Crystal

A desktop drawing application built with Tauri, React, and Konva.

## Tech Stack

- **Backend**: Tauri 2 (Rust)
- **Frontend**: React 19 with TypeScript
- **Canvas**: Konva / react-konva
- **Styling**: Tailwind CSS 4 + Radix UI Themes
- **State Management**: Zustand with `subscribeWithSelector`
- **Build Tool**: Vite 8
- **TypeScript**: ~6.0.3

## Features

- Canvas-based drawing with shape support (Rectangles, Circles, Lines)
- Freehand pencil drawing with real-time preview
- Draggable shapes with selection and multi-selection (Shift+Click to toggle)
- Box selection tool for selecting multiple shapes at once
- Shape transformation (rotate, scale) with Figma-style handles
- Rotation snapping at 45° intervals
- Selection toolbar with formatting tools (fill, border, shadow, alignment, duplicate, delete)
- Floating tool bar with cursor, pencil, select, and shape-drawing tools
- Full undo/redo with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- Delete selected shapes with Delete/Backspace key
- Collapsible sidebar with smooth animation
- Responsive layout (sidebar hidden on mobile)

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (for Tauri backend)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

### Tauri Commands

```bash
# Run the Tauri desktop app in development mode
npm run tauri dev

# Build the Tauri desktop app
npm run tauri build
```

## Project Structure

```
src/
├── components/
│   ├── ShapeItem.tsx      # Memoized shape renderer (Rect/Circle/Line)
│   ├── Sidebar.tsx        # Collapsible sidebar panel (250px ↔ 48px)
│   ├── Stage.tsx          # Konva canvas with shapes, freehand drawing, and transforms
│   ├── ToolBar.tsx        # Selection formatting toolbar (fill, border, shadow, align)
│   └── ToolTip.tsx        # Floating tool bar with tools and undo/redo
├── hooks/
│   ├── useDevice.ts       # Device detection hook (mobile/tablet/desktop)
│   └── useHistory.ts      # Keyboard shortcuts for undo/redo/delete
├── store/
│   ├── DocumentState.ts   # Document state management (placeholder)
│   └── EditorState.ts     # Editor state (shapes, activeTool, selection, undo/redo)
├── App.tsx                # Main app layout with Radix Grid
└── main.tsx               # Entry point with Radix Theme provider
```

## Architecture

### State Management

The app uses **Zustand** with `subscribeWithSelector` for fine-grained React subscriptions. The main store (`EditorState`) manages:

- **`shapes`**: Array of `BaseShape` objects on the canvas
- **`selectedIds`**: Array of currently selected shape IDs
- **`activeTool`**: Current tool mode (CURSOR, SELECT, PENCIL, SHAPE)
- **`stage.size`**: Current canvas dimensions (width × height)
- **`past`/`future`**: Undo/redo history stacks (Immer JSON patches, max 50 entries)

### Shape Model

Each shape on the canvas is a `BaseShape`:

```typescript
interface BaseShape {
    id: string;           // UUID
    type: string;         // "Rect" | "Circle" | "Line"
    x: number;            // Position X
    y: number;            // Position Y
    rotation: number;     // Rotation in degrees
    scaleX: number;       // Horizontal scale
    scaleY: number;       // Vertical scale
    props: Record<string, unknown>;  // Shape-specific properties
}
```

### Tools

The floating tool bar provides four tool modes:

| Tool | Description |
|------|-------------|
| **Cursor** | Drag and transform shapes |
| **Pencil** | Freehand drawing (saves as Line shapes) |
| **Select** | Box selection (click and drag on empty canvas) |
| **Shape** | Popover to add new Rectangles or Circles |

All shape mutations (add, update, delete) are recorded in the undo/redo history via Immer patches.

### Component Overview

#### `Stage.tsx`
The main canvas component handling:
- Konva `Stage` and `Layer` rendering
- Shape rendering via `ShapeItem` components (Rect, Circle, Line)
- Freehand pencil drawing with real-time preview line
- Mouse event handling for box selection and pencil drawing
- Transformer for shape rotation and scaling
- Figma-style custom anchor handles (pill-shaped side handles, circular rotation handle)
- Minimum resize constraint (20×20px)
- Selection toolbar positioning above selected shapes

#### `ShapeItem.tsx`
- Memoized component for rendering individual shapes
- Polymorphic rendering: Rect, Circle, Line
- Click-to-select with Shift+click multi-select
- Drag support (when tool is CURSOR)
- Transform support via Transformer component

#### `ToolBar.tsx`
- Context-sensitive selection toolbar appearing above selected shapes
- Formatting controls: random fill, border, dashed border, shadow
- Canvas alignment: left, center, right
- Duplicate and delete actions
- All mutations recorded in undo/redo history

#### `Sidebar.tsx`
- Collapsible panel (250px expanded, 48px collapsed)
- Automatically resizes the canvas when toggled
- Hidden on mobile (`display: none` below `md` breakpoint)

#### `ToolTip.tsx`
- Floating toolbar positioned at the bottom center
- Tool buttons: Cursor, Pencil, Select, Shape (with active state highlighting)
- Shape addition popover with Rect and Circle options
- Undo/Redo buttons with keyboard shortcut labels

#### `useHistory.ts`
- Registers keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo), Delete/Backspace (delete shapes)
- Skips shortcuts when focused on input/textarea/contentEditable

#### `useDevice.ts`
- Detects device type (mobile, tablet, desktop)
- Tracks window dimensions and orientation
- Provides pixel ratio and touch support detection
- **Note**: Currently defined but not yet used in the app

## Development Guidelines

### Adding a New Shape Type

1. Add a new `case` in the switch statement in `ShapeItem.tsx`
2. Update the `handleAddShape()` function in `Stage.tsx` to support the new type
3. Add a button for the new shape in `ToolTip.tsx`

### Performance Notes

- Zustand selectors are used to avoid unnecessary re-renders
- Konva's `batchDraw()` is used for transformer updates
- Shape rendering uses the `name="shape"` attribute for efficient DOM queries

## Troubleshooting

### Canvas not resizing
- Ensure `stageResize()` is called when the sidebar toggles
- Check that the container ref is properly attached

### Shapes not selecting
- Verify the `selectedIds` state is updating
- Check that shapes have the `name="shape"` attribute for box selection queries

## License

This project is private and not licensed for public use.
