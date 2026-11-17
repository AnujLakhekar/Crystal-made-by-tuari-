import { useEffect } from "react";
import useEditorState from "../store/EditorState.ts";

/**
 * Watches a container element and keeps the store's stage size in sync
 * with the container's client dimensions on mount and on window resize.
 */
export function useStageResize(containerRef: React.RefObject<HTMLDivElement | null>) {
    const stageResize = useEditorState((s) => s.stageResize);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleResize = () => {
            stageResize(el.clientWidth, el.clientHeight);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [stageResize]);
}
