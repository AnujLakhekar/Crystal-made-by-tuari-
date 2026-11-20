import { Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { AlertTriangle, CheckCircle, Download, Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppUpdater } from "../hooks/useAppUpdater.ts";
import { useDevice } from "../hooks/useDevice.ts";

export function UpdateBanner() {
    const { isMobile } = useDevice();
    // Skip desktop updater check on mobile/Android or narrow viewports if desired
    const { update, checking, downloading, progress, error, checkForUpdates, installUpdate } =
        useAppUpdater(!isMobile);
    const [dismissed, setDismissed] = useState(false);

    // Auto-dismiss "Up to date" after 3 seconds so it doesn't clutter the canvas
    useEffect(() => {
        if (!checking && !update && !error && !dismissed) {
            const timer = setTimeout(() => setDismissed(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [checking, update, error, dismissed]);

    if (dismissed || isMobile) return null;

    const containerClass =
        "fixed bottom-6 left-6 z-[9999] max-w-[calc(100vw-3rem)] rounded-lg border bg-[var(--color-panel-solid)] shadow-lg";

    // 1. Error state
    if (error) {
        return (
            <Flex
                align="center"
                gap="3"
                px="3"
                py="2"
                className={`${containerClass} border-red-500/50`}
            >
                <AlertTriangle size={16} className="shrink-0 text-red-500" />
                <Flex direction="column" style={{ minWidth: 0 }}>
                    <Text size="2" weight="medium">
                        Update check failed
                    </Text>
                    <Text size="1" color="gray" truncate>
                        {error}
                    </Text>
                </Flex>
                <Button
                    size="1"
                    onClick={() => {
                        setDismissed(false);
                        void checkForUpdates();
                    }}
                    className="shrink-0 cursor-pointer"
                >
                    Retry
                </Button>
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    aria-label="Dismiss error"
                    onClick={() => setDismissed(true)}
                    className="shrink-0 cursor-pointer"
                >
                    <X size={14} />
                </IconButton>
            </Flex>
        );
    }

    // 2. Checking state
    if (checking && !update) {
        return (
            <Flex
                align="center"
                gap="3"
                px="3"
                py="2"
                className={`${containerClass} border-[var(--gray-a6)]`}
            >
                <Loader size={16} className="shrink-0 animate-spin text-[var(--accent-11)]" />
                <Text size="2" color="gray">
                    Checking for updates...
                </Text>
            </Flex>
        );
    }

    // 3. Up to date (auto-closes after 3s)
    if (!checking && !update && !error) {
        return (
            <Flex
                align="center"
                gap="3"
                px="3"
                py="2"
                className={`${containerClass} border-[var(--gray-a6)]`}
            >
                <CheckCircle size={16} className="shrink-0 text-green-500" />
                <Text size="2" color="gray">
                    Up to date
                </Text>
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    aria-label="Dismiss"
                    onClick={() => setDismissed(true)}
                    className="shrink-0 cursor-pointer"
                >
                    <X size={14} />
                </IconButton>
            </Flex>
        );
    }

    // 4. Update available
    if (!update) return null;

    return (
        <Flex
            align="center"
            gap="3"
            px="3"
            py="2"
            className={`${containerClass} border-[var(--gray-a6)]`}
        >
            <Download size={16} className="shrink-0 text-[var(--accent-11)]" />
            <Flex direction="column">
                <Text size="2" weight="medium">
                    Update v{update.version} available
                </Text>
                <Text size="1" color="gray">
                    {downloading ? `Downloading… ${progress}%` : "Ready to install"}
                </Text>
            </Flex>
            <Button
                size="1"
                disabled={downloading}
                onClick={installUpdate}
                className="shrink-0 cursor-pointer"
            >
                {downloading ? `${progress}%` : "Restart & Update"}
            </Button>
            {!downloading && (
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    aria-label="Dismiss update"
                    onClick={() => setDismissed(true)}
                    className="shrink-0 cursor-pointer"
                >
                    <X size={14} />
                </IconButton>
            )}
        </Flex>
    );
}