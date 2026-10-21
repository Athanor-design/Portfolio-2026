import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { EASE } from "@/components/ui/reveal";

/*
 * Design-tool "selection" around its child (Figma-style): blue frame, corner
 * handles, a live width × height label and a red spacing redline below.
 * Purely decorative and hidden from assistive tech.
 */

const FIGMA_BLUE = "#0d99ff";
const REDLINE = "#f24e1e";

interface SelectionFrameProps {
    children: ReactNode;
    /** Spacing (px) measured by the redline under the selection. */
    spacingBelow?: number;
    delay?: number;
}

const Handle = ({ className }: { className: string }) => (
    <span className={`absolute size-[7px] border bg-white ${className}`} style={{ borderColor: FIGMA_BLUE }} />
);

export const SelectionFrame = ({ children, spacingBelow, delay = 0.9 }: SelectionFrameProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ w: Math.round(width), h: Math.round(height) });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative">
            <div ref={ref} className="w-fit">
                {children}
            </div>

            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 select-none"
                style={{ width: size.w || undefined }}
                initial={{ opacity: 0, scale: 1.03 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay, ease: EASE }}
            >
                <span className="absolute inset-0 border" style={{ borderColor: FIGMA_BLUE }} />
                <Handle className="-top-[4px] -left-[4px]" />
                <Handle className="-top-[4px] -right-[4px]" />
                <Handle className="-bottom-[4px] -left-[4px]" />
                <Handle className="-right-[4px] -bottom-[4px]" />

                {/* Live dimensions */}
                <span
                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-[3px] px-1.5 py-0.5 font-mono text-[11px] leading-none whitespace-nowrap text-white tabular-nums"
                    style={{ backgroundColor: FIGMA_BLUE }}
                >
                    {size.w} × {size.h}
                </span>

                {/* Spacing redline to the next element */}
                {spacingBelow !== undefined && (
                    <span className="absolute top-full left-[22%] flex flex-col items-center" style={{ height: spacingBelow }}>
                        <span className="h-px w-2" style={{ backgroundColor: REDLINE }} />
                        <span className="w-px flex-1" style={{ backgroundColor: REDLINE }} />
                        <span className="h-px w-2" style={{ backgroundColor: REDLINE }} />
                        <span
                            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-[3px] px-1 py-0.5 font-mono text-[10px] leading-none text-white"
                            style={{ backgroundColor: REDLINE }}
                        >
                            {spacingBelow}
                        </span>
                    </span>
                )}
            </motion.div>
        </div>
    );
};
