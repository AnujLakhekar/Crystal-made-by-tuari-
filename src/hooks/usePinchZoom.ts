import {useCallback, useEffect, useRef} from "react";
import Konva from "konva";
import useEditorState from "../store/EditorState.ts";

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;

/**
 * Manages pinch-to-zoom and two-finger pan on the Konva stage.
 * Attaches native touch listeners to the stage's canvas element.
 * Returns nothing visible — it mutates the store directly.
 *
 * Designed for mobile/touch devices where mouse wheel zoom and Space+drag pan
 * are not available.
 */
export function usePinchZoom(stageRef: React.RefObject<Konva.Stage | null>) {
    const setStageTransform = useEditorState((s) => s.setStageTransform);
    const isDrawingRef = useRef(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // Only handle two-finger gestures
        if (e.touches.length !== 2) return;

        isDrawingRef.current = true;
        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Store initial state
        (handleTouchStart as any)._startDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        (handleTouchStart as any)._startMidpoint = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        };
        (handleTouchStart as any)._startPosition = {
            x: useEditorState.getState().stage.position.x,
            y: useEditorState.getState().stage.position.y,
        };
        (handleTouchStart as any)._startScale = useEditorState.getState().stage.scale;
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDrawingRef.current || e.touches.length !== 2) return;
        e.preventDefault();

        const stage = stageRef.current;
        if (!stage) return;

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        const currentMidpoint = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        };

        const startDistance = (handleTouchStart as any)._startDistance;
        const startMidpoint = (handleTouchStart as any)._startMidpoint;
        const startPosition = (handleTouchStart as any)._startPosition;
        const startScale = (handleTouchStart as any)._startScale;

        // Calculate zoom scale from pinch distance change
        const scaleRatio = currentDistance / startDistance;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * scaleRatio));

        // Calculate pan offset from midpoint movement
        const panDeltaX = currentMidpoint.x - startMidpoint.x;
        const panDeltaY = currentMidpoint.y - startMidpoint.y;

        // Combine zoom and pan: zoom towards the midpoint
        const pointerWorldX = (startMidpoint.x - startPosition.x) / startScale;
        const pointerWorldY = (startMidpoint.y - startPosition.y) / startScale;

        const newPos = {
            x: startMidpoint.x + panDeltaX - pointerWorldX * newScale,
            y: startMidpoint.y + panDeltaY - pointerWorldY * newScale,
        };

        setStageTransform(newPos, newScale);
    }, [stageRef, setStageTransform]);

    const handleTouchEnd = useCallback((_e: TouchEvent) => {
        if (_e.touches.length < 2) {
            isDrawingRef.current = false;
        }
    }, []);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const canvas = stage.container();
        if (!canvas) return;

        canvas.addEventListener("touchstart", handleTouchStart, {passive: false});
        canvas.addEventListener("touchmove", handleTouchMove, {passive: false});
        canvas.addEventListener("touchend", handleTouchEnd, {passive: false});
        canvas.addEventListener("touchcancel", handleTouchEnd, {passive: false});

        return () => {
            canvas.removeEventListener("touchstart", handleTouchStart);
            canvas.removeEventListener("touchmove", handleTouchMove);
            canvas.removeEventListener("touchend", handleTouchEnd);
            canvas.removeEventListener("touchcancel", handleTouchEnd);
        };
    }, [stageRef, handleTouchStart, handleTouchMove, handleTouchEnd]);
}
