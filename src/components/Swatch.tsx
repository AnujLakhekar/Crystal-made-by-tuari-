import React, { useRef } from "react";
import { Tooltip, Text, Flex, Grid, Box } from "@radix-ui/themes";

export type BorderStyleType = "solid" | "dashed" | "none";

interface ColorSwatchItem {
    label: string;
    value: string;
    isTransparent?: boolean;
    isCustom?: boolean;
}

const FILL_SWATCHES: ColorSwatchItem[] = [
    // Row 1: Pastels + Transparent
    { label: "Light Red", value: "#FADBD8" },
    { label: "Light Orange", value: "#FDEBD0" },
    { label: "Light Yellow", value: "#FCF3CF" },
    { label: "Light Green", value: "#EAFAF1" },
    { label: "Light Blue", value: "#EBF5FB" },
    { label: "Light Purple", value: "#E8DAEF" },
    { label: "Light Pink", value: "#FDEDEC" },
    { label: "Light Gray", value: "#E5E7E9" },
    { label: "Transparent", value: "transparent", isTransparent: true },
    // Row 2: Vibrant + Black
    { label: "Coral Red", value: "#FF6B7A" },
    { label: "Orange", value: "#FF9233" },
    { label: "Yellow", value: "#FFD447" },
    { label: "Green", value: "#47C947" },
    { label: "Sky Blue", value: "#7CCBFF" },
    { label: "Purple", value: "#7B61FF" },
    { label: "Pink", value: "#E86BB8" },
    { label: "Gray", value: "#9CA3AF" },
    { label: "Black", value: "#000000" },
    // Row 3: Dark + White + Custom Wheel
    { label: "Dark Red", value: "#7F1D1D" },
    { label: "Dark Orange", value: "#B45309" },
    { label: "Dark Yellow", value: "#B47B09" },
    { label: "Dark Green", value: "#4D7C5B" },
    { label: "Dark Blue", value: "#256D9C" },
    { label: "Dark Purple", value: "#5B21B6" },
    { label: "Dark Magenta", value: "#9D174D" },
    { label: "White", value: "#FFFFFF" },
    { label: "Custom Fill", value: "custom", isCustom: true },
];

const STROKE_WIDTH_STEPS = [1, 2, 4, 6, 8, 12];

export interface StyleInspectorPanelProps {
    fillColor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: BorderStyleType;
    onChangeFill: (color: string) => void;
    onChangeBorderColor: (color: string) => void;
    onChangeBorderWidth: (width: number) => void;
    onChangeBorderStyle: (style: BorderStyleType) => void;
}

