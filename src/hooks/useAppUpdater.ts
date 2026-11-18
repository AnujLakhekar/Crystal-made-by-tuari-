import { useState, useCallback, useEffect } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export function useAppUpdater(checkOnMount = true) {
    const [update, setUpdate] = useState<Update | null>(null);
    const [checking, setChecking] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const checkForUpdates = useCallback(async () => {
        setChecking(true);
        setError(null);
        try {
            const available = await check();
            setUpdate(available);
            return available;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to check for updates");
            return null;
        } finally {
            setChecking(false);
        }
    }, []);

    const installUpdate = useCallback(async () => {
        if (!update) return;
        setDownloading(true);
        setError(null);

        let downloadedBytes = 0;
        let totalBytes = 0;

        try {
            await update.downloadAndInstall((event) => {
                if (event.event === "Started") {
                    totalBytes = event.data.contentLength ?? 0;
                } else if (event.event === "Progress") {
                    downloadedBytes += event.data.chunkLength;
                    if (totalBytes > 0) {
                        setProgress(Math.round((downloadedBytes / totalBytes) * 100));
                    }
                } else if (event.event === "Finished") {
                    setProgress(100);
                }
            });

            await relaunch();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to install update");
            setDownloading(false);
        }
    }, [update]);

    useEffect(() => {
        if (checkOnMount) {
            void checkForUpdates();
        }
    }, [checkOnMount, checkForUpdates]);

    return {
        update,
        checking,
        downloading,
        progress,
        error,
        checkForUpdates,
        installUpdate,
    };
}