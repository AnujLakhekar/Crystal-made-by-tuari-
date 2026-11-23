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

### Drawing & Shapes
- Canvas-based drawing with shape support (Rectangles, Circles)
- Freehand pencil drawing with real-time smooth preview (draft path)
- Advanced brush settings: stroke color, nib size, velocity thinning, smoothing, streamline, taper start/end
- Draggable shapes with selection and multi-selection (Shift+Click to toggle)
- Box selection tool for selecting multiple shapes at once

### Transformation
- Shape transformation (rotate, scale) with Figma-style custom handles
- Configurable transformer: border color/width, anchor size, padding, rotation snapping, aspect ratio lock, centered scaling, flip enablement
- Selection toolbar with style inspector (fill/border color swatches, border width, border style), alignment, duplicate, and delete

### Tools & UI
- Floating tool bar with cursor, pencil, select, and shape-drawing tools
- Selection toolbar with style inspector panel: 27 color swatches for fill and border, border width (1–12px), border style (solid/dashed/none)
- Project settings dialog with three tabs: Canvas & Grid, Pen & Ink, Transformer
- Canvas settings: background color, grid toggle, grid spacing, snap to grid, zoom level
- Pen settings: ink color, nib size, velocity thinning, smoothing, streamline, taper controls
- Transformer settings: selection accent color, border width, anchor size, padding, rotation options, scaling options
- Collapsible sidebar with smooth animation
- Mobile-responsive: sidebar becomes overlay drawer on mobile with toggle button

### History & Clipboard
- Full undo/redo with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- Delete selected shapes with Delete/Backspace key
- Copy, paste, and cut selected shapes (Ctrl+C / Ctrl+V / Ctrl+X)
- Select All (Ctrl+A)

