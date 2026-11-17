import { Transformer } from "react-konva";

/**
 * Figma-style Transformer component with custom anchor styling:
 * - Pill-shaped side handles
 * - Circular rotation handle
 * - 45° rotation snaps
 * - Minimum 20x20px size constraint
 * - Flip disabled
 */
export function TransformerComponent(props: React.ComponentProps<typeof Transformer>) {
    return (
        <Transformer
            {...props}
            borderStroke="#3b82f6"
            borderStrokeWidth={1.5}
            anchorFill="#ffffff"
            anchorStroke="#3b82f6"
            rotateEnabled={true}
            anchorStrokeWidth={1.5}
            anchorSize={8}
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
            rotateAnchorOffset={24}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            flipEnabled={false}
            ignoreStroke={true}
            boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
                    return oldBox;
                }
                return newBox;
            }}
            anchorStyleFunc={(anchor) => {
                // Make side handles pill-shaped like Figma
                if (anchor.hasName("middle-left") || anchor.hasName("middle-right")) {
                    anchor.height(16);
                    anchor.offsetY(8);
                    anchor.width(5);
                    anchor.offsetX(2.5);
                }
                if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
                    anchor.width(16);
                    anchor.offsetX(8);
                    anchor.height(5);
                    anchor.offsetY(2.5);
                }
                // Make rotation handle a circle
                if (anchor.hasName("rotater")) {
                    anchor.cornerRadius(999);
                    anchor.size({ width: 10, height: 10 });
                    anchor.offset({ x: 5, y: 5 });
                }
            }}
        />
    );
}
