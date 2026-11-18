import { useMemo } from "react";
import { useDevice } from "./useDevice";

/**
 * Performance tiers ranked by device capability.
 * Higher tier = more rendering budget (grid, effects, draft quality).
 */
type PerfTier = "low" | "medium" | "high";

interface OptimizerConfig {
    /** Rendering tier for the current device */
    tier: PerfTier;

    /** Whether the grid should auto-hide when zoom is very low */
    gridMinZoom: number;

    /** Maximum pixel ratio to use for Konva (cap retina to avoid over-rendering) */
    pixelRatio: number;

    /** Whether to enable the pencil draft smooth preview (getFreehandPath) */
    draftPreview: boolean;

    /** Draft preview sampling step — skip points on weaker devices */
    draftStep: number;

    /** Maximum shapes to render before considering virtualization */
    maxShapes: number;

    /** Whether to enable transformer rotation snaps (heavier on mobile) */
    transformerRotationSnaps: boolean;

    /** Grid dot radius scaled for device */
    gridDotRadius: number;

    /** Whether to enable shadow or blur effects on shapes */
    effectsEnabled: boolean;
}

export function useOptimizer(): OptimizerConfig {
    const device = useDevice();

    return useMemo(() => {
        const { isMobile, isTablet, isDesktop, pixelRatio: rawRatio, screenWidth, screenHeight } = device;

        // Classify device tier
        let tier: PerfTier;
        if (isDesktop) {
            tier = "high";
        } else if (isTablet) {
            tier = "medium";
        } else {
            tier = "low";
        }

        // Cap pixel ratio to avoid over-rendering on high-DPI mobile
        const cappedRatio = isMobile ? Math.min(rawRatio, 2) : Math.min(rawRatio, 2);

        // Screen area heuristic — small screens get more aggressive optimization
        const screenArea = screenWidth * screenHeight;
        const isSmallScreen = screenArea < 768 * 1024;

        if (isMobile && isSmallScreen) {
            tier = "low";
        }

        switch (tier) {
            case "low":
                return {
                    tier: "low",
                    gridMinZoom: 0.3,          // hide grid below 30% zoom
                    pixelRatio: cappedRatio,
                    draftPreview: false,       // skip smooth draft on low-end
                    draftStep: 3,              // skip 2 of every 3 points
                    maxShapes: 200,
                    transformerRotationSnaps: false,
                    gridDotRadius: 1,
                    effectsEnabled: false,
                };

            case "medium":
                return {
                    tier: "medium",
                    gridMinZoom: 0.15,
                    pixelRatio: cappedRatio,
                    draftPreview: true,
                    draftStep: 1,
                    maxShapes: 500,
                    transformerRotationSnaps: true,
                    gridDotRadius: 1.2,
                    effectsEnabled: false,
                };

            case "high":
            default:
                return {
                    tier: "high",
                    gridMinZoom: 0.05,
                    pixelRatio: cappedRatio,
                    draftPreview: true,
                    draftStep: 1,
                    maxShapes: 2000,
                    transformerRotationSnaps: true,
                    gridDotRadius: 1.5,
                    effectsEnabled: true,
                };
        }
    }, [device]);
}

export default useOptimizer;
