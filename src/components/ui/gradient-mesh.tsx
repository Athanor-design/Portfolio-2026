import type { Palette } from "@/data/content";
import { cx } from "@/utils/cx";

/*
 * Soft, slowly drifting aurora gradient (Dia / Arc style):
 * four blurred color blobs on a light base, finished with a fine grain.
 */

const palettes: Record<Palette, [string, string, string, string]> = {
    dia: ["var(--grad-blue)", "var(--grad-violet)", "var(--grad-pink)", "var(--grad-peach)"],
    ocean: ["var(--grad-blue)", "var(--grad-sky)", "var(--grad-violet)", "var(--grad-mint)"],
    sunset: ["var(--grad-peach)", "var(--grad-pink)", "var(--grad-sun)", "var(--grad-violet)"],
    bloom: ["var(--grad-pink)", "var(--grad-violet)", "var(--grad-peach)", "var(--grad-blue)"],
    mint: ["var(--grad-mint)", "var(--grad-sky)", "var(--grad-sun)", "var(--grad-blue)"],
};

const blobs = [
    { className: "-top-[20%] -left-[15%] size-[75%] animate-drift-a" },
    { className: "-top-[25%] -right-[15%] size-[70%] animate-drift-b" },
    { className: "-bottom-[30%] -left-[5%] size-[70%] animate-drift-c" },
    { className: "-right-[10%] -bottom-[25%] size-[75%] animate-drift-d" },
];

const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

interface GradientMeshProps {
    palette?: Palette;
    className?: string;
    /** Blob opacity — lower for backgrounds behind text. */
    intensity?: number;
}

export const GradientMesh = ({ palette = "dia", className, intensity = 0.85 }: GradientMeshProps) => (
    <div aria-hidden="true" className={cx("absolute inset-0 overflow-hidden bg-primary", className)}>
        <div className="absolute inset-0 blur-3xl" style={{ opacity: intensity }}>
            {blobs.map((blob, i) => (
                <span
                    key={i}
                    className={cx("absolute rounded-full", blob.className)}
                    style={{ background: `radial-gradient(circle at center, ${palettes[palette][i]} 0%, transparent 68%)` }}
                />
            ))}
        </div>
        <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
);