### Performance
- Device-aware performance optimizer with three tiers (low/medium/high)
- Automatic grid auto-hide at low zoom on mobile to save FPS
- O(1) grid rendering using canvas 2D repeating pattern (no per-dot shapes)
- Draft preview disabled on low-tier devices
- Shape count capping based on device capability
- Pixel ratio capping to prevent over-rendering on high-DPI screens

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
│   ├── ShapeItem.tsx              # Memoized shape renderer (Rect/Circle/Freehand)
│   ├── Settings.tsx               # Project settings dialog (Canvas/Pen/Transformer tabs)
│   ├── Sidebar.tsx                # Collapsible sidebar, overlay drawer on mobile
│   ├── Stage.tsx                  # Konva canvas with grid, shapes, freehand drawing
│   ├── Swatch.tsx                 # Style inspector panel (fill/border colors, border style)
│   ├── TransformerComponent.tsx   # Figma-style transformer with config-driven handles
│   ├── ToolBar.tsx                # Selection formatting toolbar (style, align, duplicate, delete)
│   └── ToolTip.tsx                # Floating tool bar with tools and undo/redo
├── core/
│   └── strokeGeometry.ts          # Stroke path generation (getFreehandPath)
├── hooks/
│   ├── optimizer.ts               # Performance optimizer (device-based config)
│   ├── useCanvasViewport.ts       # Canvas zoom and pan state management
│   ├── useClipboard.ts            # Copy/paste/cut and keyboard shortcuts
│   ├── useDevice.ts               # Device detection (mobile/tablet/desktop)
│   ├── useHistory.ts              # Undo/redo keyboard shortcuts
│   ├── useOptimizer.ts            # React hook for performance optimizer (useMemo)
│   ├── usePencilDrawing.ts        # Freehand pencil drawing with draft preview
│   ├── usePinchZoom.ts            # Touch pinch-to-zoom for mobile
│   ├── useSelectionMarquee.ts     # Box selection via drag on empty canvas
│   ├── useStageContextMenu.ts     # Right-click context menu for adding shapes
│   ├── useStageResize.ts          # Auto-resize stage on container change
│   ├── useTheme.tsx               # Theme detection and provider
│   └── useTransformer.ts          # Transformer positioning and selection sync
├── store/
│   ├── DocumentState.ts           # Document state management (placeholder)
│   └── EditorState.ts             # Editor state (shapes, configs, undo/redo)
├── App.tsx                        # Main app layout with mobile sidebar support
└── main.tsx                       # Entry point with Radix Theme provider
```

## Architecture

### State Management

The app uses **Zustand** with `subscribeWithSelector` for fine-grained React subscriptions. The main store (`EditorState`) manages:

- **`shapes`**: Array of `BaseShape` objects on the canvas
- **`selectedIds`**: Array of currently selected shape IDs
- **`activeTool`**: Current tool mode (CURSOR, SELECT, PENCIL, SHAPE)
- **`stage`**: Canvas viewport (position, scale, size)
- **`canvasConfig`**: Canvas appearance settings (background color, grid, snap)
- **`brushConfig`**: Pencil/pen settings (stroke color, width, thinning, smoothing, streamline, taper)
- **`transformerConfig`**: Transformer appearance and behavior (border, anchors, rotation, scaling)
- **`past`/`future`**: Undo/redo history stacks (Immer JSON patches, max 50 entries)

#### CanvasConfig
Controls canvas appearance and grid behavior:
- `backgroundColor`: Stage backdrop fill color
- `showGrid`: Toggle grid visibility
- `gridSize`: Distance between grid dots (px)
- `snapToGrid`: Snap dragged shapes to grid points

#### BrushConfig
Controls freehand pencil drawing behavior:
- `stroke`: Active stroke fill color
- `strokeWidth`: Base diameter of freehand ink (px)
- `thinning`: Velocity-based line width variation (0–1)
- `smoothing`: Softens sharp corners along stroke edges (0–1)
- `streamline`: Stabilizes shaky hand movement (0–1)
- `taperStart`/`taperEnd`: Pointed entry/exit tips

#### TransformerConfig
Controls shape transformation behavior:
- `borderStroke`/`anchorStroke`: Selection box and handle colors
- `borderStrokeWidth`: Selection outline thickness
- `anchorSize`: Corner handle dimensions (px)
- `padding`: Gap between shape and selection box
- `rotateEnabled`: Show rotation handle
- `rotationSnapsEnabled`: Snap rotation to angles
- `rotationSnapStep`: Snap interval in degrees
- `keepRatio`: Lock aspect ratio during scaling
- `centeredScaling`: Scale from center
- `flipEnabled`: Allow mirroring via handle drag
- `ignoreStroke`: Exclude stroke from bounding box
- `minSize`: Minimum allowed width/height (px)

### Shape Model

Each shape on the canvas is a `BaseShape`:

```typescript
interface BaseShape {
    id: string;           // UUID
    type: string;         // "Rect" | "Circle" | "Freehand"
    x: number;            // Position X
    y: number;            // Position Y
    rotation: number;     // Rotation in degrees
    scaleX: number;       // Horizontal scale
    scaleY: number;       // Vertical scale
    props: Record<string, unknown>;  // Shape-specific properties (stroke, points, etc.)
}
```

### Tools

The floating tool bar provides four tool modes:

| Tool | Description |
|------|-------------|
| **Cursor** | Drag and transform shapes |
| **Pencil** | Freehand drawing with smooth draft preview |
| **Select** | Box selection (click and drag on empty canvas) |
| **Shape** | Popover to add new Rectangles or Circles |

All shape mutations (add, update, delete) are recorded in the undo/redo history via Immer patches.

### Component Overview

#### `Stage.tsx`
The main canvas component handling:
- Konva `Stage` and `Layer` rendering with background color from `canvasConfig`
- Grid rendering using O(1) canvas 2D repeating pattern (auto-hidden at low zoom on mobile)
- Shape rendering via `ShapeItem` components (Rect, Circle, Freehand)
- Freehand pencil drawing with smooth draft preview (configurable via `brushConfig`)
- Mouse and touch event handling for box selection, pencil drawing, and pan/zoom
- Transformer for shape rotation and scaling (config-driven via `transformerConfig`)
- Shape count capping based on device performance tier
- Selection toolbar positioning above selected shapes

#### `ShapeItem.tsx`
- Memoized component for rendering individual shapes
- Polymorphic rendering: Rect, Circle, Freehand
- Freehand paths use `getFreehandPath` with brush config (smoothing, streamline, taper)
- Click-to-select with Shift+click multi-select
- Drag support (when tool is CURSOR)
- Transform support via Transformer component

#### `TransformerComponent.tsx`
- Figma-style transformer with custom anchor styling
- Pill-shaped side handles, circular rotation handle
- All settings driven by `transformerConfig` in the store
- Rotation snaps, flip, aspect ratio lock, centered scaling from config
- Rotation snaps disabled on low-tier devices for performance

#### `Settings.tsx`
- Project settings dialog with left navigation rail
- Three tabs: Canvas & Grid, Pen & Ink, Transformer
- Canvas tab: background color picker, grid toggle, grid spacing slider, snap toggle, zoom slider
- Pen tab: ink color picker, nib size slider, thinning/smoothing/streamline sliders, taper toggles
- Transformer tab: accent color picker, border/anchor/padding sliders, rotation/scaling/flip toggles
- All changes apply immediately to the active workspace

#### `ToolBar.tsx`
- Context-sensitive selection toolbar appearing above selected shapes
- Style & Color dropdown using `StyleInspectorPanel` from `Swatch.tsx`: fill color swatches (27 colors + custom picker), border color swatches, border width (1–12px), border style (solid/dashed/none)
- Canvas alignment: left, center, right
- Duplicate and delete actions
- All mutations recorded in undo/redo history

#### `Swatch.tsx`
- Style inspector panel with color swatches and border controls
- Fill color section: 9×3 grid of swatches (pastels, vibrant, dark + transparent + custom color wheel)
- Border color section: same swatch grid rendered as ring outlines
- Border style section: stepped width track (1, 2, 4, 6, 8, 12px) + style buttons (solid, dashed, none)
- Used as a dropdown panel inside `ToolBar.tsx`

#### `Sidebar.tsx`
- Collapsible panel (250px expanded, 48px collapsed)
- Automatically resizes the canvas when toggled
- On mobile: renders as fixed overlay drawer with backdrop and close button
- Accepts `open` and `onOpenChange` props for external control

#### `ToolTip.tsx`
- Floating toolbar positioned at the bottom center
- Tool buttons: Cursor, Pencil, Select, Shape (with active state highlighting)
- Pencil tool animated drawer with brush color (8 presets + custom picker) and stroke size (4 presets + slider)
- Shape addition popover with Rect and Circle options
- Undo/Redo buttons with keyboard shortcut labels
- Mobile pan mode toggle (Hand icon) for single-finger canvas panning

#### `App.tsx`
- Main app layout with Radix Grid (sidebar + stage)
- On mobile: floating toggle button opens sidebar as overlay drawer
- On desktop: inline sidebar with collapsible behavior

#### `useHistory.ts`
- Registers keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo), Delete/Backspace (delete shapes)
- Skips shortcuts when focused on input/textarea/contentEditable

#### `useClipboard.ts`
- Copy, paste, cut selected shapes (Ctrl+C / Ctrl+V / Ctrl+X)
- Select All (Ctrl+A)
- Clipboard operations recorded in undo/redo history

#### `useDevice.ts`
- Detects device type (mobile, tablet, desktop)
- Tracks window dimensions, orientation, pixel ratio, and touch support
- Used by optimizer, Stage, and App for device-specific behavior

#### `useOptimizer.ts` / `optimizer.ts`
- Device-aware performance optimizer with three tiers (low/medium/high)
- Returns config for grid auto-hide, pixel ratio cap, draft preview, shape count limits, etc.
- `useOptimizer.ts`: React hook with `useMemo` for stable references
- `optimizer.ts`: Standalone function returning `{ config }` object

#### `usePencilDrawing.ts`
- Freehand pencil drawing with point collection and commit
- Smooth draft preview using `getFreehandPath` with brush config
- Commits strokes with all brush properties (thinning, smoothing, streamline, taper)

#### `useCanvasViewport.ts`
- Canvas zoom and pan state management
- Scroll wheel zoom, middle-mouse pan, touch pinch-to-zoom

#### `useSelectionMarquee.ts`
- Box selection via click-and-drag on empty canvas
- Selects shapes whose bounding boxes intersect the marquee rectangle

#### `useStageContextMenu.ts`
- Right-click context menu for adding shapes at cursor position

#### `useTransformer.ts`
- Transformer positioning and selection synchronization
- Nodes attached to selected shapes for resize/rotate handles

#### `usePinchZoom.ts`
- Touch-based pinch-to-zoom for mobile devices
- Updates stage scale and position based on pinch gesture

#### `useTheme.tsx`
- System theme detection (light/dark) via `prefers-color-scheme`
- Provides theme context for Radix Theme provider

#### `strokeGeometry.ts`
- Core stroke path generation using `perfect-freehand` library
- Converts raw points to SVG path with thinning, smoothing, and streamline options

## Development Guidelines

### Adding a New Shape Type

1. Add a new `case` in the switch statement in `ShapeItem.tsx`
2. Update the `handleAddShape()` function in `Stage.tsx` to support the new type
3. Add a button for the new shape in `ToolTip.tsx`
4. Update the `BaseShape` type comment in `EditorState.ts` to include the new type

### Adding a New Setting

1. Define the new property in the appropriate config interface in `EditorState.ts` (`CanvasConfig`, `BrushConfig`, or `TransformerConfig`)
2. Add the default value in the store's initial state
3. Add a control (slider, switch, color picker, etc.) in the relevant tab of `Settings.tsx`
4. Wire the setting in the consuming component (e.g., `Stage.tsx`, `TransformerComponent.tsx`, `usePencilDrawing.ts`)

### Adding a New Style Option to the Toolbar

1. Add the new style control to `Swatch.tsx` (e.g., a new swatch row, width step, or style button)
2. Update the `StyleInspectorPanelProps` interface with the new prop and callback
3. Wire the callback in `ToolBar.tsx` to call `updateSelectedProps()` with the appropriate shape patch

### Performance Optimization

The app uses a device-aware optimizer (`useOptimizer.ts`) to maintain FPS on weaker devices:

- **Three performance tiers**: `low` (mobile/small screen), `medium` (tablet), `high` (desktop)
- **Grid auto-hide**: Grid automatically hides when zoom falls below device-specific threshold
- **O(1) grid rendering**: Single `Rect` with canvas 2D repeating pattern instead of per-dot shapes
- **Draft preview**: Smooth pencil preview disabled on low-tier devices
- **Point downsampling**: Draft points skipped on weaker devices (every 3rd point on low tier)
- **Shape count capping**: Max rendered shapes limited by tier (200/500/2000)
- **Pixel ratio capping**: Retina displays capped at 2x to prevent over-rendering
- **Transformer rotation snaps**: Disabled on low-tier devices

To adjust optimization thresholds, modify the `useOptimizer.ts` hook's tier configurations.

### Mobile Support

The app is responsive and works on mobile devices:

- **Sidebar drawer**: On mobile, sidebar becomes a fixed overlay drawer with backdrop
- **Toggle button**: Floating button at top-left opens/closes the sidebar drawer
- **Touch interactions**: Touch-based pan, pinch-to-zoom, and tap-to-select
- **Larger handles**: Transformer anchors enlarged for touch (16px vs 8px)
- **Performance**: Aggressive optimizations on mobile (grid auto-hide, no draft preview, shape limits)

The `useDevice.ts` hook detects device type and provides `isMobile`, `isTablet`, `isDesktop`, `isTouchDevice`, and screen dimensions.

### Performance Notes

- Zustand selectors are used to avoid unnecessary re-renders
- Konva's `batchDraw()` is used for transformer updates
- Shape rendering uses the `name="shape"` attribute for efficient DOM queries
- Grid uses a single `Rect` with canvas 2D pattern — O(1) rendering regardless of zoom level
- Optimizer re-computes only on window resize (device detection is memoized)

## Troubleshooting

### Canvas not resizing
- Ensure `stageResize()` is called when the sidebar toggles
- Check that the container ref is properly attached

### Shapes not selecting
- Verify the `selectedIds` state is updating
- Check that shapes have the `name="shape"` attribute for box selection queries

### Settings not applying
- Ensure the config interface in `EditorState.ts` includes the new property
- Check that the component reads the config from the store (e.g., `useEditorState((s) => s.canvasConfig)`)
- Verify the setter is called with the correct patch (e.g., `setCanvasConfig({ showGrid: true })`)

### Grid lagging or visible boundary
- Grid uses a single `Rect` with canvas 2D pattern — if you see lag, check that `gridPatternImage` useMemo is used correctly
- The pattern tile should be small (e.g., 24×24px) with a single dot centered
- Grid auto-hides at low zoom on mobile via optimizer's `gridMinZoom` threshold

### Mobile sidebar not opening
- Check that `mobileSidebarOpen` state in `App.tsx` is toggled by the button's onClick
- Ensure Sidebar receives `mobile={true}` prop when rendered as overlay
- Verify z-index stacking: backdrop (9998) < sidebar drawer (9999)

### Pencil draft preview not smooth
- Check `brushConfig.smoothing` and `brushConfig.streamline` values in Settings
- On low-tier devices, draft preview is disabled by optimizer — check `optimizer.draftPreview`
- Verify `getFreehandPath` receives correct brush config parameters

## Android Release Signing

The Android build is configured for automatic release signing via GitHub Actions CI/CD. The signed APK output is named `app-universal-release.apk` (instead of `app-universal-release-unsigned.apk`) and installs directly on devices.

### Configuration

The signing configuration lives in `src-tauri/gen/android/app/build.gradle.kts`. It reads credentials from `src-tauri/gen/android/keystore.properties` at build time. Local builds without the file will not break — the signing block is guarded by an `exists()` check.

### Required GitHub Secrets

Before triggering a release, add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.jks` keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias inside the keystore |
| `ANDROID_KEY_PASSWORD` | Key password |

To generate the base64-encoded keystore from a local `.jks` file:

```bash
base64 < your-keystore.jks > keystore-base64.txt
```

### ProGuard

Release builds enable code shrinking with ProGuard (`isMinifyEnabled = true`). Custom rules in `*.pro` files under the app directory are automatically included alongside the default optimization rules.

## CI/CD

Release builds are triggered automatically on `v*` git tags via GitHub Actions (`.github/workflows/release.yml`).

### Desktop Builds

Windows and Linux desktop builds are published using the `tauri-apps/tauri-action`. Artifacts are uploaded to the GitHub Release page.

Required secrets:
- `GITHUB_TOKEN` (provided automatically)
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

### Android Builds

The Android job decodes the keystore secret, writes `keystore.properties`, and builds both APK and AAB artifacts. The output files are uploaded as GitHub Release assets:

- `src-tauri/gen/android/app/build/outputs/apk/universal/release/*.apk`
- `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/*.aab`

## License

This project is private and not licensed for public use.
