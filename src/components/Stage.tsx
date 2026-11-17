import {Stage, Layer, Rect, Circle} from "react-konva";
import {useEffect, useRef, useState} from "react";
import ToolTip, {TOOLS, ToolType} from "./ToolTip.tsx";
import useEditorState, {BaseShape} from "../store/EditorState.ts";

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

    // states

    const shapes = useEditorState((s) => s.shapes)
    const updateShape = useEditorState((s) => s.updateShape);


    // resize the canvas
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

    function shapeRender(el: BaseShape) {
        const commonProps = {
            key: el.id,
            id: el.id,
            x: el.x,
            y: el.y,
            rotation: el.rotation,
            scaleX: el.scaleX,
            scaleY: el.scaleY,
            draggable: activeTool === TOOLS.CURSOR,
            onDragEnd: (e: any) => {
                updateShape(el.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                });
            },
            ...el.props,
        };

        switch (el.type) {
            case "Rect":
                return <Rect {...commonProps}  />
            case "Circle":
                return <Circle {...commonProps} />;
            default:
                return null;

        }
    }

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
            <Stage width={canvasSize.width} height={canvasSize.height}>
                <Layer>
                    {shapes.map((el) => shapeRender(el))}
                </Layer>
            </Stage>

            {/* tool bar */}
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