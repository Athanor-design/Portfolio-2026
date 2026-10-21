import { type ReactNode, useRef } from "react";
import { motion } from "motion/react";
import AnimatedDownloadIcon from "@/components/ui/animated-icons/download-icon";
import type { AnimatedIconHandle } from "@/components/ui/animated-icons/types";
import { cx } from "@/utils/cx";

interface CtaButtonProps {
    href: string;
    children: ReactNode;
    color?: "primary" | "secondary" | "tertiary";
    icon?: "arrow" | "download";
    download?: boolean;
    /** Stretch to the container width on small screens (stacked mobile CTAs). */
    fullWidthMobile?: boolean;
}

const ArrowIcon = () => (
    <svg
        viewBox="0 0 16 16"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M3 8h10m-4-4 4 4-4 4" />
    </svg>
);

/**
 * Hero call-to-action (Threads / Mixpanel / Speakeasy-inspired):
 * - primary: tactile glossy pill with glow, periodic shine and an arrow that swaps on hover;
 * - secondary: transparent-looking pill (page-coloured fill, faint border) that brightens on hover;
 * - tertiary: text + icon only, subtle background on hover.
 */
export const CtaButton = ({ href, children, color = "primary", icon = "arrow", download, fullWidthMobile }: CtaButtonProps) => {
    // Download uses an animated icon (itshover) that plays while the whole button is hovered.
    const downloadRef = useRef<AnimatedIconHandle>(null);
    const hoverHandlers =
        icon === "download"
            ? { onMouseEnter: () => downloadRef.current?.startAnimation(), onMouseLeave: () => downloadRef.current?.stopAnimation() }
            : {};
    const iconNode = icon === "download" ? <AnimatedDownloadIcon ref={downloadRef} size={16} aria-hidden="true" /> : <ArrowIcon />;

    if (color === "tertiary") {
        return (
            <motion.a
                href={href}
                download={download}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex h-[52px] items-center gap-2 rounded-full px-5 text-base font-semibold text-secondary transition duration-200 ease-out hover:bg-tertiary hover:text-primary"
            >
                {children}
                <span className="transition duration-300 group-hover:translate-y-0.5">{iconNode}</span>
            </motion.a>
        );
    }

    if (color === "secondary") {
        return (
            <motion.a
                href={href}
                download={download}
                whileTap={{ scale: 0.97 }}
                {...hoverHandlers}
                className={cx("group relative inline-flex rounded-full p-px", fullWidthMobile && "w-full sm:w-auto")}
            >
                {/* Neutral border that brightens on hover */}
                <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-white/[0.12] transition duration-300 group-hover:bg-white/40 group-focus-visible:bg-white/40"
                />
                <span className="relative inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-secondary pr-5 pl-6 text-base font-semibold text-secondary transition-colors duration-300 group-hover:bg-tertiary group-hover:text-primary">
                    {children}
                    {icon === "download" ? (
                        iconNode
                    ) : (
                        <span className="transition duration-300 group-hover:translate-y-0.5">{iconNode}</span>
                    )}
                </span>
            </motion.a>
        );
    }

    return (
        <motion.a
            href={href}
            download={download}
            style={{
                backgroundImage: "linear-gradient(180deg, var(--color-brand-400), var(--color-brand-600) 70%)",
            }}
            whileTap={{ scale: 0.96 }}
            className={cx(
                "group relative inline-flex items-center gap-3 overflow-hidden rounded-full py-1.5 pr-1.5 pl-5 text-[15px] font-semibold text-white",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.15),0_0_0_1px_var(--color-brand-700),0_10px_28px_-8px_var(--color-brand-500)]",
                "transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.15),0_0_0_1px_var(--color-brand-700),0_14px_40px_-6px_var(--color-brand-400)]",
            )}
        >
            {/* Periodic shine sweep */}
            <span
                aria-hidden="true"
                className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
            <span className="relative">{children}</span>
            {/* Arrow slides out to the right while a new one slides in from the left */}
            <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-1 ring-white/30">
                <span className="absolute transition duration-300 ease-out group-hover:translate-x-6">{iconNode}</span>
                <span className="absolute -translate-x-6 transition duration-300 ease-out group-hover:translate-x-0">{iconNode}</span>
            </span>
        </motion.a>
    );
};
