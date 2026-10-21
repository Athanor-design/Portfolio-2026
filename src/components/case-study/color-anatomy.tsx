import { type CSSProperties, type FC, type ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    BellRinging01,
    Briefcase01,
    CalendarDate,
    ChevronDown,
    ChevronUp,
    Dataflow03,
    InfoCircle,
    ShieldTick,
    User01,
    XClose,
} from "@untitledui/icons";
import { useInView, useReducedMotion } from "motion/react";
import { modeCollection } from "@/data/tokens/mode";
import { cx } from "@/utils/cx";

/*
 * Colour usage guide, shown rather than told: a shadcn/ui Dialog holding a launch checklist (Accordion, Badge, Button —
 * same structure and classes as the registry) themed with the real Mode variables of the design system. Hovering a variable selects, in
 * Figma blue, every element that uses it (and vice versa); Dark / Light swaps the dialog to the other mode's values.
 */

type Mode = "Dark" | "Light";

/** The variables the guide documents, with what each one is for. */
// Descriptions after shadcn/ui's theming docs, adapted to the subtle / elevated variants of the design system.
const USAGES: { token: string; purpose: string }[] = [
    { token: "card-subtle", purpose: "Fond des cartes et des dialogues" },
    { token: "foreground", purpose: "Couleur de texte par défaut" },
    { token: "muted-foreground", purpose: "Texte atténué : descriptions, libellés" },
    { token: "border-subtle", purpose: "Couleur de bordure par défaut" },
    { token: "background-subtle", purpose: "Fond secondaire de l'interface" },
    { token: "background-elevated", purpose: "Fond d'un élément en relief" },
    { token: "success", purpose: "Statuts et retours positifs" },
    { token: "secondary", purpose: "Actions et éléments secondaires" },
    { token: "primary", purpose: "Actions principales" },
    { token: "primary-foreground", purpose: "Texte sur la couleur principale" },
];

/** Accordion steps of the dialog; the first one is open. */
const STEPS: { icon: FC<{ className?: string }>; title: string; text: string; done: boolean; info?: boolean }[] = [
    {
        icon: ShieldTick,
        title: "Ownership & cadence",
        text: "Lock in the primary operator, workspace alias, and review window.",
        done: true,
    },
    { icon: Dataflow03, title: "Connected apps", text: "Choose the tools that can send events or receive rollout updates.", done: false },
    {
        icon: BellRinging01,
        title: "Fallback rules",
        text: "Set where alerts and digests land if the primary flow is paused.",
        done: false,
        info: true,
    },
];

const DETAILS = [
    { icon: User01, label: "Launch owner", value: "Ari Mendoza" },
    { icon: Briefcase01, label: "Workspace alias", value: "growth-command" },
    { icon: CalendarDate, label: "Review window", value: "Tue, 10:00 UTC" },
];

/** Mode variable → CSS colour, for both modes, read from the Figma export. */
const PALETTES: Record<Mode, Record<string, string>> = (() => {
    const result: Record<Mode, Record<string, string>> = { Dark: {}, Light: {} };
    for (const group of modeCollection.groups) {
        if (group.path.length) continue;
        for (const token of group.tokens) {
            token.values.forEach((v, i) => {
                const hex = String(v.value);
                const alpha =
                    v.alpha === undefined
                        ? ""
                        : Math.round((v.alpha / 100) * 255)
                              .toString(16)
                              .padStart(2, "0");
                result[modeCollection.modes[i] as Mode][token.name] = hex + alpha;
            });
        }
    }
    return result;
})();

/** Variables as CSS custom properties, so the components below read them like shadcn's theme. */
const themeStyle = (mode: Mode) =>
    Object.fromEntries(Object.entries(PALETTES[mode]).map(([name, value]) => [`--${name}`, value])) as CSSProperties;

const ActiveContext = createContext<{ active: string | null; setActive: (token: string | null) => void }>({
    active: null,
    setActive: () => {},
});

/** Wraps an element of the mock UI: selected in Figma blue when one of its variables is highlighted. */
const Target = ({ tokens, children, className }: { tokens: string[]; children: ReactNode; className?: string }) => {
    const { active, setActive } = useContext(ActiveContext);
    const on = !!active && tokens.includes(active);
    return (
        <div
            onMouseEnter={() => setActive(tokens[0])}
            onMouseLeave={() => setActive(null)}
            className={cx("relative rounded-[inherit] transition-shadow duration-150", on && "z-10 shadow-[0_0_0_2px_#0d99ff]", className)}
        >
            {children}
            {on && (
                <span className="pointer-events-none absolute -top-[18px] left-0 z-20 rounded-[3px] bg-[#0d99ff] px-1 py-px font-mono text-[9px] leading-none whitespace-nowrap text-white">
                    {active}
                </span>
            )}
        </div>
    );
};

interface ColorAnatomyProps {
    /** Static preview (carousel card): no interaction, hidden from assistive tech, tour plays on its own. */
    preview?: boolean;
    className?: string;
}

