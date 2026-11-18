import { Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { AlertTriangle, CheckCircle, Download, Loader, X } from "lucide-react";
import { useState } from "react";
import { useAppUpdater } from "../hooks/useAppUpdater.ts";

export function UpdateBanner() {
    const { update, checking, downloading, progress, error, checkForUpdates, installUpdate } = useAppUpdater(true);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    // Show error state
    if (error) {
        return (
            <Flex
                align="center"
                gap="3"
                px="3"
                py="2"
                className="fixed bottom-6 left-6 z-[9999] rounded-lg border border-red-500/50 bg-[var(--color-panel-solid)] shadow-lg"
            >
                <AlertTriangle size={16} className="text-red-500" />
                <Flex direction="column">
                    <Text size="2" weight="medium">
                        Update check failed
                    </Text>
                    <Text size="1" color="gray">
                        {error}
                    </Text>
                </Flex>
                <Button
                    size="1"
                    onClick={() => {
                        setDismissed(false);
                        void checkForUpdates();
                    }}
                    className="cursor-pointer"
                >
                    Retry
                </Button>
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    aria-label="Dismiss error"
                    onClick={() => setDismissed(true)}
                    className="cursor-pointer"
                >
                    <X size={14} />
                </IconButton>
            </Flex>
        );
    }

    // Show checking state
    if (checking && !update) {
        return (
            <Flex
                align="center"
                gap="3"
                px="3"
                py="2"
                className="fixed bottom-6 left-6 z-[9999] rounded-lg border border-[var(--gray-a6)] bg-[var(--color-panel-solid)] shadow-lg"
            >
                <Loader size={16} className="animate-spin text-[var(--accent-11)]" />
                <Text size="2" color="gray">
                    Checking for updates...
                </Text>
            </Flex>
        );
    }

    // Show no update available (briefly, then hide)
    if (!checking && !update && !error) {
        return (
            <Flex
                align="center"
                gap="3"
                px="3"
                py="2"
                className="fixed bottom-6 left-6 z-[9999] rounded-lg border border-[var(--gray-a6)] bg-[var(--color-panel-solid)] shadow-lg"
            >
                <CheckCircle size={16} className="text-green-500" />
                <Text size="2" color="gray">
                    Up to date
                </Text>
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    aria-label="Dismiss"
                    onClick={() => setDismissed(true)}
                    className="cursor-pointer"
                >
                    <X size={14} />
                </IconButton>
            </Flex>
        );
    }

    // Show update available
    if (!update) return null;

    return (
        <Flex
            align="center"
            gap="3"
            px="3"
            py="2"
            className="fixed bottom-6 left-6 z-[9999] rounded-lg border border-[var(--gray-a6)] bg-[var(--color-panel-solid)] shadow-lg"
        >
            <Download size={16} className="text-[var(--accent-11)]" />
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
                className="cursor-pointer"
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
                    className="cursor-pointer"
                >
                    <X size={14} />
                </IconButton>
            )}
        </Flex>
    );
}