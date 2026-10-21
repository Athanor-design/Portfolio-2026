import { ChevronRight, LayoutLeft, Maximize02, Plus, SearchLg, Settings04, XClose } from "@untitledui/icons";
import { type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { modeCollection } from "@/data/tokens/mode";
import { primitiveCollection } from "@/data/tokens/primitive";
import { themeCollection } from "@/data/tokens/theme";
import type { Token, TokenCollection, TokenGroup, TokenValue } from "@/data/tokens/types";
import { cx } from "@/utils/cx";

/*
 * Replica of Figma's Variables panel, fed with the real exports of the design system, so a reader can browse the
 * token groups like in the file. It mimics Figma's light UI on purpose, hence the literal neutral colours below
 * (the site's semantic tokens are dark). Each collection shows one value column per mode (Treso2 / BPI, Dark / Light).
 */

const countTokens = (groups: TokenGroup[]) => groups.reduce((total, group) => total + group.tokens.length, 0);

const COLLECTIONS: TokenCollection[] = [primitiveCollection, themeCollection, modeCollection];

/** A node of Figma's "Groups" tree: `dark` → `dark/blue`, `dark/neutral`… with the number of variables inside. */
interface GroupNode {
    key: string;
    name: string;
    count: number;
    children: GroupNode[];
}

const buildTree = (groups: TokenGroup[]) => {
    const root: GroupNode = { key: "", name: "", count: 0, children: [] };
    for (const g of groups) {
        let node = root;
        g.path.forEach((name, depth) => {
            const key = g.path.slice(0, depth + 1).join("/");
            let child = node.children.find((c) => c.key === key);
            if (!child) node.children.push((child = { key, name, count: 0, children: [] }));
            child.count += g.tokens.length;
            node = child;
        });
    }
    return root.children;
};

/** True when a group path sits at or under the selected tree node. */
/** Search: a variable matches on its group path, name, values or aliases. */
const tokenMatches = (group: TokenGroup, token: Token, q: string) =>
    [group.path.join("/"), token.name, ...token.values.flatMap((v) => [String(v.value), v.alias ?? ""])]
        .join(" ")
        .toLowerCase()
        .includes(q);

const inGroup = (path: string[], key: string | null) => {
    if (!key) return true;
    const joined = path.join("/");
    return joined === key || joined.startsWith(`${key}/`);
};

/** Flattened tree for the small-screen select, children indented under their parent. */
const flattenTree = (nodes: GroupNode[], depth = 0): { node: GroupNode; depth: number }[] =>
    nodes.flatMap((node) => [{ node, depth }, ...flattenTree(node.children, depth + 1)]);

/** Colour swatch, used in the Value column. */
const Swatch = ({ color }: { color: string }) => (
    <span
        className="size-[14px] shrink-0 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
        // Checkerboard under the colour, so translucent values read as such (as in Figma)
        style={{ background: `linear-gradient(${color}, ${color}), repeating-conic-gradient(#d9d9d9 0 25%, #fff 0 50%) 0 0 / 7px 7px` }}
    />
);

/** Lucide "palette" icon (ISC licence), inlined to avoid adding the whole library for one glyph. */
const PaletteIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[14px] shrink-0"
        aria-hidden="true"
    >
        <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
);

/** Type icon in front of each variable name, as in Figma: a palette for colours, "#" for numbers, "T" for text. */
const TypeIcon = ({ token }: { token: Token }) =>
    token.type === "color" ? (
        <PaletteIcon />
    ) : (
        <span className="flex size-[14px] shrink-0 items-center justify-center rounded-[3px] border border-[#1e1e1e] text-[9px] leading-none font-semibold">
            {token.type === "string" ? "T" : "#"}
        </span>
    );

/** Swatch shown translucent over a checkerboard, so opacity variants read as such. */
const colorWithAlpha = (hex: string, alpha?: number) =>
    alpha === undefined
        ? hex
        : `${hex}${Math.round((alpha / 100) * 255)
              .toString(16)
              .padStart(2, "0")}`;

/** Opacity field next to a colour, like Figma's "5%" box. Muted when inherited from the alias itself. */
const AlphaField = ({ alpha, muted }: { alpha: number; muted: boolean }) => (
    <span
        className={cx(
            "ml-auto inline-flex shrink-0 items-center gap-1 rounded-[5px] px-1 py-1 text-[11px] tabular-nums",
            muted ? "text-[#b3b3b3]" : "bg-[#f5f5f5]",
        )}
    >
        <span className="size-[11px] rounded-[2px] border border-current opacity-60" aria-hidden="true" />
        {alpha}%
    </span>
);

