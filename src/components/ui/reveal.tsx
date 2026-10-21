import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cx } from "@/utils/cx";

export const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

/** Fades its content up once it enters the viewport. */
export const Reveal = ({ children, delay = 0, className }: RevealProps) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay, ease: EASE }}
    >
        {children}
    </motion.div>
);

/** Masked line reveal: each line slides up from behind its own clip. */
export const RevealLines = ({ lines, className, delay = 0 }: { lines: ReactNode[]; className?: string; delay?: number }) => (
    <span className={className}>
        {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                    className="block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, delay: delay + i * 0.09, ease: EASE }}
                >
                    {line}
                </motion.span>
            </span>
        ))}
    </span>
);

/** Small monospace label used to name sections and metadata. */
export const Label = ({ children, className }: { children: ReactNode; className?: string }) => (
    <p className={cx("font-mono text-xs tracking-wide text-tertiary uppercase", className)}>{children}</p>
);

/** Section heading row: thin rule, label on the left, optional meta on the right. */
export const SectionRule = ({ label, meta }: { label: string; meta?: ReactNode }) => (
    <Reveal className="flex items-baseline justify-between border-t border-primary pt-3">
        <Label className="text-primary">{label}</Label>
        {meta && <Label>{meta}</Label>}
    </Reveal>
);
