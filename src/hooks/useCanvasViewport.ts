import {useEffect, useRef, useState, useCallback} from "react";
import Konva from "konva";
import useEditorState from "../store/EditorState.ts";


const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const ZOOM_SPEED = 1.08;

export function useCanvasViewport(onViewportChange?: () => void, isMobilePanMode?: boolean) {
    const position = useEditorState((s) => s.stage.position);
    const scale = useEditorState((s) => s.stage.scale);
    const setStageTransform = useEditorState((s) => s.setStageTransform);


    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const panOriginRef = useRef<{ x: number; y: number } | null>(null);

    // Effective pan mode: Space key on desktop, explicit toggle on mobile
    const canPan = isSpacePressed || !!isMobilePanMode;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable
            ) {
                return;
            }
            if (e.code === "Space" && !e.repeat) {
                e.preventDefault();
                setIsSpacePressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                setIsSpacePressed(false);
                setIsPanning(false);
                panOriginRef.current = null;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const handleWheel = useCallback(
        (e: Konva.KonvaEventObject<WheelEvent>) => {
            e.evt.preventDefault();
            const stage = e.target.getStage();
            if (!stage) return;

            const pointer = stage.getPointerPosition();
            if (!pointer) return;

            const oldScale = stage.scaleX();
            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const rawScale = direction > 0 ? oldScale * ZOOM_SPEED : oldScale / ZOOM_SPEED;
            const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawScale));

            const nextPos = {
                x: pointer.x - mousePointTo.x * nextScale,
                y: pointer.y - mousePointTo.y * nextScale,
            };

            setStageTransform(nextPos, nextScale);
            requestAnimationFrame(() => onViewportChange?.());
        },
        [setStageTransform, onViewportChange]
    );

    const handlePanStart = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent | MouseEvent>): boolean => {
            const isMiddleClick = e.evt.button === 1;
            const isSpaceDrag = canPan && e.evt.button === 0;

            if (!isMiddleClick && !isSpaceDrag) return false;

            e.evt.preventDefault();
            setIsPanning(true);
            panOriginRef.current = {
                x: e.evt.clientX - position.x,
                y: e.evt.clientY - position.y,
            };
            return true;
        },
        [canPan, position]
    );

    const handlePanMove = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent | MouseEvent>): boolean => {
            if (!isPanning || !panOriginRef.current) return false;

            const nextPos = {
                x: e.evt.clientX - panOriginRef.current.x,
                y: e.evt.clientY - panOriginRef.current.y,
            };
            setStageTransform(nextPos, scale);
            onViewportChange?.();
            return true;
        },
        [isPanning, scale, setStageTransform, onViewportChange]
    );

    const handlePanEnd = useCallback((): boolean => {
        if (!isPanning) return false;
        setIsPanning(false);
        panOriginRef.current = null;
        return true;
    }, [isPanning]);

    return {
        position,
        scale,
        isSpacePressed,
        isPanning,
        handleWheel,
        handlePanStart,
        handlePanMove,
        handlePanEnd,
    };
}