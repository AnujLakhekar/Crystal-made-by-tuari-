import {Stage, Layer, Rect} from "react-konva";
import {useEffect, useRef, useState} from "react";
import ToolTip, {TOOLS, ToolType} from "./ToolTip.tsx";

interface StageProps {
    width?: number;
    height?: number;
}

export default function StageKonvas({width, height}: StageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({
        width: width ?? 800,
        height: height ?? window.innerHeight,
    });

    const [activeTool, setActiveTool] = useState<ToolType>(TOOLS.CURSOR);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
            <Stage width={canvasSize.width} height={canvasSize.height}>
                <Layer>
                    <Rect
                        x={100}
                        y={100}
                        width={100}
                        height={100}
                        fill="red"
                        shadowBlur={10}
                        draggable={activeTool === TOOLS.CURSOR}
                    />
                </Layer>
            </Stage>

            {/* Centers the compact toolbar at the bottom of the canvas */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-50 flex justify-center">
                <div className="pointer-events-auto">
                    <ToolTip
                        activeTool={activeTool}
                        handleChangeState={(tool) => setActiveTool(tool)}
                    />
                </div>
            </div>
        </div>
    );
}