export const ColorAnatomy = ({ preview = false, className }: ColorAnatomyProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inView = useInView(rootRef);
    const reduce = useReducedMotion();
    const [chosenMode, setMode] = useState<Mode | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [tour, setTour] = useState(0);

    // Idle tour: walks through every variable in Light (the default), then in Dark, so the guide reads on its own.
    // It pauses while the visitor points at something, off-screen, and with reduced motion.
    useEffect(() => {
        if (hovered || !inView || reduce) return;
        const id = setInterval(() => setTour((t) => (t + 1) % (USAGES.length * 2)), 1400);
        return () => clearInterval(id);
    }, [hovered, inView, reduce]);
    // The carousel card always shows Light; the full view starts in Light, then alternates with Dark.
    const mode: Mode = preview ? "Light" : (chosenMode ?? (tour < USAGES.length ? "Light" : "Dark"));

    // Keep the highlighted variable visible in the list (scrolls the list only, never the page)
    const listRef = useRef<HTMLUListElement>(null);

    const active = hovered ?? USAGES[tour % USAGES.length].token;
    useEffect(() => {
        const list = listRef.current;
        const row = list?.querySelector<HTMLElement>(`[data-token="${active}"]`);
        if (!list || !row || hovered) return;
        const top = row.offsetTop; // the list is the rows' offset parent (relative)
        if (top < list.scrollTop || top + row.offsetHeight > list.scrollTop + list.clientHeight)
            list.scrollTo({ top: top - list.clientHeight / 2 + row.offsetHeight / 2, behavior: reduce ? "auto" : "smooth" });
    }, [active, hovered, reduce]);
    const context = useMemo(() => ({ active, setActive: setHovered }), [active]);
    const Clickable = preview ? "div" : "button";

    return (
        <ActiveContext.Provider value={context}>
            <div
                ref={rootRef}
                aria-hidden={preview || undefined}
                inert={preview || undefined}
                className={cx(
                    "grid grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_272px] bg-[#1e1e1e] font-[Inter,ui-sans-serif,system-ui] text-[12px] antialiased",
                    className,
                )}
            >
                {/* shadcn/ui Dialog (checklist with an Accordion), open over the app and themed with the Mode variables */}
                <div className="flex min-w-0" style={themeStyle(mode)}>
                    {/* Neutral grey stage, outside the design system, so only the dialog carries the tokens */}
                    <div
                        className={cx(
                            "relative flex min-w-0 flex-1 items-center justify-center overflow-hidden p-3 transition-colors duration-300 sm:p-5",
                            mode === "Dark" ? "bg-[#333333]" : "bg-[#e5e5e5]",
                        )}
                    >
                        <Target tokens={["card-subtle", "border-subtle"]} className="w-full rounded-lg sm:max-w-[460px] sm:rounded-xl">
                            <div className="relative flex flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--card-subtle)] text-[var(--foreground)] shadow-lg sm:rounded-xl transition-colors duration-300">
                                <XClose aria-hidden="true" className="absolute top-3.5 right-3.5 size-4 opacity-70" />
                                {/* DialogHeader */}
                                <div className="flex flex-col gap-1 px-4 pt-4 pb-2">
                                    <Target tokens={["foreground"]} className="w-fit rounded-sm">
                                        <p className="text-[14px] leading-tight font-semibold">Launch checklist</p>
                                    </Target>
                                    <Target tokens={["muted-foreground"]} className="w-fit rounded-sm">
                                        <p className="text-[11px] text-[var(--muted-foreground)]">
                                            Finalize routing, apps, and fallback rules before launch.
                                        </p>
                                    </Target>
                                </div>
                                {/* Accordion */}
                                <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
                                    {STEPS.map(({ icon: Icon, title, text, done, info }, index) => (
                                        <div key={title} className="flex gap-3">
                                            <Target tokens={["background-subtle", "border-subtle"]} className="hidden h-fit shrink-0 rounded-lg sm:block">
                                                <span className="flex size-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--background-subtle)] text-[var(--foreground)] transition-colors duration-300">
                                                    <Icon className="size-4" />
                                                </span>
                                            </Target>
                                            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                        <span className="flex items-center gap-1.5 text-[12px] font-medium">
                                                            {title}
                                                            {info && <InfoCircle className="size-3.5 text-[var(--muted-foreground)]" />}
                                                        </span>
                                                        <span className="text-[11px] leading-snug text-[var(--muted-foreground)]">
                                                            {text}
                                                        </span>
                                                    </div>
                                                    <Target tokens={[done ? "success" : "secondary"]} className="shrink-0 rounded-md">
                                                        <span
                                                            className="inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-medium whitespace-nowrap transition-colors duration-300"
                                                            style={
                                                                done
                                                                    ? {
                                                                          color: "var(--success)",
                                                                          backgroundColor:
                                                                              "color-mix(in srgb, var(--success) 12%, transparent)",
                                                                          borderColor:
                                                                              "color-mix(in srgb, var(--success) 30%, transparent)",
                                                                      }
                                                                    : {
                                                                          backgroundColor: "var(--secondary)",
                                                                          borderColor: "transparent",
                                                                      }
                                                            }
                                                        >
                                                            {done ? "In progress" : "Pending"}
                                                        </span>
                                                    </Target>
                                                    {index === 0 ? (
                                                        <ChevronUp className="mt-0.5 size-3.5 shrink-0 text-[var(--muted-foreground)]" />
                                                    ) : (
                                                        <ChevronDown className="mt-0.5 size-3.5 shrink-0 text-[var(--muted-foreground)]" />
                                                    )}
                                                </div>
                                                {/* AccordionContent of the open step */}
                                                {index === 0 && (
                                                    <Target tokens={["background-elevated", "border-subtle"]} className="rounded-lg">
                                                        <dl className="flex flex-col gap-2 rounded-lg border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--background-elevated)_45%,transparent)] px-3 py-2.5 transition-colors duration-300">
                                                            {DETAILS.map(({ icon: DetailIcon, label, value }) => (
                                                                <div
                                                                    key={label}
                                                                    className="grid grid-cols-[108px_minmax(0,1fr)] gap-x-3 text-[11px] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-2"
                                                                >
                                                                    <dt className="flex min-w-0 items-center gap-2 text-[var(--muted-foreground)]">
                                                                        <DetailIcon className="size-3.5 shrink-0" />
                                                                        <span className="whitespace-nowrap sm:truncate">{label}</span>
                                                                    </dt>
                                                                    <dd className="truncate">{value}</dd>
                                                                </div>
                                                            ))}
                                                        </dl>
                                                    </Target>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* DialogFooter */}
                                <Target tokens={["background-subtle", "border-subtle"]} className="rounded-none">
                                    <div className="flex justify-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--background-subtle)] px-4 py-3 transition-colors duration-300">
                                        <Target tokens={["border-subtle", "card-subtle"]} className="rounded-md">
                                            <span className="inline-flex h-7 items-center rounded-md border border-[var(--border-subtle)] bg-[var(--card-subtle)] px-3 text-[11px] font-medium shadow-xs">
                                                Cancel
                                            </span>
                                        </Target>
                                        <Target tokens={["primary", "primary-foreground"]} className="rounded-md">
                                            <span className="inline-flex h-7 items-center rounded-md border border-transparent bg-[var(--primary)] px-3 text-[11px] font-medium text-[var(--primary-foreground)] shadow-xs">
                                                Save
                                            </span>
                                        </Target>
                                    </div>
                                </Target>
                            </div>
                        </Target>
                    </div>
                </div>

                {/* The guide: variables and what they're for */}
                <div className="flex min-h-0 flex-col border-t border-white/[0.08] bg-[#252525] text-[#e6e6e6] md:border-t-0 md:border-l">
                    <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                        <span className="text-[12px] font-semibold">Guide d'usage</span>
                        <div className="flex rounded-md bg-white/[0.06] p-0.5" role={preview ? undefined : "group"} aria-label="Mode">
                            {(["Light", "Dark"] as Mode[]).map((m) => (
                                <Clickable
                                    key={m}
                                    {...(!preview && { type: "button" as const, "aria-pressed": mode === m })}
                                    onClick={() => setMode(m)}
                                    className={cx(
                                        "rounded-[5px] px-2 py-0.5 text-[11px] transition duration-100 ease-linear",
                                        mode === m ? "bg-white/[0.14] font-medium text-white" : "text-[#9a9a9a] hover:text-white",
                                    )}
                                >
                                    {m}
                                </Clickable>
                            ))}
                        </div>
                    </div>
                    <ul
                        ref={listRef}
                        className="relative max-h-[260px] min-h-0 flex-1 overflow-y-auto p-1.5 md:max-h-none [scrollbar-color:#555_transparent] [scrollbar-width:thin]"
                    >
                        {USAGES.map(({ token, purpose }) => (
                            <li key={token} data-token={token}>
                                <Clickable
                                    {...(!preview && { type: "button" as const })}
                                    onMouseEnter={() => setHovered(token)}
                                    onMouseLeave={() => setHovered(null)}
                                    onFocus={() => setHovered(token)}
                                    onBlur={() => setHovered(null)}
                                    className={cx(
                                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition duration-100 ease-linear outline-none",
                                        active === token ? "bg-[#0d99ff]/[0.16]" : "hover:bg-white/[0.04]",
                                    )}
                                >
                                    <span
                                        className="size-3.5 shrink-0 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] transition-colors duration-300"
                                        style={{ backgroundColor: PALETTES[mode][token] }}
                                    />
                                    <span className="min-w-0">
                                        <span
                                            className={cx(
                                                "block truncate font-mono text-[11px]",
                                                active === token ? "text-[#4fb4ff]" : "text-white",
                                            )}
                                        >
                                            {token}
                                        </span>
                                        <span className="line-clamp-2 block text-[10px] leading-snug text-[#9a9a9a]">{purpose}</span>
                                    </span>
                                </Clickable>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </ActiveContext.Provider>
    );
};
