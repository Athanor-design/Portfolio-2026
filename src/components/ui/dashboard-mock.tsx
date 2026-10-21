import { type MotionStyle, motion } from "motion/react";

/*
 * Illustrative SaaS dashboard, drawn in HTML so it stays crisp at any size.
 * Sizes use container units (cqw) so the whole UI scales with its frame.
 * Shown until a real dashboard screenshot is provided for the project.
 */

const charts = [
    "M0 70 C 40 62, 70 30, 110 38 S 180 64, 220 40 S 290 12, 330 22 S 380 30, 400 14",
    "M0 60 C 50 66, 80 50, 120 52 S 190 20, 230 28 S 300 52, 340 30 S 385 10, 400 18",
    "M0 74 C 30 70, 60 58, 100 44 S 170 50, 210 30 S 280 36, 320 20 S 375 22, 400 8",
    "M0 50 C 40 40, 90 64, 130 50 S 200 24, 250 34 S 320 18, 350 26 S 385 16, 400 20",
];

const kpis = [
    ["Factures traitées", "1 284", "+12 %"],
    ["Taux de rapprochement", "96 %", "+4 pts"],
    ["Délai moyen", "2,1 j", "−18 %"],
];

const rows = [
    ["FAC-2041", "Atelier Nord", "4 200,00 €", "Validée"],
    ["FAC-2042", "Studio Verre", "1 380,50 €", "En attente"],
    ["FAC-2043", "Maison Lune", "9 015,00 €", "Validée"],
    ["FAC-2044", "Groupe Arc", "620,00 €", "Validée"],
];

/** UI layers that can be pulled apart in 3D (exploded "Figma layers" view). */
export type DashboardLayer = "sidebar" | "header" | "kpi" | "chart" | "donut" | "table";

interface DashboardMockProps {
    accent: string;
    variant?: number;
    /** Optional per-layer motion style; when set, layers live in a shared 3D space. */
    layerStyle?: (layer: DashboardLayer) => MotionStyle | undefined;
}

export const DashboardMock = ({ accent, variant = 0, layerStyle }: DashboardMockProps) => {
    const layer = (name: DashboardLayer) => layerStyle?.(name);
    const path = charts[variant % charts.length];
    const gradientId = `area-${variant}`;

    return (
        <div className="@container flex size-full bg-white text-[#1d1d1f] [transform-style:preserve-3d]" aria-hidden="true">
            {/* Sidebar */}
            <motion.aside style={layer("sidebar")} className="flex w-[19%] flex-col gap-[1.6cqw] border-r border-black/[0.06] bg-[#f7f7f9] p-[1.8cqw]">
                <div className="mb-[1cqw] flex items-center gap-[0.8cqw]">
                    <span className="size-[2.4cqw] rounded-[0.6cqw]" style={{ backgroundColor: accent }} />
                    <span className="h-[0.9cqw] w-[7cqw] rounded-full bg-black/80" />
                </div>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-[0.8cqw] rounded-[0.6cqw] px-[0.8cqw] py-[0.6cqw]"
                        style={i === 1 ? { backgroundColor: `${accent}1f` } : undefined}
                    >
                        <span className="size-[1.3cqw] rounded-[0.3cqw]" style={{ backgroundColor: i === 1 ? accent : "rgba(0,0,0,0.18)" }} />
                        <span className="h-[0.7cqw] rounded-full bg-black/20" style={{ width: `${[6, 8, 5, 7, 6, 4][i]}cqw` }} />
                    </div>
                ))}
            </motion.aside>

            {/* Main */}
            <div className="flex flex-1 flex-col gap-[1.6cqw] p-[2cqw] [transform-style:preserve-3d]">
                <motion.div style={layer("header")} className="flex items-center justify-between">
                    <div>
                        <p className="text-[1.05cqw] text-black/45">Tableau de bord</p>
                        <p className="text-[1.9cqw] font-semibold tracking-tight">Vue d'ensemble</p>
                    </div>
                    <div className="flex items-center gap-[1cqw]">
                        <span className="h-[2.6cqw] w-[14cqw] rounded-full bg-black/[0.05]" />
                        <span className="size-[2.6cqw] rounded-full bg-gradient-to-br from-black/20 to-black/5" />
                    </div>
                </motion.div>

                <div className="grid grid-cols-3 gap-[1.2cqw] [transform-style:preserve-3d]">
                    {kpis.map(([label, value, delta]) => (
                        <motion.div key={label} style={layer("kpi")} className="rounded-[1cqw] border border-black/[0.06] bg-white p-[1.3cqw]">
                            <p className="text-[0.95cqw] text-black/50">{label}</p>
                            <div className="mt-[0.6cqw] flex items-end justify-between">
                                <p className="text-[2.3cqw] font-semibold tracking-tight">{value}</p>
                                <span className="rounded-full bg-[#e7f8ef] px-[0.7cqw] py-[0.2cqw] text-[0.85cqw] font-semibold text-[#14804a]">
                                    {delta}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid flex-1 grid-cols-5 gap-[1.2cqw] [transform-style:preserve-3d]">
                    <motion.div style={layer("chart")} className="col-span-3 flex flex-col rounded-[1cqw] border border-black/[0.06] bg-white p-[1.3cqw]">
                        <p className="text-[1.05cqw] font-semibold">Volume mensuel</p>
                        <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="mt-[1cqw] w-full flex-1">
                            <defs>
                                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
                                    <stop offset="100%" stopColor={accent} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={`${path} L400 80 L0 80 Z`} fill={`url(#${gradientId})`} />
                            <motion.path
                                d={path}
                                fill="none"
                                stroke={accent}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </svg>
                    </motion.div>
                    <motion.div
                        style={layer("donut")}
                        className="col-span-2 flex flex-col justify-between rounded-[1cqw] border border-black/[0.06] bg-white p-[1.3cqw]"
                    >
                        <p className="text-[1.05cqw] font-semibold">Statut</p>
                        <div className="mx-auto my-[0.8cqw] size-[11cqw] rounded-full" style={{ background: `conic-gradient(${accent} 0 68%, ${accent}55 68% 86%, rgba(0,0,0,0.08) 86% 100%)`, mask: "radial-gradient(circle, transparent 55%, black 56%)" }} />
                        <div className="flex justify-between text-[0.85cqw] text-black/50">
                            <span>Validées</span>
                            <span>En cours</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div style={layer("table")} className="rounded-[1cqw] border border-black/[0.06] bg-white">
                    {rows.map(([ref, client, amount, status], i) => (
                        <div
                            key={ref}
                            className={`grid grid-cols-4 items-center px-[1.3cqw] py-[0.75cqw] text-[0.95cqw] ${i > 0 ? "border-t border-black/[0.05]" : ""}`}
                        >
                            <span className="font-medium">{ref}</span>
                            <span className="text-black/55">{client}</span>
                            <span className="text-black/70 tabular-nums">{amount}</span>
                            <span
                                className={`justify-self-end rounded-full px-[0.8cqw] py-[0.2cqw] text-[0.85cqw] font-semibold ${
                                    status === "Validée" ? "bg-[#e7f8ef] text-[#14804a]" : "bg-[#fff4e0] text-[#b25e09]"
                                }`}
                            >
                                {status}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
