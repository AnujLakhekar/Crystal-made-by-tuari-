import { getStroke, StrokeOptions } from "perfect-freehand";

/**
 * Converts raw pointer points into a smooth filled SVG path string using perfect-freehand.
 * The result is suitable for Konva's `<Path>` component `data` prop.
 *
 * @param points - Array of [x, y] coordinates from pointer events
 * @param options - Optional perfect-freehand StrokeOptions to override defaults
 * @returns SVG path `d` attribute string
 */
export function getFreehandPath(
    points: number[][],
    options: StrokeOptions = {}
): string {
    if (!points || points.length < 2) return "";

    const stroke = getStroke(points, {
        size: 8,
        thinning: 0.55,
        smoothing: 0.3,
        streamline: 0.5,
        simulatePressure: true,
        start: { taper: false, cap: true },
        end: { taper: true, cap: true },
        ...options,
    });

    if (!stroke.length) return "";

    // Convert the stroke polygon (array of [x, y] points forming a closed shape)
    // into an SVG path using quadratic bezier curves for smooth edges.
    const d = ["M", stroke[0][0], stroke[0][1]];

    for (let i = 0; i < stroke.length; i++) {
        const [x0, y0] = stroke[i];
        const [x1, y1] = stroke[(i + 1) % stroke.length];
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        d.push("Q", x0, y0, midX, midY);
    }

    d.push("Z");
    return d.join(" ");
}