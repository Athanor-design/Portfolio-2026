import { AlertCircle, Upload01 } from "@untitledui/icons";
import { type ReactNode, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    type AnimationPlaybackControls,
    type MotionValue,
    animate,
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "motion/react";
import { EASE } from "@/components/ui/reveal";

/*
 * Problem / solution / result summary as three glass cards (after Giga's
 * "Real numbers, in production" on Mobbin): coloured label, headline, short
 * text, and a small illustrative visual pinned to the bottom of each card.
 * Visuals are qualitative — no invented metrics.
 */

interface SummaryCardsProps {
    headlines: { problem: string; solution: string; result: string };
    problem: string;
    solution: string;
    result: string;
    /** Which project story the mini-visuals tell; without it the cards show text only. */
    visuals?: SummaryVisuals;
}

const CORAL = "#f97066";
const VIOLET = "var(--grad-violet)";
// Same violet as a literal colour, for properties Motion animates (CSS variables can't be tweened)
const VIOLET_HEX = "rgb(160, 120, 255)";
const GREEN = "#4ade80";

/** False while the cards are off-screen: the looping visuals pause instead of running unseen. */
const LoopContext = createContext(true);

/** Caption row above each visual, like a chart legend. */
const VisualLabel = ({ children }: { children: ReactNode }) => (
    <p className="font-mono text-[10px] tracking-[0.12em] text-quaternary uppercase">{children}</p>
);

/** Four-point star with concave sides (an astroid). */
const Astroid = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 1.5C12.6 8 16 11.4 22.5 12C16 12.6 12.6 16 12 22.5C11.4 16 8 12.6 1.5 12C8 11.4 11.4 8 12 1.5Z" />
    </svg>
);

/** Problem: an endless queue of reconciled invoices still waiting for a manual validation. */
// Newest first, so each card dropping in from the top carries the next number
const QUEUE = ["FAC-2046", "FAC-2045", "FAC-2044", "FAC-2043", "FAC-2042", "FAC-2041"];
// Row height + gap, in px: the list scrolls by exactly one copy of the queue, then loops seamlessly
const QUEUE_ROW = 36;
const QUEUE_START = -QUEUE.length * QUEUE_ROW;

/**
 * Endless top-to-bottom scroll for the invoice lists. One animation per list, paused (not restarted)
 * while off-screen, so it resumes exactly where it stopped instead of snapping back to the start.
 */
const useQueueScroll = (run: boolean) => {
    const y = useMotionValue(QUEUE_START);
    const controls = useRef<AnimationPlaybackControls | null>(null);
    useEffect(() => {
        if (!run) {
            controls.current?.pause();
            return;
        }
        if (controls.current) controls.current.play();
        else controls.current = animate(y, [QUEUE_START, 0], { duration: 9, ease: "linear", repeat: Infinity });
    }, [run, y]);
    useEffect(
        () => () => {
            controls.current?.stop();
            controls.current = null;
        },
        [],
    );
    return y;
};