/** One mode's value: an alias chip (with swatch for colours), a raw colour, or a raw number / string. */
const Value = ({ token, value }: { token: Token; value: TokenValue }) => {
    const isColor = token.type === "color";
    // Variants like primary\5 set their own opacity on top of an opaque alias: solid swatch, active opacity field.
    // Otherwise the opacity comes from the alias itself and is shown muted, as in Figma.
    const ownAlpha = !!value.ownAlpha;
    const swatch = isColor && <Swatch color={colorWithAlpha(String(value.value), ownAlpha ? undefined : value.alpha)} />;
    return (
        <span className="flex min-w-0 items-start gap-2 md:items-center">
            {value.alias ? (
                <span className="inline-flex min-w-0 items-start gap-1.5 rounded-[5px] border border-[#e6e6e6] px-1.5 py-1 text-[11px] leading-[14px] md:items-center">
                    {swatch}
                    <span className="[overflow-wrap:anywhere] md:truncate">{value.alias}</span>
                </span>
            ) : isColor ? (
                <span className="inline-flex items-center gap-2">
                    {swatch}
                    {String(value.value).replace("#", "")}
                </span>
            ) : (
                <span className="tabular-nums [overflow-wrap:anywhere] md:truncate">{value.value}</span>
            )}
            {isColor && value.alpha !== undefined && <AlphaField alpha={value.alpha} muted={!!value.alias && !ownAlpha} />}
        </span>
    );
};

const MIN_COLUMN = 96;

/**
 * Drag handle on a header cell's right edge, like Figma's column resize: drag (or ←/→ when focused) to change the
 * width, double-click to restore the default widths.
 */
const ColumnResizer = ({
    label,
    left,
    getWidth,
    onResize,
    onReset,
}: {
    label: string;
    /** x of the column's right border, in px from the table's left edge. */
    left: number;
    getWidth: () => number;
    onResize: (width: number) => void;
    onReset: () => void;
}) => {
    const drag = useRef<{ x: number; width: number } | null>(null);
    return (
        <span
            role="separator"
            aria-orientation="vertical"
            aria-label={label}
            tabIndex={0}
            onPointerDown={(event: PointerEvent<HTMLSpanElement>) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX, width: getWidth() };
            }}
            onPointerMove={(event) => drag.current && onResize(drag.current.width + event.clientX - drag.current.x)}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onDoubleClick={onReset}
            onKeyDown={(event: KeyboardEvent) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    onResize(getWidth() + (event.key === "ArrowRight" ? 16 : -16));
                }
            }}
            // Spans the whole column border, header and rows, so it can be grabbed anywhere along the line
            style={{ left: left - 4 }}
            className="group/resize absolute top-0 z-20 flex h-full w-[9px] cursor-col-resize touch-none justify-center outline-none select-none"
        >
            {/* Figma-blue line on hover / drag / keyboard focus */}
            <span className="h-full w-[2px] bg-[#0d99ff] opacity-0 transition-opacity duration-100 group-hover/resize:opacity-100 group-focus-visible/resize:opacity-100 group-active/resize:opacity-100" />
        </span>
    );
};

/** Demo tour for the carousel preview: a cursor clicks through collections and groups, like browsing the file. */
const TOUR: ({ collection: string } | { group: string })[] = [
    { group: "spacing" },
    { group: "tailwind" },
    { group: "border-radius" },
    { collection: "Theme" },
    { group: "colors" },
    { group: "text" },
    { collection: "Mode" },
    { group: "custom" },
    { group: "Alpha" },
    { collection: "Primitive" },
];
const TOUR_STEP = 1800;

