import { useRef } from "react";
import { type MotionValue, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { type DashboardLayer, DashboardMock } from "@/components/ui/dashboard-mock";

/*
 * Case-study cover as an exploded "Figma layers" view: the screen starts tilted
 * isometrically with its UI layers (sidebar, KPIs, chart, table…) floating apart
 * in depth, then snaps back together into a flat screen as you scroll.
 * Neutral light only — no colored glow. Real screenshots just get the tilt.
 */

/** How far each layer floats above the screen when exploded (px). */
const depth: Record<DashboardLayer, number> = {
    sidebar: 50,
    kpi: 110,
    table: 110,
    header: 170,
    chart: 170,
    donut: 230,
};

const useLayer = (progress: MotionValue<number>, z: number) => ({
    z: useTransform(progress, [0, 1], [z, 0]),
    boxShadow: useTransform(
        progress,
        [0, 0.85, 1],
        ["0 24px 40px -16px rgba(0,0,0,0.35)", "0 4px 8px -4px rgba(0,0,0,0.08)", "0 0 0 0 rgba(0,0,0,0)"],
    ),
});

interface HeroShowcaseProps {
    accent: string;
    variant: number;
    image?: string;
}

export const HeroShowcase = ({ accent, variant, image }: HeroShowcaseProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "start 0.05"] });
    const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.5 });

    const rotateX = useTransform(progress, [0, 1], [52, 0]);
    const rotateZ = useTransform(progress, [0, 1], [-28, 0]);
    const scale = useTransform(progress, [0, 1], [0.74, 1]);
    const y = useTransform(progress, [0, 1], [-40, 0]);

    const layers: Record<DashboardLayer, ReturnType<typeof useLayer>> = {
        sidebar: useLayer(progress, depth.sidebar),
        kpi: useLayer(progress, depth.kpi),
        table: useLayer(progress, depth.table),
        header: useLayer(progress, depth.header),
        chart: useLayer(progress, depth.chart),
        donut: useLayer(progress, depth.donut),
    };
    const layerStyle = reduce ? undefined : (name: DashboardLayer) => (name === "header" ? { z: layers.header.z } : layers[name]);

    return (
        <div ref={ref} className="relative mt-16 md:mt-20">
            {/* Concentric arcs + soft top light behind the screen */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 -z-10 overflow-hidden">
                <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 size-full">
                    {[260, 380, 500, 620, 740].map((r, i) => (
                        <circle key={r} cx="600" cy="700" r={r} fill="none" stroke="white" strokeOpacity={0.07 - i * 0.01} />
                    ))}
                </svg>
                <div className="absolute inset-x-[15%] top-0 h-2/3 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.09),transparent_65%)]" />
            </div>

            <div className="[perspective:2400px] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
                <motion.div
                    style={reduce ? undefined : { rotateX, rotateZ, scale, y }}
                    className="rounded-[18px] bg-[#161618] shadow-[0_-1px_0_rgba(255,255,255,0.12),0_50px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.1] will-change-transform [transform-style:preserve-3d]"
                >
                    {/* Window chrome */}
                    <div className="flex h-9 items-center gap-1.5 border-b border-white/[0.06] px-4">
                        {[0, 1, 2].map((dot) => (
                            <span key={dot} className="size-2.5 rounded-full bg-white/[0.12]" />
                        ))}
                    </div>
                    {image ? (
                        <img
                            src={image}
                            alt=""
                            className="aspect-[16/10] w-full rounded-b-[17px] object-cover object-top [image-rendering:-webkit-optimize-contrast]"
                        />
                    ) : (
                        <div className="aspect-[16/10] overflow-visible rounded-b-[17px] [transform-style:preserve-3d] [&>div]:rounded-b-[17px]">
                            <DashboardMock accent={accent} variant={variant} layerStyle={layerStyle} />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
