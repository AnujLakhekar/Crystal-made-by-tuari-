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

- Canvas-based drawing with shape support (Rectangles, Circles)
- Draggable shapes with selection and multi-selection (Shift+Click to toggle)
- Box selection tool for selecting multiple shapes at once
- Shape transformation (rotate, scale) with Figma-style handles
- Rotation snapping at 45° intervals
- Floating tool bar with cursor, select, and shape-drawing tools
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
│   ├── Sidebar.tsx        # Collapsible sidebar panel (250px ↔ 48px)
│   ├── Stage.tsx          # Konva canvas with shape rendering and transformation
│   └── ToolTip.tsx        # Floating tool bar with shape popover
├── hooks/
│   └── useDevice.tsx      # Device detection hook (mobile/tablet/desktop)
├── store/
│   ├── DocumentState.ts   # Document state management (placeholder)
│   └── EditorState.ts     # Editor state (shapes, stage size, selection)
├── App.tsx                # Main app layout with Radix Grid
└── main.tsx               # Entry point with Radix Theme provider
```

## Architecture

### State Management

The app uses **Zustand** with `subscribeWithSelector` for fine-grained React subscriptions. The main store (`EditorState`) manages:

- **`shapes`**: Array of `BaseShape` objects on the canvas
- **`selectedIds`**: Array of currently selected shape IDs
- **`stage.size`**: Current canvas dimensions (width × height)

### Shape Model

Each shape on the canvas is a `BaseShape`:

```typescript
interface BaseShape {
    id: string;           // UUID
    type: string;         // "Rect" | "Circle"
    x: number;            // Position X
    y: number;            // Position Y
    rotation: number;     // Rotation in degrees
    scaleX: number;       // Horizontal scale
    scaleY: number;       // Vertical scale
    props: Record<string, unknown>;  // Shape-specific properties
}
```

### Tools

The floating tool bar provides three tool modes:

| Tool | Description |
|------|-------------|
| **Cursor** | Drag and transform shapes |
| **Select** | Box selection (click and drag on empty canvas) |
| **Shape** | Popover to add new Rectangles or Circles |

### Component Overview

#### `Stage.tsx`
The main canvas component handling:
- Konva `Stage` and `Layer` rendering
- Shape rendering via `shapeRender()` function
- Mouse event handling for box selection
- Transformer for shape rotation and scaling
- Figma-style custom anchor handles (pill-shaped side handles, circular rotation handle)
- Minimum resize constraint (20×20px)

#### `Sidebar.tsx`
- Collapsible panel (250px expanded, 48px collapsed)
- Automatically resizes the canvas when toggled
- Hidden on mobile (`display: none` below `md` breakpoint)

#### `ToolTip.tsx`
- Floating toolbar positioned at the bottom center
- Tool buttons with active state highlighting
- Shape addition popover with Rect and Circle options

#### `useDevice.tsx`
- Detects device type (mobile, tablet, desktop)
- Tracks window dimensions and orientation
- Provides pixel ratio and touch support detection
- **Note**: Currently defined but not yet used in the app

## Development Guidelines

### Adding a New Shape Type

1. Extend the `shapeRender()` function in `Stage.tsx` with a new `case` in the switch
2. Update the `handleAddShape()` function to support the new type
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