/** macOS-style arrow pointer. */
const CursorArrow = () => (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true" className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
        <path d="M1.5 1.5v16.2l4.3-4.1 2.8 6.6 3-1.3-2.8-6.5h6z" fill="#1e1e1e" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

/**
 * Row of chips that scrolls sideways: by touch, but also with a mouse wheel / trackpad (vertical scroll is turned
 * sideways) or by dragging. A fade on the right edge shows there is more to see.
 */
const ChipRow = ({ label, children }: { label: string; children: ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: true, end: false });
    useEffect(() => {
        const row = ref.current;
        if (!row) return;
        const update = () => setEdges({ start: row.scrollLeft <= 2, end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 2 });
        update();
        // Vertical wheel scrolls the row while it can still move, then lets the page scroll
        const onWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
            const max = row.scrollWidth - row.clientWidth;
            const next = row.scrollLeft + event.deltaY;
            if ((event.deltaY < 0 && row.scrollLeft <= 0) || (event.deltaY > 0 && row.scrollLeft >= max)) return;
            event.preventDefault();
            row.scrollLeft = Math.max(0, Math.min(max, next));
        };
        row.addEventListener("wheel", onWheel, { passive: false });
        row.addEventListener("scroll", update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(row);
        return () => {
            row.removeEventListener("wheel", onWheel);
            row.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, []);
    // Mouse drag (touch already scrolls natively); a drag doesn't count as a click on the chip under the pointer
    const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
    return (
        <div
            ref={ref}
            role="group"
            aria-label={label}
            onPointerDown={(event) => {
                if (event.pointerType !== "mouse" || !ref.current) return;
                drag.current = { x: event.clientX, left: ref.current.scrollLeft, moved: false };
            }}
            onPointerMove={(event) => {
                const d = drag.current;
                if (!d || !ref.current) return;
                const dx = event.clientX - d.x;
                if (Math.abs(dx) > 4) d.moved = true;
                if (d.moved) ref.current.scrollLeft = d.left - dx;
            }}
            onPointerUp={() => setTimeout(() => (drag.current = null))}
            onPointerLeave={() => (drag.current = null)}
            onClickCapture={(event) => {
                if (drag.current?.moved) event.stopPropagation();
            }}
            className={cx(
                "-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] select-none",
                // Fades on the sides that still hide chips
                !edges.end && edges.start && "[mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)]",
                !edges.end &&
                    !edges.start &&
                    "[mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-40px),transparent)]",
                edges.end && !edges.start && "[mask-image:linear-gradient(to_right,transparent,black_28px)]",
            )}
        >
            {children}
            {/* Keeps the right padding inside the scroll area */}
            <span aria-hidden="true" className="w-1.5 shrink-0" />
        </div>
    );
};

interface FigmaVariablesProps {
    /** Static preview (carousel card): no interaction, hidden from assistive tech. */
    preview?: boolean;
    /** With `preview`: play the demo tour (only while the carousel card is the active one). */
    autoplay?: boolean;
    className?: string;
}

export const FigmaVariables = ({ preview = false, autoplay = false, className }: FigmaVariablesProps) => {
    const [collectionName, setCollectionName] = useState("Primitive");
    const [group, setGroup] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    // Figma's sidebar toggle: collapsed, the table takes the full width and the collection name moves to the top bar
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const collection = COLLECTIONS.find((c) => c.name === collectionName) ?? primitiveCollection;
    const multiMode = collection.modes.length > 1;
    // Phones show one mode column at a time (picked with a segmented control) instead of scrolling sideways
    const [phoneMode, setPhoneMode] = useState(0);
    const shownMode = Math.min(phoneMode, collection.modes.length - 1);

    // Column widths (Name + one per mode), in px, per collection; unset = the default proportional layout
    const [columnWidths, setColumnWidths] = useState<Record<string, number[]>>({});
    const headerCells = useRef<(HTMLTableCellElement | null)[]>([]);
    const widths = columnWidths[collection.name];
    const currentWidths = () =>
        widths ??
        headerCells.current.slice(0, collection.modes.length + 1).map((th) => Math.round(th?.getBoundingClientRect().width ?? 160));
    const resizeColumn = (index: number, width: number) => {
        const next = [...currentWidths()];
        next[index] = Math.max(MIN_COLUMN, Math.round(width));
        setColumnWidths((all) => ({ ...all, [collection.name]: next }));
    };
    // Right border of each resizable column (Name + modes), measured from the header, for the full-height handles
    const tableRef = useRef<HTMLTableElement>(null);
    const [edges, setEdges] = useState<number[]>([]);
    useLayoutEffect(() => {
        const table = tableRef.current;
        if (!table || preview) return;
        const measure = () =>
            setEdges(
                headerCells.current
                    .slice(0, collection.modes.length + 1)
                    .map((th) => (th ? Math.round(th.offsetLeft + th.offsetWidth) : 0)),
            );
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(table);
        return () => observer.disconnect();
    }, [collection, widths, preview]);
    const resetColumns = () =>
        setColumnWidths((all) => {
            const { [collection.name]: _removed, ...rest } = all;
            return rest;
        });

    // Groups tree (spacing, tailwind › cyan, dark › blue…) with token counts, like Figma's "Groups" list
    const tree = useMemo(() => buildTree(collection.groups), [collection]);

    const toggle = (key: string) =>
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    // Selecting a group also opens it, so its sub-groups show
    const select = (node: GroupNode) => {
        setGroup(node.key);
        if (node.children.length) setExpanded((current) => new Set(current).add(node.key));
    };

    const visibleGroups = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (
            collection.groups
                // Searching looks through the whole collection, whatever group is selected
                .filter((g) => q || inGroup(g.path, group))
                .map((g) => ({
                    ...g,
                    tokens: q ? g.tokens.filter((t) => tokenMatches(g, t, q)) : g.tokens,
                }))
                .filter((g) => g.tokens.length)
        );
    }, [collection, group, query]);

    // Search stays within the open collection (as in Figma), so point to matches in the other collections
    const elsewhere = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return COLLECTIONS.filter((c) => c.name !== collection.name)
            .map((c) => ({ name: c.name, count: c.groups.reduce((n, g) => n + g.tokens.filter((t) => tokenMatches(g, t, q)).length, 0) }))
            .filter((c) => c.count);
    }, [collection, query]);
    const openCollection = (name: string) => {
        setCollectionName(name);
        setGroup(null);
    };

    // In the carousel preview the whole card is a button, so nothing inside may be interactive
    const Clickable = preview ? "div" : "button";
    const SearchField = preview ? "div" : "label";
    // Demo tour: move the cursor onto the next item, then "click" it
    const rootRef = useRef<HTMLDivElement>(null);
    const tableScrollRef = useRef<HTMLDivElement>(null);
    const [cursor, setCursor] = useState<{ x: number; y: number; clicks: number } | null>(null);
    const actions = useRef({ select, tree, setCollectionName, setGroup });
    actions.current = { select, tree, setCollectionName, setGroup };
    useEffect(() => {
        if (!autoplay) return;
        let step = 0;
        let clickTimer: ReturnType<typeof setTimeout>;
        const run = () => {
            const target = TOUR[step % TOUR.length];
            step += 1;
            const key = "collection" in target ? `collection:${target.collection}` : `group:${target.group}`;
            const root = rootRef.current;
            const el = root?.querySelector<HTMLElement>(`[data-nav="${key}"]`);
            if (!root || !el) return;
            const r = el.getBoundingClientRect();
            const base = root.getBoundingClientRect();
            // The carousel may scale its stage: convert screen px back to the panel's own px
            const k = root.offsetWidth / base.width || 1;
            setCursor((c) => ({ x: (r.left - base.left) * k + 28, y: (r.top - base.top + r.height / 2) * k - 4, clicks: c?.clicks ?? 0 }));
            clickTimer = setTimeout(() => {
                const { select: pick, tree: nodes, setCollectionName: setName, setGroup: setG } = actions.current;
                if ("collection" in target) {
                    setName(target.collection);
                    setG(null);
                } else {
                    const node = flattenTree(nodes).find(({ node: n }) => n.key === target.group)?.node;
                    if (node) pick(node);
                }
                tableScrollRef.current?.scrollTo({ top: 0 });
                setCursor((c) => c && { ...c, clicks: c.clicks + 1 });
            }, 650);
        };
        run();
        const id = setInterval(run, TOUR_STEP);
        return () => {
            clearInterval(id);
            clearTimeout(clickTimer);
        };
    }, [autoplay]);

    const sideItem = "flex w-full items-center justify-between rounded-[6px] px-2.5 py-[7px] text-left transition duration-100 ease-linear";

    return (
        <div
            ref={rootRef}
            aria-hidden={preview || undefined}
            inert={preview || undefined}
            className={cx(
                "relative",
                // Light UI inside a dark site: light colour scheme + thin scrollbars on a transparent track, like Figma
                "flex overflow-hidden bg-white font-[Inter,ui-sans-serif,system-ui] text-[12px] text-[#1e1e1e] antialiased [color-scheme:light] [scrollbar-color:#c7c7c7_transparent] [scrollbar-width:thin]",
                className,
            )}
        >
            {autoplay && cursor && (
                <motion.div
                    className="pointer-events-none absolute top-0 left-0 z-30"
                    initial={false}
                    animate={{ x: cursor.x, y: cursor.y }}
                    transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.8 }}
                >
                    {/* Press on each click */}
                    <motion.div key={cursor.clicks} initial={{ scale: 0.82 }} animate={{ scale: 1 }} transition={{ duration: 0.25 }}>
                        <CursorArrow />
                    </motion.div>
                </motion.div>
            )}
            {/* Sidebar: collections, then the groups of the selected collection */}
            <aside className={cx("hidden w-[200px] shrink-0 flex-col border-r border-[#e6e6e6]", sidebarOpen && "md:flex")}>
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e6e6e6] px-3.5">
                    <span className="text-[13px] font-semibold">Variables</span>
                    <Clickable
                        {...(!preview && { type: "button" as const })}
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Masquer la barre latérale"
                        aria-expanded={true}
                        className="-mr-1 flex size-7 items-center justify-center rounded-[5px] text-[#1e1e1e] transition duration-100 ease-linear hover:bg-[#f0f0f0]"
                    >
                        <LayoutLeft className="size-4" aria-hidden="true" />
                    </Clickable>
                </div>
                <div className="border-b border-[#e6e6e6] px-2 py-2.5">
                    <div className="flex items-center justify-between px-2.5 pb-1.5">
                        <span className="text-[12px] font-semibold">Collections</span>
                        <span className="flex items-center gap-2.5 text-[#1e1e1e]">
                            <Settings04 className="size-3.5" aria-hidden="true" />
                            <Plus className="size-3.5" aria-hidden="true" />
                        </span>
                    </div>
                    {COLLECTIONS.map((c) => (
                        <Clickable
                            key={c.name}
                            data-nav={`collection:${c.name}`}
                            {...(!preview && { type: "button" as const })}
                            onClick={() => {
                                setCollectionName(c.name);
                                setGroup(null);
                            }}
                            aria-pressed={c.name === collectionName}
                            className={cx(sideItem, c.name === collectionName ? "bg-[#f0f0f0] font-semibold" : "hover:bg-[#f5f5f5]")}
                        >
                            {c.name}
                            <span className="font-normal text-[#8c8c8c] tabular-nums">{countTokens(c.groups)}</span>
                        </Clickable>
                    ))}
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-2 py-2.5">
                    <div className="px-2.5 pb-1.5 text-[12px] font-semibold">Groups</div>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <Clickable
                            {...(!preview && { type: "button" as const })}
                            onClick={() => setGroup(null)}
                            aria-pressed={!group}
                            className={cx(sideItem, !group ? "bg-[#e5f4ff] font-semibold" : "hover:bg-[#f5f5f5]")}
                        >
                            All
                            <span className="font-normal text-[#8c8c8c] tabular-nums">{countTokens(collection.groups)}</span>
                        </Clickable>
                        {(function renderNodes(nodes: GroupNode[], depth: number): ReactNode {
                            return nodes.map((node) => {
                                const isOpen = expanded.has(node.key);
                                const isSelected = group === node.key;
                                return (
                                    <div key={node.key}>
                                        <div
                                            className={cx(
                                                "flex items-center rounded-[6px] transition duration-100 ease-linear",
                                                isSelected ? "bg-[#e5f4ff] font-semibold" : "hover:bg-[#f5f5f5]",
                                            )}
                                            style={{ paddingLeft: 4 + depth * 14 }}
                                        >
                                            {/* Chevron toggles the sub-groups; a placeholder keeps leaf names aligned */}
                                            {node.children.length ? (
                                                <Clickable
                                                    {...(!preview && { type: "button" as const })}
                                                    onClick={() => toggle(node.key)}
                                                    aria-expanded={isOpen}
                                                    aria-label={`${isOpen ? "Replier" : "Déplier"} ${node.name}`}
                                                    className="flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[#8c8c8c] hover:text-[#1e1e1e]"
                                                >
                                                    <ChevronRight
                                                        className={cx("size-3 transition-transform duration-100", isOpen && "rotate-90")}
                                                        aria-hidden="true"
                                                    />
                                                </Clickable>
                                            ) : (
                                                <span className="size-5 shrink-0" />
                                            )}
                                            <Clickable
                                                data-nav={`group:${node.key}`}
                                                {...(!preview && { type: "button" as const })}
                                                onClick={() => select(node)}
                                                aria-pressed={isSelected}
                                                className="flex min-w-0 flex-1 items-center justify-between py-[7px] pr-2.5 pl-1 text-left"
                                            >
                                                <span className="truncate">{node.name}</span>
                                                <span className="font-normal text-[#8c8c8c] tabular-nums">{node.count}</span>
                                            </Clickable>
                                        </div>
                                        {isOpen && renderNodes(node.children, depth + 1)}
                                    </div>
                                );
                            });
                        })(tree, 0)}
                    </div>
                </div>
            </aside>

            {/* Table of variables */}
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex h-12 shrink-0 items-center justify-end gap-2.5 border-b border-[#e6e6e6] px-3">
                    {/* Sidebar collapsed (desktop): toggle to reopen it + the current collection, as in Figma */}
                    {!sidebarOpen && (
                        <div className="mr-auto hidden min-w-0 items-center gap-2 md:flex">
                            <Clickable
                                {...(!preview && { type: "button" as const })}
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Afficher la barre latérale"
                                aria-expanded={false}
                                className="flex size-7 shrink-0 items-center justify-center rounded-[5px] text-[#1e1e1e] transition duration-100 ease-linear hover:bg-[#f0f0f0]"
                            >
                                <LayoutLeft className="size-4" aria-hidden="true" />
                            </Clickable>
                            <span className="truncate text-[13px] font-semibold">{collection.name}</span>
                        </div>
                    )}
                    <SearchField className="ml-auto flex h-8 w-full min-w-0 md:w-[180px] items-center gap-1.5 rounded-[6px] bg-[#f5f5f5] px-2 text-[#8c8c8c]">
                        <SearchLg className="size-3.5 shrink-0" aria-hidden="true" />
                        {preview ? (
                            <span>Search</span>
                        ) : (
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={(event) => {
                                    // Esc clears the field and never bubbles up to the page (where it closes the case study)
                                    if (event.key !== "Escape") return;
                                    event.stopPropagation();
                                    if (query) setQuery("");
                                    else event.currentTarget.blur();
                                }}
                                placeholder="Search"
                                aria-label="Rechercher une variable (nom, valeur ou alias)"
                                spellCheck={false}
                                autoComplete="off"
                                className="w-full min-w-0 bg-transparent text-[12px] text-[#1e1e1e] outline-none placeholder:text-[#8c8c8c] [&::-webkit-search-cancel-button]:hidden"
                            />
                        )}
                        {!preview && query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Effacer la recherche"
                                className="flex size-4 shrink-0 items-center justify-center rounded-full text-[#8c8c8c] hover:text-[#1e1e1e]"
                            >
                                <XClose className="size-3" aria-hidden="true" />
                            </button>
                        )}
                    </SearchField>
                    <Maximize02 className="hidden size-4 sm:block" aria-hidden="true" />
                    <XClose className="hidden size-4 sm:block" aria-hidden="true" />
                </div>

                {/* Phones: the sidebar is hidden. Collections become a segmented control, groups a row of chips that
                    scrolls sideways (with the sub-groups of the selected one below); multi-mode collections show one mode
                    at a time, switched from the value column header */}
                {!preview && (
                    <div className="flex shrink-0 flex-col gap-2 border-b border-[#e6e6e6] px-3 py-2.5 md:hidden">
                        <div className="grid grid-cols-3 gap-0.5 rounded-[8px] bg-[#f0f0f0] p-0.5" role="group" aria-label="Collection">
                            {COLLECTIONS.map((c) => (
                                <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => {
                                        setCollectionName(c.name);
                                        setGroup(null);
                                    }}
                                    aria-pressed={c.name === collectionName}
                                    className={cx(
                                        "flex h-8 items-center justify-center gap-1.5 rounded-[6px] text-[12px] transition duration-100 ease-linear",
                                        c.name === collectionName
                                            ? "bg-white font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                                            : "text-[#5c5c5c]",
                                    )}
                                >
                                    {c.name}
                                    <span className="text-[10px] font-normal text-[#8c8c8c] tabular-nums">{countTokens(c.groups)}</span>
                                </button>
                            ))}
                        </div>
                        {(() => {
                            const chip = (label: string, count: number, selected: boolean, onPress: () => void, key: string) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={(event) => {
                                        onPress();
                                        // Keep the tapped chip in view inside its scrolling row
                                        event.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
                                    }}
                                    aria-pressed={selected}
                                    className={cx(
                                        "flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] whitespace-nowrap transition duration-100 ease-linear",
                                        selected
                                            ? "border-[#0d99ff] bg-[#e5f4ff] font-semibold text-[#0a6dc2]"
                                            : "border-[#e6e6e6] text-[#1e1e1e]",
                                    )}
                                >
                                    {label}
                                    <span className={cx("text-[10px] tabular-nums", selected ? "text-[#0a6dc2]/70" : "text-[#8c8c8c]")}>
                                        {count}
                                    </span>
                                </button>
                            );
                            const top = tree.find((node) => group && inGroup(group.split("/"), node.key));
                            return (
                                <>
                                    <ChipRow label="Groupe de variables">
                                        {chip("All", countTokens(collection.groups), !group, () => setGroup(null), "all")}
                                        {tree.map((node) =>
                                            chip(node.name, node.count, top?.key === node.key, () => setGroup(node.key), node.key),
                                        )}
                                    </ChipRow>
                                    {top && top.children.length > 0 && (
                                        <ChipRow label={`Sous-groupes de ${top.name}`}>
                                            {chip("Tous", top.count, group === top.key, () => setGroup(top.key), "all-sub")}
                                            {top.children.map((node) =>
                                                chip(
                                                    node.name,
                                                    node.count,
                                                    !!group && inGroup(group.split("/"), node.key),
                                                    () => setGroup(node.key),
                                                    node.key,
                                                ),
                                            )}
                                        </ChipRow>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {!preview && visibleGroups.length > 0 && elsewhere.length > 0 && (
                    <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#e6e6e6] bg-[#fafafa] px-4 py-2 text-[11px] text-[#8c8c8c]">
                        Aussi dans
                        {elsewhere.map((c) => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => openCollection(c.name)}
                                className="font-semibold text-[#0a6dc2] underline-offset-2 hover:underline"
                            >
                                {c.name} ({c.count})
                            </button>
                        ))}
                    </div>
                )}

                {/* Wider screens with two modes: the table scrolls sideways when it doesn't fit */}
                <div ref={tableScrollRef} className="min-h-0 flex-1 overflow-auto overscroll-contain">
                    <div className="relative" style={widths && { minWidth: widths.reduce((sum, w) => sum + w, 0) + 40 }}>
                        <table
                            ref={tableRef}
                            className={cx("w-full table-fixed border-collapse text-left", multiMode && !widths && "md:min-w-[600px]")}
                            // Resized: columns keep their px widths, the last column takes what's left, and it scrolls when wider
                            style={widths && { minWidth: widths.reduce((sum, w) => sum + w, 0) + 40 }}
                        >
                            {/* Last (empty) column only on wider screens, like Figma's "+" column */}
                            <colgroup>
                                {widths ? (
                                    widths.map((width, i) => <col key={i} style={{ width }} />)
                                ) : (
                                    <>
                                        <col className={multiMode ? "w-[44%] md:w-[22%]" : "w-[42%]"} />
                                        {collection.modes.map((mode, m) => (
                                            <col
                                                key={mode}
                                                className={cx(
                                                    !preview &&
                                                        (m !== shownMode ? "hidden md:table-column" : multiMode && "w-[56%] md:w-auto"),
                                                )}
                                            />
                                        ))}
                                    </>
                                )}
                                <col className={widths ? "" : multiMode ? "hidden w-10 md:table-column" : "w-0 sm:w-[24%]"} />
                            </colgroup>
                            <thead className="sticky top-0 z-10 bg-white">
                                <tr className="h-10 border-b border-[#e6e6e6]">
                                    {["Name", ...collection.modes].map((label, i) => (
                                        <th
                                            key={label}
                                            ref={(th) => {
                                                headerCells.current[i] = th;
                                            }}
                                            className={cx(
                                                "border-r border-[#e6e6e6] px-4 font-medium",
                                                !preview && i > 0 && i - 1 !== shownMode && "hidden md:table-cell",
                                            )}
                                        >
                                            {/* Phones show one mode at a time: its header switches between them */}
                                            {!preview && multiMode && i > 0 ? (
                                                <>
                                                    <span className="hidden md:inline">{label}</span>
                                                    <span
                                                        className="-mx-2 grid auto-cols-fr grid-flow-col gap-0.5 rounded-[7px] bg-[#f0f0f0] p-0.5 md:hidden"
                                                        role="group"
                                                        aria-label="Mode affiché"
                                                    >
                                                        {collection.modes.map((mode, m) => (
                                                            <button
                                                                key={mode}
                                                                type="button"
                                                                onClick={() => setPhoneMode(m)}
                                                                aria-pressed={m === shownMode}
                                                                className={cx(
                                                                    "h-6 rounded-[5px] px-2.5 text-[11px] transition duration-100 ease-linear",
                                                                    m === shownMode
                                                                        ? "bg-white font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                                                                        : "font-normal text-[#5c5c5c]",
                                                                )}
                                                            >
                                                                {mode}
                                                            </button>
                                                        ))}
                                                    </span>
                                                </>
                                            ) : !preview && multiMode && i === 0 ? (
                                                // Phones: the first header labels the mode switcher next to it
                                                <>
                                                    <span className="hidden md:inline">{label}</span>
                                                    <span className="md:hidden">Mode</span>
                                                </>
                                            ) : (
                                                label
                                            )}
                                        </th>
                                    ))}
                                    <th className={multiMode ? "hidden md:table-cell" : "hidden sm:table-cell"} aria-hidden="true">
                                        {multiMode && <Plus className="mx-auto size-4" />}
                                    </th>
                                </tr>
                            </thead>
                            {visibleGroups.map((g) => (
                                <tbody key={g.path.join("/")}>
                                    {/* Variables at the root of a collection have no group header, as in Figma */}
                                    {g.path.length > 0 && (
                                        <tr className="h-12 border-b border-[#e6e6e6]">
                                            <th colSpan={collection.modes.length + 2} className="px-4 pt-3 align-bottom font-semibold">
                                                {g.path.length > 1 && (
                                                    <span className="font-normal text-[#8c8c8c]">{g.path.slice(0, -1).join(" / ")} / </span>
                                                )}
                                                {g.path.at(-1)}
                                            </th>
                                        </tr>
                                    )}
                                    {g.tokens.map((t) => (
                                        <tr key={t.name} className="h-10 border-b border-[#e6e6e6] hover:bg-[#fafafa]">
                                            <td className="border-r border-[#e6e6e6] px-3 py-2 align-top md:px-4 md:py-0 md:align-middle">
                                                <span
                                                    className="mt-[5px] flex min-w-0 items-start gap-2.5 leading-[16px] md:mt-0 md:items-center"
                                                    title={t.name}
                                                >
                                                    <TypeIcon token={t} />
                                                    <span className="[overflow-wrap:anywhere] md:truncate">{t.name}</span>
                                                </span>
                                            </td>
                                            {t.values.map((v, m) => (
                                                <td
                                                    key={collection.modes[m]}
                                                    className={cx(
                                                        "border-r border-[#e6e6e6] px-3 py-2 align-top md:py-0 md:align-middle",
                                                        !preview && m !== shownMode && "hidden md:table-cell",
                                                    )}
                                                >
                                                    <Value token={t} value={v} />
                                                </td>
                                            ))}
                                            <td className={multiMode ? "hidden md:table-cell" : "hidden sm:table-cell"} />
                                        </tr>
                                    ))}
                                </tbody>
                            ))}
                        </table>
                        {/* Column resizing is a pointer interaction: wider screens only */}
                        {!preview && (
                            <div className="hidden md:contents">
                                {edges.map((left, i) => (
                                    <ColumnResizer
                                        key={i}
                                        left={left}
                                        label={`Redimensionner la colonne ${["Name", ...collection.modes][i]}`}
                                        getWidth={() => currentWidths()[i]}
                                        onResize={(width) => resizeColumn(i, width)}
                                        onReset={resetColumns}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {!visibleGroups.length && (
                        <div className="flex flex-col items-start gap-3 px-4 py-6 text-[#8c8c8c]">
                            <p>
                                Aucune variable ne correspond à « {query} » dans {collection.name}.
                            </p>
                            {elsewhere.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span>Résultats dans</span>
                                    {elsewhere.map((c) => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => openCollection(c.name)}
                                            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#0d99ff] bg-[#e5f4ff] px-3 font-semibold text-[#0a6dc2] transition duration-100 ease-linear hover:bg-[#d6edff]"
                                        >
                                            {c.name}
                                            <span className="text-[10px] font-normal tabular-nums text-[#0a6dc2]/70">{c.count}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex h-11 shrink-0 items-center gap-2 border-t border-[#e6e6e6] px-4 text-[#1e1e1e]">
                    <Plus className="size-4" aria-hidden="true" />
                    Create variable
                </div>
            </div>
        </div>
    );
};
