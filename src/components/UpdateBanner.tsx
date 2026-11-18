import { Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { useAppUpdater } from "../hooks/useAppUpdater.ts";

export function UpdateBanner() {
    const { update, downloading, progress, installUpdate } = useAppUpdater(true);
    const [dismissed, setDismissed] = useState(false);

    if (!update || dismissed) return null;

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