const ManualQueue = ({ play }: { play: boolean }) => {
    const reduce = useReducedMotion();
    const live = useContext(LoopContext);
    const y = useQueueScroll(play && !reduce && live);
    return (
        <div>
            <VisualLabel>Réconciliées · à valider une à une</VisualLabel>
            <motion.div
                className="mt-3 h-[138px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_80%,transparent)]"
                initial={{ opacity: 0 }}
                animate={play ? { opacity: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                {/* Starts one copy up and slides down: cards keep dropping in from the top */}
                <motion.ul style={{ y }}>
                    {/* Two copies back to back, so the loop has no visible seam */}
                    {[...QUEUE, ...QUEUE].map((ref, i) => (
                        <li
                            key={i}
                            className="mb-1.5 flex h-[30px] items-center justify-between rounded-md bg-white/[0.04] px-2.5 ring-1 ring-white/[0.06]"
                        >
                            <span className="font-mono text-[11px] text-tertiary">{ref}</span>
                            <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{ color: CORAL, backgroundColor: "rgba(249,112,102,0.12)" }}
                            >
                                À valider
                            </span>
                        </li>
                    ))}
                </motion.ul>
            </motion.div>
        </div>
    );
};

/** Solution: the setting that switches the automation on. */
const AutoToggle = ({ play }: { play: boolean }) => (
    <div>
        <VisualLabel>Un seul réglage</VisualLabel>
        <div className="mt-3 rounded-lg bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[13px] leading-snug font-medium text-primary">Approuver automatiquement les factures réconciliées</p>
                    <p className="mt-1 text-[11px] text-tertiary">Plus besoin de les valider une à une</p>
                </div>
                <span className="relative flex h-5 w-9 shrink-0 items-center rounded-full bg-white/10">
                    <motion.span
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: VIOLET }}
                        initial={{ opacity: 0 }}
                        animate={play ? { opacity: 1 } : undefined}
                        transition={{ duration: 0.3, delay: 0.6 }}
                    />
                    <motion.span
                        className="relative size-4 rounded-full bg-white shadow-sm"
                        initial={{ x: 2 }}
                        animate={play ? { x: 18 } : undefined}
                        transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.6 }}
                    />
                </span>
            </div>
        </div>
    </div>
);

/** Result: the same invoices as the problem card, flipping from "À valider" to approved on their own. */
const AutoApproved = ({ play }: { play: boolean }) => {
    const reduce = useReducedMotion();
    const live = useContext(LoopContext);
    // Same top-to-bottom scroll as the queue on the left; each row reads the motion value to know where it is
    const y = useQueueScroll(play && !reduce && live);

    return (
        <div>
            <VisualLabel>Les mêmes factures · après</VisualLabel>
            <motion.div
                className="mt-3 h-[102px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
                initial={{ opacity: 0 }}
                animate={play ? { opacity: 1 } : undefined}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <motion.ul style={{ y }}>
                    {[...QUEUE, ...QUEUE].map((ref, i) => (
                        <ApprovingRow key={i} invoice={ref} index={i} y={y} settled={!!reduce} />
                    ))}
                </motion.ul>
            </motion.div>
            <p className="mt-2.5 text-[11px] text-tertiary">Un validateur de secours prend le relais en cas d'échec.</p>
        </div>
    );
};

/** One invoice row: it enters "À valider" and flips to "Approuvée auto" as it crosses the upper part of the window. */
const ApprovingRow = ({ invoice, index, y, settled }: { invoice: string; index: number; y: MotionValue<number>; settled: boolean }) => {
    // Row's top edge inside the window; the status flips quickly, between 18px and 23px.
    // Without motion the list never scrolls, so every row shows its final, approved state.
    const top = useTransform(y, (v) => (settled ? Infinity : v + index * QUEUE_ROW));
    const pending = useTransform(top, [18, 23], [1, 0]);
    const approved = useTransform(top, [18, 23], [0, 1]);
    const approvedScale = useTransform(top, [18, 23], [0.85, 1]);
    return (
        <li className="mb-1.5 flex h-[30px] items-center justify-between rounded-md bg-white/[0.04] px-2.5 ring-1 ring-white/[0.06]">
            <span className="font-mono text-[11px] text-tertiary">{invoice}</span>
            <span className="relative grid">
                <motion.span
                    className="col-start-1 row-start-1 justify-self-end rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: CORAL, backgroundColor: "rgba(249,112,102,0.12)", opacity: pending }}
                >
                    À valider
                </motion.span>
                <motion.span
                    className="col-start-1 row-start-1 flex items-center gap-1 justify-self-end rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: GREEN, backgroundColor: "rgba(74,222,128,0.12)", opacity: approved, scale: approvedScale }}
                >
                    <Astroid className="size-2.5" />
                    Approuvée auto
                </motion.span>
            </span>
        </li>
    );
};

/* ---------- ERP connectors story (project 01) ---------- */

/** All three ERP visuals share one panel size so the cards line up. */
const PANEL = "mt-3 flex h-[104px] flex-col rounded-lg p-3";

