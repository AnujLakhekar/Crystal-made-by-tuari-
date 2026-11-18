import { useState, useCallback, useEffect } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

/** Returns true when running inside a Tauri webview (not a regular browser). */
function isTauri(): boolean {
    return typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;
}

export function useAppUpdater(checkOnMount = true) {
    const [update, setUpdate] = useState<Update | null>(null);
    const [checking, setChecking] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const checkForUpdates = useCallback(async () => {
        if (!isTauri()) {
            console.log('[Updater] Skipping check — not running in Tauri');
            return null;
        }

        setChecking(true);
        setError(null);
        try {
            console.log('[Updater] Checking for updates...');
            const available = await check();
            console.log('[Updater] Check result:', available);
            setUpdate(available);
            return available;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[Updater] Check failed:', err);
            setError(`Update check failed: ${msg}`);
            return null;
        } finally {
            setChecking(false);
        }
    }, []);

    // yes

    const installUpdate = useCallback(async () => {
        if (!update || !isTauri()) return;
        setDownloading(true);
        setError(null);

        let downloadedBytes = 0;
        let totalBytes = 0;

        try {
            console.log('[Updater] Starting download and install...');
            await update.downloadAndInstall((event) => {
                if (event.event === "Started") {
                    totalBytes = event.data.contentLength ?? 0;
                    console.log('[Updater] Download started, total:', totalBytes);
                } else if (event.event === "Progress") {
                    downloadedBytes += event.data.chunkLength;
                    if (totalBytes > 0) {
                        setProgress(Math.round((downloadedBytes / totalBytes) * 100));
                    }
                } else if (event.event === "Finished") {
                    setProgress(100);
                    console.log('[Updater] Download finished, relaunching...');
                }
            });

            await relaunch();
        } catch (err) {
            console.error('[Updater] Install failed:', err);
            const msg = err instanceof Error ? err.message : String(err);
            setError(`Update install failed: ${msg}`);
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