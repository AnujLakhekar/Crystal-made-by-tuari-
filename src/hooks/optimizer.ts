import { useDevice } from "./useDevice.ts";

interface OptimizerConfig {
    /** Rendering tier for the current device */
    tier: "low" | "medium" | "high";

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

const Optimizer = () => {
    const device = useDevice();

    function config(): OptimizerConfig {
        const { isMobile, isTablet, isDesktop, pixelRatio: rawRatio, screenWidth, screenHeight } = device;

        // Classify device tier
        let tier: "low" | "medium" | "high";
        if (isDesktop) {
            tier = "high";
        } else if (isTablet) {
            tier = "medium";
        } else {
            tier = "low";
        }

        // Cap pixel ratio to avoid over-rendering on high-DPI mobile
        const cappedRatio = Math.min(rawRatio, 2);

        // Screen area heuristic — small screens get more aggressive optimization
        const screenArea = screenWidth * screenHeight;
        const isSmallScreen = screenArea < 768 * 1024;

        if (isMobile && isSmallScreen) {
            tier = "low";
        }

        if (device.isMobile) {
            // Mobile-specific optimizations for maximum FPS
            return {
                tier,
                gridMinZoom: 0.3,          // hide grid below 30% zoom
                pixelRatio: cappedRatio,
                draftPreview: tier !== "low",  // skip smooth draft on low-end mobile
                draftStep: tier === "low" ? 3 : 1,  // skip 2 of every 3 points on low tier
                maxShapes: tier === "low" ? 200 : 500,
                transformerRotationSnaps: tier !== "low",
                gridDotRadius: tier === "low" ? 1 : 1.2,
                effectsEnabled: false,
            };
        }

        if (isTablet) {
            // Tablet — balanced performance
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
        }

        // Desktop — full features
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

    return {
        config,
    };
};

export default Optimizer;