/** Problem: what users actually hit before connectors existed — an error pushing them to manual import. */
const ImportError = ({ play }: { play: boolean }) => {
    const reduce = useReducedMotion();
    const live = useContext(LoopContext);
    return (
        <div>
            <VisualLabel>Avant · sans connecteur</VisualLabel>
            {/* shadcn/ui-style dialog: icon tile + title/description, then a footer with the actions on the right */}
            <motion.div
                role="presentation"
                className="mt-3 flex h-[104px] flex-col justify-between overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.06]"
                initial={{ opacity: 0, y: 8 }}
                // macOS "wrong password" shake: quick horizontal swings that settle, replayed every few seconds
                animate={play ? { opacity: 1, y: 0, x: reduce || !live ? 0 : [0, -12, 11, -9, 7, -4, 2, 0] } : undefined}
                transition={{
                    opacity: { duration: 0.4, delay: 0.2 },
                    y: { duration: 0.4, delay: 0.2 },
                    // Off-screen or reduced motion: settle once, no endless repeat
                    x:
                        reduce || !live
                            ? { duration: 0.2 }
                            : { duration: 0.55, delay: 0.75, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 },
                }}
            >
                <div className="flex items-start gap-2.5 px-3 pt-2.5 pb-1.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[rgba(248,113,113,0.12)] text-[#f87171]">
                        <AlertCircle className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[12px] leading-snug font-semibold tracking-tight text-primary">
                            Impossible d'importer depuis votre ERP
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-tertiary">Veuillez importer vos factures manuellement.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-1.5 border-t border-white/[0.08] px-3 py-1.5">
                    <span className="inline-flex h-6 items-center rounded-md border border-white/[0.14] px-2 text-[11px] font-medium text-secondary">
                        Annuler
                    </span>
                    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-white px-2 text-[11px] font-medium text-[#141413]">
                        <Upload01 className="size-3" />
                        Importer un .csv
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

/*
 * Beams run in real pixels (the SVG is measured), so every pulse has exactly the same length and thickness
 * whatever the beam's curve or the card's width. Sources sit at y = 10 / 40 / 70; all converge on the node at y = 40.
 */
const BEAM_HEIGHT = 80;
const SOURCE_Y = [10, 40, 70];
const beamPath = (y: number, w: number) => (y === 40 ? `M0 40 L ${w} 40` : `M0 ${y} C ${w / 2} ${y}, ${w / 2} 40, ${w} 40`);
/** Length of the S-curve above, sampled (SVG has no geometry API before mount). */
const beamLength = (y: number, w: number) => {
    let length = 0;
    let [px, py] = [0, y];
    for (let step = 1; step <= 48; step++) {
        const t = step / 48;
        const u = 1 - t;
        const x = 3 * u * u * t * (w / 2) + 3 * u * t * t * (w / 2) + t * t * t * w;
        const yy = u * u * u * y + 3 * u * u * t * y + 3 * u * t * t * 40 + t * t * t * 40;
        length += Math.hypot(x - px, yy - py);
        [px, py] = [x, yy];
    }
    return length;
};
// Each beam carries two pulses half a cycle apart; a pulse crosses in 1.4s and comes back every 1.8s.
const CYCLE = 1.8;
const TRAVEL = 1.4;
const PULSES_PER_BEAM = 2;
const BEAM_TIMING = (i: number, k: number) => ({ delay: 0.2 + i * 0.3 + (k * CYCLE) / PULSES_PER_BEAM, repeat: Infinity });
// Pulse: a plain hairline segment, in px, slid along the path.
const PULSE = 22;
const SOURCES = ["Pennylane", "Sellsy", "Odoo"];

/** Solution: each connected ERP feeds TRESO2, light pulses travelling along thin strokes (node-editor style). */
const InvoiceSync = ({ play }: { play: boolean }) => {
    const reduce = useReducedMotion();
    const live = useContext(LoopContext);
    const svgRef = useRef<SVGSVGElement>(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);
    return (
        <div>
            <VisualLabel>Synchronisation automatique</VisualLabel>
            <div className={`${PANEL} relative justify-center bg-white/[0.04] ring-1 ring-white/[0.06]`}>
                <svg
                    ref={svgRef}
                    className="absolute top-3 left-[84px] h-20 w-[calc(100%-176px)] overflow-visible"
                    viewBox={`0 0 ${width || 1} ${BEAM_HEIGHT}`}
                    aria-hidden="true"
                >
                    {width > 0 &&
                        SOURCE_Y.map((y, i) => {
                            const d = beamPath(y, width);
                            const length = beamLength(y, width);
                            return (
                                <g key={y}>
                                    <path d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                    {Array.from({ length: PULSES_PER_BEAM }, (_, k) => {
                                        const timing = { ...BEAM_TIMING(i, k), duration: TRAVEL, repeatDelay: CYCLE - TRAVEL };
                                        const transition = {
                                            ...timing,
                                            ease: "linear" as const,
                                            opacity: { ...timing, times: [0, length / (length + PULSE), 1] },
                                        };
                                        return (
                                            <motion.path
                                                key={k}
                                                d={d}
                                                fill="none"
                                                stroke={VIOLET_HEX}
                                                strokeWidth={0.6}
                                                strokeDasharray={`${PULSE} ${length + PULSE + 10}`}
                                                // From just before the start to past the end. The path ends on the node's stroke,
                                                // so the pulse is swallowed there, fading as it goes.
                                                initial={{ strokeDashoffset: PULSE }}
                                                animate={
                                                    play && !reduce && live
                                                        ? { strokeDashoffset: [PULSE, -length], opacity: [1, 1, 0] }
                                                        : { strokeDashoffset: PULSE }
                                                }
                                                transition={play && !reduce && live ? transition : { duration: 0 }}
                                            />
                                        );
                                    })}
                                </g>
                            );
                        })}
                </svg>
                <div className="relative flex items-center justify-between">
                    <ul className="flex w-[72px] flex-col gap-2.5">
                        {SOURCES.map((name) => (
                            <li
                                key={name}
                                className="relative flex h-5 items-center gap-1.5 rounded-md bg-[#232325] px-1.5 text-[10px] font-medium text-secondary ring-1 ring-white/[0.08]"
                            >
                                <span className="flex size-3 shrink-0 items-center justify-center rounded-[3px] bg-white/[0.1] text-[7px] font-semibold text-primary">
                                    {name[0]}
                                </span>
                                {name}
                            </li>
                        ))}
                    </ul>
                    <span className="relative">
                        <span
                            className="relative flex h-10 w-20 flex-col items-center justify-center rounded-lg bg-[#1c1a24]"
                            style={{ boxShadow: `inset 0 0 0 1px rgba(160,120,255,0.7), 0 0 18px -4px rgba(160,120,255,0.5)` }}
                        >
                            <span className="relative text-[11px] leading-none font-semibold text-primary">TRESO2</span>
                            <span className="relative mt-1 text-[9px] leading-none text-tertiary">Invoice Hub</span>
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

// Invoices the ERPs keep sending; the table cycles through them (amounts are illustrative).
const SYNCED_INVOICES = [
    { ref: "FAC-3104", source: "Pennylane", amount: "4 820 €" },
    { ref: "FAC-3105", source: "Sellsy", amount: "1 260 €" },
    { ref: "FAC-3106", source: "Odoo", amount: "9 400 €" },
    { ref: "FAC-3107", source: "Pennylane", amount: "2 150 €" },
    { ref: "FAC-3108", source: "Sellsy", amount: "7 330 €" },
];
const SYNC_ROW = "grid h-5 grid-cols-[1fr_1fr_auto] items-center gap-2 rounded px-2 text-[10px]";

/** Result: the invoice table filling itself, a new row from the ERP every couple of seconds. */
const LiveInvoiceTable = ({ play }: { play: boolean }) => {
    const reduce = useReducedMotion();
    const live = useContext(LoopContext);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!play || reduce || !live) return;
        const id = setInterval(() => setTick((t) => t + 1), 2200);
        return () => clearInterval(id);
    }, [play, reduce, live]);

    // Newest first: three rows, keyed by their position in the endless sequence so each new one enters
    const rows = [0, 1, 2].map((offset) => {
        const n = tick + 2 - offset;
        return { key: n, ...SYNCED_INVOICES[n % SYNCED_INVOICES.length] };
    });

    return (
        <div>
            <VisualLabel>Factures · mises à jour en continu</VisualLabel>
            <div className={`${PANEL} gap-0.5 overflow-hidden bg-white/[0.04] px-1.5 ring-1 ring-white/[0.06]`}>
                <div className={`${SYNC_ROW} h-4 text-quaternary`}>
                    <span>N°</span>
                    <span>Source</span>
                    <span className="text-right">Montant</span>
                </div>
                <AnimatePresence initial={false} mode="popLayout">
                    {rows.map((row) => (
                        <motion.div
                            key={row.key}
                            layout
                            className={`${SYNC_ROW} text-secondary`}
                            initial={{ opacity: 0, y: -10, backgroundColor: "rgba(23,178,106,0.24)" }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                backgroundColor: "rgba(255,255,255,0.04)",
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.45,
                                ease: EASE,
                                backgroundColor: { duration: 1.4, delay: 0.3 },
                            }}
                        >
                            <span className="font-mono text-tertiary">{row.ref}</span>
                            <span className="truncate">{row.source}</span>
                            <span className="text-right font-medium text-primary tabular-nums">{row.amount}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

/* ---------- Design system story (project 03) ---------- */

// One design decision, two code names: the same colour had to be re-translated for each platform
const DESIGN_TOKEN = { name: "primary", color: "#28AFED" };
const PLATFORM_TOKENS = [
    { platform: "Plateforme A", token: "--blue-600" },
    { platform: "Plateforme B", token: "$brand-primary" },
];

/** Problem: one token in the design file branches into a different name on each platform. */
const TokenMismatch = ({ play }: { play: boolean }) => {
    // Branches are drawn in real px between the measured chips, so they always meet them exactly
    const panelRef = useRef<HTMLDivElement>(null);
    const sourceRef = useRef<HTMLDivElement>(null);
    const targetRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [branches, setBranches] = useState<string[]>([]);
    useLayoutEffect(() => {
        const panel = panelRef.current;
        const source = sourceRef.current;
        if (!panel || !source) return;
        const measure = () => {
            // Chips only fade in (no transform), so their boxes are already in place when measured
            const base = panel.getBoundingClientRect();
            const from = source.getBoundingClientRect();
            const sx = from.left + from.width / 2 - base.left;
            const sy = from.bottom - base.top;
            setBranches(
                targetRefs.current.map((target) => {
                    if (!target) return "";
                    // Elbow: straight down from the design token, then across to the inner edge of each code name
                    const to = target.getBoundingClientRect();
                    const ty = to.top + to.height / 2 - base.top;
                    const toRight = to.left + to.width / 2 - base.left > sx;
                    const tx = (toRight ? to.left : to.right) - base.left;
                    const r = Math.min(6, Math.abs(ty - sy), Math.abs(tx - sx));
                    const dir = toRight ? 1 : -1;
                    return `M${sx} ${sy} V${ty - r} Q${sx} ${ty} ${sx + dir * r} ${ty} H${tx}`;
                }),
            );
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(panel);
        return () => observer.disconnect();
    }, []);

    return (
        <div>
            <VisualLabel>1 token design · 2 noms en code</VisualLabel>
            <div ref={panelRef} className={`${PANEL} relative justify-between bg-white/[0.04] ring-1 ring-white/[0.06]`}>
                <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible">
                    {branches.map((d, i) => (
                        <motion.path
                            key={i}
                            d={d}
                            fill="none"
                            stroke={CORAL}
                            strokeOpacity={0.6}
                            strokeWidth={1}
                            initial={{ pathLength: 0 }}
                            animate={play ? { pathLength: 1 } : undefined}
                            transition={{ duration: 0.5, delay: 0.45 + i * 0.1, ease: EASE }}
                        />
                    ))}
                </svg>
                <motion.div
                    ref={sourceRef}
                    className="relative mx-auto flex items-center gap-1.5 rounded-md bg-[#2a2a2c] px-2 py-1 ring-1 ring-white/[0.1]"
                    initial={{ opacity: 0 }}
                    animate={play ? { opacity: 1 } : undefined}
                    transition={{ duration: 0.35, delay: 0.15, ease: EASE }}
                >
                    <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: DESIGN_TOKEN.color }} />
                    <span className="font-mono text-[12px] font-medium text-primary">{DESIGN_TOKEN.name}</span>
                    <span className="text-[9px] text-quaternary">Figma</span>
                </motion.div>
                <div className="relative flex items-center justify-between gap-2">
                    {PLATFORM_TOKENS.map(({ platform, token }, i) => (
                        <motion.div
                            key={token}
                            className="relative flex min-w-0 flex-col items-center gap-0.5"
                            initial={{ opacity: 0 }}
                            animate={play ? { opacity: 1 } : undefined}
                            transition={{ duration: 0.3, delay: 0.85 + i * 0.12, ease: EASE }}
                        >
                            <span
                                ref={(el) => {
                                    targetRefs.current[i] = el;
                                }}
                                className="truncate rounded-md bg-[#2b2120] px-2 py-0.5 font-mono text-[11px] font-medium"
                                style={{ color: CORAL, boxShadow: "inset 0 0 0 1px rgba(249,112,102,0.35)" }}
                            >
                                {token}
                            </span>
                            <span className="text-[9px] text-quaternary">{platform}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// How a component's fill is built through the three collections, for each mode (Primitive → Theme → Mode)
const RESOLUTIONS = {
    dark: {
        color: "#28AFED",
        chain: [
            { layer: "Primitive", token: "blue/50" },
            { layer: "Theme", token: "primary-dark" },
            { layer: "Mode", token: "Dark" },
        ],
        // Canvas the button sits on, so each mode is shown in its own context
        canvas: {
            bg: "rgba(255,255,255,0.04)",
            chip: "rgba(255,255,255,0.06)",
            text: "rgba(255,255,255,0.75)",
            label: "rgba(255,255,255,0.5)",
            idle: "rgba(255,255,255,0.08)",
            idleText: "rgba(255,255,255,0.7)",
        },
    },
    light: {
        color: "#FF7424",
        chain: [
            { layer: "Primitive", token: "orange/600" },
            { layer: "Theme", token: "primary-light" },
            { layer: "Mode", token: "Light" },
        ],
        canvas: { bg: "#f5f5f4", chip: "#ffffff", text: "#292524", label: "#57534E", idle: "#e7e5e4", idleText: "#57534E" },
    },
} as const;
const CHAIN_LENGTH = 3;

type DsMode = keyof typeof RESOLUTIONS;

/**
 * One clock for the two design-system visuals, so they stay in step: the Solution card builds the colour for a mode
 * while the Result card shows the component in that same mode; both switch to the other mode together.
 */
const DsCycleContext = createContext<{ mode: DsMode; step: number }>({ mode: "dark", step: CHAIN_LENGTH });

const DsCycle = ({ play, live, children }: { play: boolean; live: boolean; children: ReactNode }) => {
    const reduce = useReducedMotion();
    const [state, setState] = useState<{ mode: DsMode; step: number }>({ mode: "dark", step: 0 });
    useEffect(() => {
        if (!play) return;
        if (reduce) return setState({ mode: "dark", step: CHAIN_LENGTH });
        if (!live) return;
        // 1-3: one more layer each tick; 4-5: hold with the button filled; then the other mode from scratch
        const id = setInterval(
            () =>
                setState(({ mode, step }) =>
                    step + 1 < CHAIN_LENGTH + 3 ? { mode, step: step + 1 } : { mode: mode === "dark" ? "light" : "dark", step: 0 },
                ),
            750,
        );
        return () => clearInterval(id);
    }, [play, reduce, live]);
    return <DsCycleContext.Provider value={state}>{children}</DsCycleContext.Provider>;
};

/**
 * Solution: a selected button in Figma, its fill built layer by layer (Primitive → Theme → Mode). Once the mode is
 * reached, the button takes the colour; after a beat the same chain plays for the other mode (dark, then light).
 */
const TokenFlow = () => {
    const { mode, step } = useContext(DsCycleContext);
    const { color, chain, canvas } = RESOLUTIONS[mode];
    const resolved = step >= CHAIN_LENGTH;
    const tween = "background-color 400ms ease, color 400ms ease";

    return (
        <div>
            <VisualLabel>Résolution d'une couleur · {mode === "dark" ? "dark" : "light"}</VisualLabel>
            <div className={`${PANEL} justify-center ring-1 ring-white/[0.06]`} style={{ backgroundColor: canvas.bg, transition: tween }}>
                <div className="flex items-center gap-4">
                    {/* The selected layer, with Figma's blue selection box and corner handles */}
                    <div className="relative shrink-0 p-1.5">
                        <span aria-hidden="true" className="absolute inset-0 rounded-[2px] ring-1 ring-[#0d99ff]" />
                        {[
                            "-top-[3px] -left-[3px]",
                            "-top-[3px] -right-[3px]",
                            "-bottom-[3px] -left-[3px]",
                            "-right-[3px] -bottom-[3px]",
                        ].map((pos) => (
                            <span key={pos} aria-hidden="true" className={`absolute size-[6px] border border-[#0d99ff] bg-white ${pos}`} />
                        ))}
                        <span
                            className="block rounded-md px-3 py-1.5 text-[11px] font-semibold"
                            style={{
                                backgroundColor: resolved ? color : canvas.idle,
                                color: resolved ? "#fff" : canvas.idleText,
                                transition: tween,
                            }}
                        >
                            Valider
                        </span>
                    </div>
                    {/* Fill chain, one row per collection */}
                    <ol className="min-w-0 flex-1 space-y-1">
                        {chain.map(({ layer, token }, i) => (
                            <motion.li
                                key={layer}
                                className="flex items-center gap-2"
                                style={{ paddingLeft: i * 8 }}
                                initial={false}
                                animate={{ opacity: step > i ? 1 : 0.2, x: step > i ? 0 : -4 }}
                                transition={{ duration: 0.3, ease: EASE }}
                            >
                                <span
                                    className="w-[46px] shrink-0 text-[9px] tracking-wide uppercase"
                                    style={{ color: canvas.label, transition: tween }}
                                >
                                    {layer}
                                </span>
                                <span
                                    className="flex min-w-0 items-center gap-1.5 rounded-[4px] px-1.5 py-0.5"
                                    style={{ backgroundColor: canvas.chip, transition: tween }}
                                >
                                    <span
                                        className="size-2 shrink-0 rounded-[2px]"
                                        style={{ backgroundColor: step > i ? color : canvas.idle, transition: tween }}
                                    />
                                    <span className="truncate font-mono text-[9px]" style={{ color: canvas.text, transition: tween }}>
                                        {token}
                                    </span>
                                </span>
                            </motion.li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

/** Result: the same component, drawn from the tokens, switching between light and dark on its own. */
const ModeSwitch = () => {
    // Same mode as the Solution card, at the same moment
    const dark = useContext(DsCycleContext).mode === "dark";

    // Mode layer: the component only reads semantic roles; values are the real Dark / Light Mode variables of the DS
    const mode = dark
        ? {
              bg: "#2D3E47", // background-elevated
              card: "#394750", // card-elevated
              text: "#FFFFFF", // foreground
              muted: "#A6BBC7", // muted-foreground
              border: "#445662", // border-elevated
              primary: "#28AFED", // primary
              onPrimary: "#FFFFFF", // primary-foreground
          }
        : {
              bg: "#FAFAF9", // background-elevated
              card: "#FFFFFF", // card-subtle
              text: "#0C0A09", // foreground
              muted: "#57534E", // muted-foreground
              border: "#D6D3D1", // border-subtle
              primary: "#FF7424", // primary
              onPrimary: "#FFFFFF", // primary-foreground
          };
    const tween = "background-color 400ms ease, color 400ms ease, border-color 400ms ease";

    return (
        <div>
            <VisualLabel>Un composant · deux modes</VisualLabel>
            <div className={`${PANEL} justify-center ring-1 ring-white/[0.06]`} style={{ backgroundColor: mode.bg, transition: tween }}>
                <div
                    className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-2"
                    style={{ backgroundColor: mode.card, borderColor: mode.border, transition: tween }}
                >
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold" style={{ color: mode.text, transition: tween }}>
                            FAC-2041
                        </p>
                        <p className="text-[10px]" style={{ color: mode.muted, transition: tween }}>
                            Réconciliée
                        </p>
                    </div>
                    <span
                        className="rounded-md px-2 py-1 text-[10px] font-medium"
                        style={{ backgroundColor: mode.primary, color: mode.onPrimary, transition: tween }}
                    >
                        Valider
                    </span>
                </div>
                <p className="mt-2 flex items-center justify-between text-[10px]" style={{ color: mode.muted, transition: tween }}>
                    <span>Mêmes tokens, autre mode</span>
                    <span className="font-mono">Mode : {dark ? "Dark" : "Light"}</span>
                </p>
            </div>
        </div>
    );
};

export type SummaryVisuals = "invoice-automation" | "erp-connectors" | "design-system";

export const SummaryCards = ({ headlines, problem, solution, result, visuals }: SummaryCardsProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const reduce = useReducedMotion();
    const play = inView || !!reduce;
    const live = useInView(ref);

    const cards = [
        {
            label: "Problème",
            color: CORAL,
            title: headlines.problem,
            text: problem,
            visual: {
                "erp-connectors": <ImportError play={play} />,
                "invoice-automation": <ManualQueue play={play} />,
                "design-system": <TokenMismatch play={play} />,
            }[visuals ?? "invoice-automation"],
        },
        {
            label: "Solution",
            color: VIOLET,
            title: headlines.solution,
            text: solution,
            visual: {
                "erp-connectors": <InvoiceSync play={play} />,
                "invoice-automation": <AutoToggle play={play} />,
                "design-system": <TokenFlow />,
            }[visuals ?? "invoice-automation"],
        },
        {
            label: "Résultat",
            color: GREEN,
            title: headlines.result,
            text: result,
            visual: {
                "erp-connectors": <LiveInvoiceTable play={play} />,
                "invoice-automation": <AutoApproved play={play} />,
                "design-system": <ModeSwitch />,
            }[visuals ?? "invoice-automation"],
        },
    ];

    return (
        <LoopContext.Provider value={live}>
            <DsCycle play={play && visuals === "design-system"} live={live}>
                <h2 className="sr-only">En résumé</h2>
                <div ref={ref} className="mt-16 grid gap-4 md:grid-cols-3">
                    {cards.map((card, i) => (
                        <motion.article
                            key={card.label}
                            className="relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.035] p-6 ring-1 ring-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-7"
                            initial={{ opacity: 0, y: 20 }}
                            animate={play ? { opacity: 1, y: 0 } : undefined}
                            transition={{ duration: 0.7, delay: reduce ? 0 : i * 0.1, ease: EASE }}
                        >
                            {/* Faint top glow in the card's colour */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-[0.07]"
                                style={{ background: `radial-gradient(ellipse 70% 100% at 50% 0%, ${card.color}, transparent)` }}
                            />

                            <p className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color: card.color }}>
                                {card.label}
                            </p>
                            <h3 className="font-display mt-4 text-[1.5rem] leading-[1.15] text-balance text-primary">{card.title}</h3>
                            <p className="mt-3 text-[15px] leading-[1.6] text-pretty text-tertiary">{card.text}</p>

                            {visuals && (
                                <div aria-hidden="true" className="mt-auto pt-8">
                                    <div className="border-t border-white/[0.06] pt-5">{card.visual}</div>
                                </div>
                            )}
                        </motion.article>
                    ))}
                </div>
            </DsCycle>
        </LoopContext.Provider>
    );
};
