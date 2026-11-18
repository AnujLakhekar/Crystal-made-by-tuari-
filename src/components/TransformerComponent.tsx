import { Transformer } from "react-konva";
import useEditorState from "../store/EditorState.ts";
import { useOptimizer } from "../hooks/useOptimizer.ts";

/**
 * Figma-style Transformer component with custom anchor styling:
 * - Pill-shaped side handles
 * - Circular rotation handle
 * - Rotation snaps from config (disabled on low-tier devices for FPS)
 * - Min size from config
 * - All settings driven by transformerConfig in the store
 */
export function TransformerComponent(props: React.ComponentProps<typeof Transformer> & { anchorSize?: number }) {
    const { anchorSize: propAnchorSize, ...restProps } = props;
    const trConfig = useEditorState((s) => s.transformerConfig);
    const optimizer = useOptimizer();

    const anchorSize = propAnchorSize ?? trConfig.anchorSize;
    const isLarge = anchorSize >= 12;

    // Rotation snaps disabled on low-tier devices even if user enabled them
    const snapsEnabled = trConfig.rotationSnapsEnabled && optimizer.transformerRotationSnaps;

    return (
        <Transformer
            {...restProps}
            borderStroke={trConfig.borderStroke}
            borderStrokeWidth={trConfig.borderStrokeWidth}
            anchorFill="#ffffff"
            anchorStroke={trConfig.anchorStroke}
            rotateEnabled={trConfig.rotateEnabled}
            anchorStrokeWidth={trConfig.anchorStrokeWidth}
            anchorSize={anchorSize}
            enabledAnchors={[
                "top-left",
                "top-right",
                "top-center",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
            ]}
            anchorCornerRadius={2}
            rotateAnchorOffset={isLarge ? 36 : 24}
            rotationSnaps={snapsEnabled ? [0, 45, 90, 135, 180, 225, 270, 315] : undefined}
            flipEnabled={trConfig.flipEnabled}
            ignoreStroke={trConfig.ignoreStroke}
            keepRatio={trConfig.keepRatio}
            centeredScaling={trConfig.centeredScaling}
            boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < trConfig.minSize || Math.abs(newBox.height) < trConfig.minSize) {
                    return oldBox;
                }
                return newBox;
            }}
            anchorStyleFunc={(anchor) => {
                // Make side handles pill-shaped like Figma
                if (anchor.hasName("middle-left") || anchor.hasName("middle-right")) {
                    anchor.height(isLarge ? 28 : 16);
                    anchor.offsetY(isLarge ? 14 : 8);
                    anchor.width(isLarge ? 8 : 5);
                    anchor.offsetX(isLarge ? 4 : 2.5);
                }
                if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
                    anchor.width(isLarge ? 28 : 16);
                    anchor.offsetX(isLarge ? 14 : 8);
                    anchor.height(isLarge ? 8 : 5);
                    anchor.offsetY(isLarge ? 4 : 2.5);
                }
                // Make rotation handle a circle
                if (anchor.hasName("rotater")) {
                    anchor.cornerRadius(999);
                    anchor.size({ width: isLarge ? 18 : 10, height: isLarge ? 18 : 10 });
                    anchor.offset({ x: isLarge ? 9 : 5, y: isLarge ? 9 : 5 });
                }
            }}
        />
    );
}