export const StyleInspectorPanel: React.FC<StyleInspectorPanelProps> = ({
                                                                            fillColor,
                                                                            borderColor,
                                                                            borderWidth,
                                                                            borderStyle,
                                                                            onChangeFill,
                                                                            onChangeBorderColor,
                                                                            onChangeBorderWidth,
                                                                            onChangeBorderStyle,
                                                                        }) => {
    const fillInputRef = useRef<HTMLInputElement>(null);
    const borderInputRef = useRef<HTMLInputElement>(null);

    const isCustomColor = (current: string) =>
        current !== "transparent" &&
        !FILL_SWATCHES.some(
            (s) => !s.isCustom && s.value.toLowerCase() === current.toLowerCase()
        );

    const renderSwatch = (item: ColorSwatchItem, mode: "fill" | "border") => {
        const activeColor = mode === "fill" ? fillColor : borderColor;
        const onSelect = mode === "fill" ? onChangeFill : onChangeBorderColor;
        const inputRef = mode === "fill" ? fillInputRef : borderInputRef;

        const isSelected = item.isCustom
            ? isCustomColor(activeColor)
            : activeColor.toLowerCase() === item.value.toLowerCase();

        return (
            <Tooltip key={`${mode}-${item.label}`} content={item.label}>
                <button
                    type="button"
                    onClick={() => {
                        if (item.isCustom) {
                            inputRef.current?.click();
                        } else {
                            onSelect(item.value);
                        }
                    }}
                    style={
                        isSelected
                            ? {
                                boxShadow:
                                    "0 0 0 2px var(--color-panel-solid), 0 0 0 3.5px var(--accent-9)",
                            }
                            : undefined
                    }
                    className="relative flex items-center justify-center w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                >
                    {item.isCustom ? (
                        <span
                            className="w-full h-full rounded-full border border-[var(--gray-a6)]"
                            style={{
                                background:
                                    "conic-gradient(from 0deg, #ff4d4d, #ffca28, #4caf50, #29b6f6, #7e57c2, #ec407a, #ff4d4d)",
                            }}
                        />
                    ) : item.isTransparent ? (
                        <span
                            className="w-full h-full rounded-full border border-[var(--gray-a6)]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(45deg, var(--gray-a6) 25%, transparent 25%), linear-gradient(-45deg, var(--gray-a6) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--gray-a6) 75%), linear-gradient(-45deg, transparent 75%, var(--gray-a6) 75%)",
                                backgroundSize: "8px 8px",
                                backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                            }}
                        />
                    ) : mode === "fill" ? (
                        <span
                            className="w-full h-full rounded-full border border-[var(--gray-a5)]"
                            style={{ backgroundColor: item.value }}
                        />
                    ) : (
                        <span
                            className="w-full h-full rounded-full"
                            style={{
                                border: `3.5px solid ${item.value}`,
                                backgroundColor: "transparent",
                                boxShadow: "inset 0 0 0 1px var(--gray-a4)",
                            }}
                        />
                    )}
                </button>
            </Tooltip>
        );
    };

    return (
        <Box
            onKeyDown={(e) => e.stopPropagation()}
            style={{
                backgroundColor: "var(--color-panel-solid)",
                border: "1px solid var(--gray-a6)",
                boxShadow: "var(--shadow-4)",
            }}
            className="w-[268px] rounded-[var(--radius-4)] p-3.5 text-[var(--gray-12)] select-none"
        >
            <input
                ref={fillInputRef}
                type="color"
                value={isCustomColor(fillColor) ? fillColor : "#ffd447"}
                onChange={(e) => onChangeFill(e.target.value)}
                className="sr-only"
            />
            <input
                ref={borderInputRef}
                type="color"
                value={isCustomColor(borderColor) ? borderColor : "#ffd447"}
                onChange={(e) => onChangeBorderColor(e.target.value)}
                className="sr-only"
            />

            {/* Fill Color Section */}
            <Box className="mb-4">
                <Text
                    as="div"
                    size="1"
                    weight="medium"
                    color="gray"
                    className="mb-2.5"
                >
                    Fill color
                </Text>
                <Grid columns="9" gap="2">
                    {FILL_SWATCHES.map((item) => renderSwatch(item, "fill"))}
                </Grid>
            </Box>

            {/* Border Color Section */}
            <Box className="mb-4">
                <Text
                    as="div"
                    size="1"
                    weight="medium"
                    color="gray"
                    className="mb-2.5"
                >
                    Border color
                </Text>
                <Grid columns="9" gap="2">
                    {FILL_SWATCHES.map((item) => renderSwatch(item, "border"))}
                </Grid>
            </Box>

            {/* Border Style Section */}
            <Box>
                <Text
                    as="div"
                    size="1"
                    weight="medium"
                    color="gray"
                    className="mb-2"
                >
                    Border style
                </Text>

                <Flex align="center" justify="between" gap="2">
                    {/* Stepped Width Track */}
                    <div className="relative flex-1 flex items-center justify-between h-7 px-1">
                        <div className="absolute left-2 right-2 h-[1.5px] bg-[var(--gray-a6)]" />

                        {STROKE_WIDTH_STEPS.map((step) => {
                            const active = borderWidth === step && borderStyle !== "none";
                            return (
                                <Tooltip key={step} content={`${step}px`}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (borderStyle === "none") onChangeBorderStyle("solid");
                                            onChangeBorderWidth(step);
                                        }}
                                        className="relative z-10 flex items-center justify-center w-4 h-4 focus:outline-none"
                                    >
                                        <span
                                            style={
                                                active
                                                    ? { backgroundColor: "var(--accent-9)" }
                                                    : undefined
                                            }
                                            className={`rounded-full transition-all ${
                                                active
                                                    ? "w-4 h-4 shadow-sm"
                                                    : "w-2 h-2 bg-[var(--gray-a7)] hover:bg-[var(--gray-a9)]"
                                            }`}
                                        />
                                    </button>
                                </Tooltip>
                            );
                        })}
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-6 w-[1px] bg-[var(--gray-a6)]" />

                    {/* Line Style Buttons: Solid, Dashed, None */}
                    <Flex align="center" gap="1">
                        <Tooltip content="Solid">
                            <button
                                type="button"
                                onClick={() => onChangeBorderStyle("solid")}
                                className={`w-7 h-7 rounded-[var(--radius-2)] flex items-center justify-center transition-colors ${
                                    borderStyle === "solid"
                                        ? "bg-[var(--accent-a4)] text-[var(--accent-11)]"
                                        : "text-[var(--gray-11)] hover:bg-[var(--gray-a4)] hover:text-[var(--gray-12)]"
                                }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <line
                                        x1="3"
                                        y1="13"
                                        x2="13"
                                        y2="3"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </Tooltip>

                        <Tooltip content="Dashed">
                            <button
                                type="button"
                                onClick={() => onChangeBorderStyle("dashed")}
                                className={`w-7 h-7 rounded-[var(--radius-2)] flex items-center justify-center transition-colors ${
                                    borderStyle === "dashed"
                                        ? "bg-[var(--accent-a4)] text-[var(--accent-11)]"
                                        : "text-[var(--gray-11)] hover:bg-[var(--gray-a4)] hover:text-[var(--gray-12)]"
                                }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <line
                                        x1="3"
                                        y1="13"
                                        x2="13"
                                        y2="3"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                        strokeDasharray="2.5 2.5"
                                    />
                                </svg>
                            </button>
                        </Tooltip>

                        <Tooltip content="No Border">
                            <button
                                type="button"
                                onClick={() => onChangeBorderStyle("none")}
                                className={`w-7 h-7 rounded-[var(--radius-2)] flex items-center justify-center transition-colors ${
                                    borderStyle === "none"
                                        ? "bg-[var(--accent-a4)] text-[var(--accent-11)]"
                                        : "text-[var(--gray-11)] hover:bg-[var(--gray-a4)] hover:text-[var(--gray-12)]"
                                }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle
                                        cx="8"
                                        cy="8"
                                        r="5.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                    <line
                                        x1="4.2"
                                        y1="11.8"
                                        x2="11.8"
                                        y2="4.2"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                            </button>
                        </Tooltip>
                    </Flex>
                </Flex>
            </Box>
        </Box>
    );
};