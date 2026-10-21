import { type FC, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { EASE } from "@/components/ui/reveal";

/*
 * Learnings on a minimal vertical rail (after Dovetail's "Our hiring process"
 * on Mobbin): tiny square markers on a hairline, one principle open at a time.
 * Scrolling through the list opens each principle in turn and the line fills
 * down to it; tapping / clicking a title opens it directly. Single column, so
 * it works for any number of items.
 */

export interface LearningItem {
    title: string;
    description: string;
    icon: FC<{ className?: string }>;
}

const MARKER_TOP = 11; // px, vertical centre of the marker within a row (matches the title's first line)

export const LearningsRail = ({ items }: { items: LearningItem[] }) => {
    const [active, setActive] = useState(0);
    const [fillHeight, setFillHeight] = useState(0);
    const [trackHeight, setTrackHeight] = useState(0);
    const listRef = useRef<HTMLOListElement>(null);
    const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
    const reduce = useReducedMotion();

    // Scroll drives which principle is open: the list's progress through the viewport picks the row.
    const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.75", "end 0.45"] });
    useMotionValueEvent(scrollYProgress, "change", (value) => {
        const next = Math.min(items.length - 1, Math.max(0, Math.floor(value * items.length)));
        setActive((current) => (current === next ? current : next));
    });

    // Track spans first → last marker; the fill runs down to the active one.
    // Re-measured whenever the list resizes (descriptions opening/closing shift the rows).
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const measure = () => {
            const rows = rowRefs.current;
            const first = rows[0];
            const last = rows[items.length - 1];
            const current = rows[active];
            if (!first || !last || !current) return;
            setTrackHeight(last.offsetTop - first.offsetTop);
            setFillHeight(current.offsetTop - first.offsetTop);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        return () => observer.disconnect();
    }, [active, items.length]);

    return (
        <ol ref={listRef} className="relative">
            {items.length > 1 && (
                <span
                    aria-hidden="true"
                    className="absolute left-[3px] w-px bg-white/[0.08]"
                    style={{ top: MARKER_TOP, height: trackHeight }}
                >
                    <motion.span
                        className="absolute inset-x-0 top-0 bg-white/60"
                        initial={false}
                        animate={{ height: fillHeight }}
                        transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                    />
                </span>
            )}

            {items.map((item, i) => {
                const isActive = i === active;
                const isPast = i < active;
                const Icon = item.icon;
                return (
                    <li
                        key={item.title}
                        ref={(el) => {
                            rowRefs.current[i] = el;
                        }}
                        className="relative pb-7 pl-8 last:pb-0"
                    >
                        {/* Square marker on the rail */}
                        <span
                            aria-hidden="true"
                            className={`absolute left-0 -translate-y-1/2 transition-[background-color,box-shadow] duration-300 ${
                                isActive
                                    ? "size-[7px] bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.35)]"
                                    : isPast
                                      ? "size-[7px] bg-white/60"
                                      : "size-[7px] bg-white/20"
                            }`}
                            style={{ top: MARKER_TOP }}
                        />

                        <button
                            type="button"
                            onClick={() => setActive(i)}
                            onFocus={() => setActive(i)}
                            aria-expanded={isActive}
                            className="flex w-full items-start gap-2.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        >
                            <Icon
                                className={`mt-[4px] size-[18px] shrink-0 transition-colors duration-300 ${isActive ? "text-primary" : "text-quaternary"}`}
                                aria-hidden="true"
                            />
                            <span
                                className={`font-display text-[1.25rem] leading-[1.3] text-balance transition-colors duration-300 ${
                                    isActive ? "text-primary" : "text-tertiary hover:text-secondary"
                                }`}
                            >
                                {item.title}
                            </span>
                        </button>

                        <AnimatePresence initial={false}>
                            {isActive && (
                                <motion.div
                                    key="description"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                                    className="overflow-hidden"
                                >
                                    <p className="max-w-xl pt-2 pl-[28px] text-[15px] leading-[1.6] text-pretty text-tertiary">
                                        {item.description}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                );
            })}
        </ol>
    );
};
