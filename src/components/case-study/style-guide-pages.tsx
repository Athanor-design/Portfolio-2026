import type { ReactNode } from "react";
import { primitiveCollection } from "@/data/tokens/primitive";
import { cx } from "@/utils/cx";

/*
 * The TRESO2 style guide pages (palettes, spacing, radius), rebuilt in HTML from the Figma pages: the exports are too
 * small to stay sharp on 2x screens, while live text and shapes are crisp at any density. Colours and values are read
 * from the Primitive collection of the Figma export.
 */

/** Value of a Primitive token, by group path and name. */
const primitive = (path: string[], name: string) => {
    const group = primitiveCollection.groups.find((g) => g.path.join("/") === path.join("/"));
    return group?.tokens.find((t) => t.name === name)?.values[0].value;
};

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

/** rem on the product's 14px base, French notation ("0,57rem"). */
const rem = (px: number) =>
    `${Number((px / 14).toFixed(2))
        .toString()
        .replace(".", ",")}rem`;

/** WCAG contrast ratio between two hex colours. */
const contrast = (a: string, b: string) => {
    const luminance = (hex: string) => {
        const [r, g, b] = [1, 3, 5].map((i) => {
            const c = parseInt(hex.slice(i, i + 2), 16) / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
};

/** "AAA 8.9", "AA 5.1" or just "2.3", as on the Figma swatches. */
const rating = (ratio: number) => {
    const value = (Math.floor(ratio * 100) / 100).toString(); // truncated, like Figma
    return ratio >= 7 ? `AAA ${value}` : ratio >= 4.5 ? `AA ${value}` : value;
};

/** TRESO2 mark (icon of the official logo). */
const TresoLogo = () => <img src="/logos/treso2-icon.png" alt="" className="size-[17px] shrink-0" />;

/** Page header shared by every guide: brand, title, intro and meta. */
const GuideHeader = ({
    title,
    children,
    meta,
    dark = false,
}: {
    title: string;
    children: ReactNode;
    meta: [string, string][];
    dark?: boolean;
}) => (
    <div
        className={cx(
            "m-2.5 flex flex-col gap-6 rounded-lg px-4 pt-5 pb-6 sm:flex-row sm:items-end sm:justify-between",
            dark ? "bg-white/5" : "bg-[#fafafa]",
        )}
    >
        <div className="flex max-w-[420px] flex-col gap-5">
            <span className="flex items-center gap-1.5">
                <TresoLogo />
                <span className="text-[15px] leading-none font-semibold tracking-[-0.01em]">TRESO2</span>
                <span className="text-[11px] leading-none text-[#f08a4b]">/ Foundation</span>
            </span>
            <div className="flex flex-col gap-2">
                <span className="text-[28px] leading-none font-medium tracking-tight">{title}</span>
                <p className={cx("text-[11px] leading-relaxed", dark ? "text-white/70" : "text-[#535862]")}>{children}</p>
            </div>
        </div>
        <dl className="grid w-full grid-cols-[auto_auto] gap-x-10 text-[11px] sm:w-[190px]">
            {meta.map(([label, value], index) => (
                <div key={label} className="contents">
                    <dt
                        className={cx(
                            "font-semibold",
                            index < meta.length - 1 ? "border-b pb-2" : "",
                            index > 0 && "pt-2",
                            dark ? "border-white/15" : "border-[#e9eaeb]",
                        )}
                    >
                        {label}
                    </dt>
                    <dd
                        className={cx(
                            "text-right",
                            index < meta.length - 1 ? "border-b pb-2" : "",
                            index > 0 && "pt-2",
                            dark ? "border-white/15 text-white/70" : "border-[#e9eaeb] text-[#535862]",
                        )}
                    >
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    </div>
);

/** Section intro on the left of a guide block. */
const BlockIntro = ({ title, text, dark }: { title: string; text: string; dark: boolean }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold">{title}</span>
        <p className={cx("text-[8px] leading-[1.45]", dark ? "text-white/55" : "text-[#717680]")}>{text}</p>
    </div>
);

/* ---------------------------------- Palettes ---------------------------------- */

type PaletteMode = "dark" | "light";

const PALETTE_COPY = {
    intro: "A color palette in a design system is a curated set of colors that defines a brand's identity. It helps designers maintain consistency across components and layouts, creating harmonious designs that improve user experience and reinforce brand recognition.",
    base: "Basic colors like Black, White, and Transparent are vital in a design system. Black provides contrast for text and key elements, while White serves as a clean background that enhances other components. Transparent allows for layering and depth, creating visually appealing effects.",
    feedback:
        "Feedback colors in a design system are specific hues that indicate errors, warnings, and information, helping to draw attention to important elements.",
};

/** Scales of each palette, mapped to the Primitive hues of its mode. */
const PALETTE_SCALES: Record<PaletteMode, { group: "base" | "feedback"; title: string; hue: string; text: string }[]> = (() => {
    const rows = (brand: string, warning: string) => [
        {
            group: "base" as const,
            title: "Brand",
            hue: brand,
            text: "Brand colors in a design system are crucial for establishing a unified visual identity. These specific shades enhance usability and elevate the aesthetic of components and interfaces, playing a vital role in elements like Buttons, Hyperlinks, etc...",
        },
        {
            group: "base" as const,
            title: "Accent",
            hue: "violet",
            text: "Accent colours in a design system enrich the main palette by adding depth and diversity. They play a key role in establishing visual hierarchies and attracting attention to specific elements, which is crucial for a dynamic and cohesive brand identity.",
        },
        {
            group: "base" as const,
            title: "Neutral",
            hue: "neutral",
            text: "Neutral colors like black, white, and transparent form the backbone of a design system. They offer balance and versatility, helping other colors pop. These shades are crucial for contrast, improving readability, and maintaining a unified appearance across web design and branding.",
        },
        {
            group: "feedback" as const,
            title: "Information",
            hue: "blue",
            text: "Information colors, such as blue, play a vital role in a design system. They are used to convey important messages and guide users through an interface. These colors enhance user experience by drawing attention to key elements, such as notifications or links, while maintaining a cohesive look throughout the design.",
        },
        {
            group: "feedback" as const,
            title: "Success",
            hue: "green",
            text: "Success colors, like green, are essential in a design system. They communicate positive feedback and guide users effectively through an interface. These colors improve user experience by highlighting important elements, such as confirmation messages or successful actions, while ensuring a consistent aesthetic across the design.",
        },
        {
            group: "feedback" as const,
            title: "Warning",
            hue: warning,
            text: "Warning colors, like orange, are essential in a design system. They effectively communicate critical alerts and guide users through the interface. These colors improve user experience by highlighting important elements, such as alerts or buttons, while ensuring a unified aesthetic across the design.",
        },
        {
            group: "feedback" as const,
            title: "Error",
            hue: "red",
            text: "Error colors, like red, are crucial in a design system. They signal important alerts and guide users effectively through an interface. These colors improve user experience by highlighting critical elements, such as error messages or warnings, while ensuring a unified aesthetic across the design.",
        },
    ];
    return { dark: rows("blue", "orange"), light: rows("orange", "yellow") };
})();

/** One colour chip with its contrast rating, step and hex. */
const Swatch = ({
    color,
    label,
    hex,
    rating: ratingLabel,
    ink,
    primary = false,
    dark,
}: {
    color: string;
    label: string;
    hex: string;
    rating: string;
    ink: string;
    primary?: boolean;
    dark: boolean;
}) => (
    <div className={cx("flex min-w-0 flex-col rounded-[4px] p-px", dark ? "bg-white/[0.06]" : "bg-white ring-1 ring-[#e9eaeb]")}>
        <span
            className="relative flex h-[22px] items-center justify-center rounded-[3px] text-[6.5px] font-semibold whitespace-nowrap ring-1 ring-black/[0.06] ring-inset"
            style={{ backgroundColor: color, color: ink }}
        >
            {ratingLabel}
            {primary && <span className="absolute top-[3px] right-[3px] size-[3px] rounded-full bg-white" />}
        </span>
        <span className="truncate px-[3px] pt-[3px] text-[6.5px] font-medium">{label}</span>
        <span className={cx("truncate px-[3px] pb-[3px] font-mono text-[5.5px]", dark ? "text-white/45" : "text-[#a4a7ae]")}>{hex}</span>
    </div>
);

export const PaletteGuide = ({ mode }: { mode: PaletteMode }) => {
    const dark = mode === "dark";
    const page = dark ? "#374B58" : "#FFFFFF";
    const base = (name: string) => String(primitive([mode, "base"], name));

    // Contrast of each chip against the page, as on the Figma swatches (white on the light page reads against black)
    const ratingOn = (color: string) => rating(contrast(color, !dark && color === "#FFFFFF" ? "#000000" : page));

    const scaleRow = ({ title, hue, text }: (typeof PALETTE_SCALES)["dark"][number]) => {
        const colors = STEPS.map((step) => String(primitive([mode, hue], step)));
        return (
            <div key={title} className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-5">
                <BlockIntro title={title} text={text} dark={dark} />
                <div className="grid grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.4fr)_repeat(5,minmax(0,1fr))] items-start gap-1">
                    {colors.map((color, index) => (
                        <Swatch
                            key={STEPS[index]}
                            color={color}
                            label={STEPS[index]}
                            hex={color}
                            rating={ratingOn(color)}
                            ink={index < 4 ? colors[7] : "#FFFFFF"}
                            primary={index === 5}
                            dark={dark}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div
            className={cx("flow-root pb-8 font-[Inter,ui-sans-serif,system-ui] antialiased", dark ? "text-white" : "text-[#181d27]")}
            style={{ backgroundColor: page }}
        >
            <GuideHeader title={`Colors : ${dark ? "Dark" : "Light"} palette`} meta={[["Last updated", "29/06/2026"]]} dark={dark}>
                {PALETTE_COPY.intro}
            </GuideHeader>

            <div className="flex flex-col gap-4 px-4 pt-8">
                <div className="flex flex-col gap-1 pb-2">
                    <span className="text-[12px] font-semibold">Base</span>
                    <span className={cx("text-[9px]", dark ? "text-white/60" : "text-[#717680]")}>
                        Your Brand color and black and white style
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-5">
                    <BlockIntro title="Base" text={PALETTE_COPY.base} dark={dark} />
                    <div className="grid grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.4fr)_repeat(5,minmax(0,1fr))] items-start gap-1">
                        {[
                            { label: "White", color: base("white"), hex: "#FFFFFF" },
                            { label: "Black", color: base("black"), hex: "#000000" },
                        ].map(({ label, color, hex }) => (
                            <Swatch
                                key={label}
                                color={color}
                                label={label}
                                hex={hex}
                                rating={ratingOn(color)}
                                ink={label === "White" ? "#000000" : "#FFFFFF"}
                                dark={dark}
                            />
                        ))}
                        <Swatch color="transparent" label="Transparent" hex="#FFFFFF 0%" rating="" ink="#FFFFFF" dark={dark} />
                    </div>
                </div>
                {PALETTE_SCALES[mode].filter((row) => row.group === "base").map(scaleRow)}

                <div className="flex flex-col gap-1 pt-8 pb-2">
                    <span className="text-[12px] font-semibold">Feedback colors</span>
                    <span className={cx("max-w-[280px] text-[9px] leading-relaxed", dark ? "text-white/60" : "text-[#717680]")}>
                        {PALETTE_COPY.feedback}
                    </span>
                </div>
                {PALETTE_SCALES[mode].filter((row) => row.group === "feedback").map(scaleRow)}
            </div>
        </div>
    );
};

/* ---------------------------------- Spacing ---------------------------------- */

const SPACING = (primitiveCollection.groups.find((g) => g.path.join("/") === "spacing")?.tokens ?? []).map(
    (t) => [t.name, Number(t.values[0].value)] as [string, number],
);

/** Name chip used in the scale tables. */
const NameChip = ({ children }: { children: ReactNode }) => (
    <span className="rounded-[4px] border border-[#e9eaeb] bg-[#fafafa] px-1.5 py-0.5 text-[9px] text-[#414651]">{children}</span>
);

/** Scale table shared by Spacing and Radius. */
const ScaleTable = ({ visual, rows }: { visual: string; rows: { name: string; size: string; px: string; preview: ReactNode }[] }) => (
    <table className="mt-6 w-full table-fixed text-left text-[10px]">
        <colgroup>
            <col className="w-[19%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col />
        </colgroup>
        <thead className="text-[#717680]">
            <tr className="border-b border-[#f5f5f5]">
                <th className="pb-3 font-normal">Name</th>
                <th className="pb-3 font-normal">Size (14px base)</th>
                <th className="pb-3 font-normal">Pixels</th>
                <th className="pb-3 font-normal">{visual}</th>
            </tr>
        </thead>
        <tbody>
            {rows.map(({ name, size, px, preview }) => (
                <tr key={name} className="h-11 border-b border-[#f5f5f5]">
                    <td>
                        <NameChip>{name}</NameChip>
                    </td>
                    <td>{size}</td>
                    <td>{px}</td>
                    <td>{preview}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export const SpacingGuide = () => (
    <div className="flow-root bg-white pb-8 font-[Inter,ui-sans-serif,system-ui] text-[#181d27] antialiased">
        <GuideHeader
            title="Spacing"
            meta={[
                ["Last updated", "03 août 2026"],
                ["Version", "2.00"],
            ]}
        >
            Just like your color scale, working from a defined spacing system allows you to work faster and more consistently. Consistent
            and scalable spacing helps you eliminate guesswork whilst designing and developing because you're designing with a limited set
            of options.
        </GuideHeader>
        <div className="px-4 pt-10">
            <span className="text-[11px] font-semibold">Spacing</span>
            <p className="mt-1 max-w-[420px] text-[10px] leading-relaxed text-[#535862]">
                Working from a predefined, limited spacing system allows you to work faster and more consistently. These predefined spacing
                values are derived from primitive spacing values and are useful for spaces, padding, and margins used in all components and
                designs.
            </p>
            <ScaleTable
                visual="Spacing"
                rows={SPACING.map(([name, px]) => ({
                    name,
                    size: rem(px),
                    px: `${px}px`,
                    // A line as long as the value, with end ticks
                    preview: (
                        <span className="flex h-[18px] items-center border-x-[1.5px] border-[#8e78d8]" style={{ width: px + 3 }}>
                            <span className="h-px w-full bg-[#8e78d8]" />
                        </span>
                    ),
                }))}
            />
        </div>
    </div>
);

/* ---------------------------------- Radius ---------------------------------- */

const RADII = (primitiveCollection.groups.find((g) => g.path.join("/") === "border-radius")?.tokens ?? []).map(
    (t) => [t.name, Number(t.values[0].value)] as [string, number],
);

export const RadiusGuide = () => (
    <div className="flow-root bg-white pb-8 font-[Inter,ui-sans-serif,system-ui] text-[#181d27] antialiased">
        <GuideHeader
            title="Radius"
            meta={[
                ["Last updated", "03 août 2026"],
                ["Version", "2.00"],
            ]}
        >
            Utilisez les valeurs de rayon de bordure pour styliser rapidement le rayon de bordure d'un élément. Ces valeurs sont utiles pour
            arrondir les bords des images, des boutons ou de tout autre élément.
        </GuideHeader>
        <div className="px-4 pt-10">
            {/* Specimens: one tile per radius */}
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {RADII.filter(([name]) => name !== "rounded-full").map(([name, px]) => (
                    <span
                        key={name}
                        className="flex aspect-square items-center justify-center border border-[#d5d7da] bg-[#fafafa] px-0.5 text-center text-[7px] text-[#414651]"
                        style={{ borderRadius: px }}
                    >
                        {name}
                    </span>
                ))}
            </div>
            <div className="pt-10">
                <span className="text-[11px] font-semibold">Radius</span>
                <p className="mt-1 max-w-[420px] text-[10px] leading-relaxed text-[#535862]">
                    Working from a pre-defined and limited radius system for adding border radiuses (or radius) to elements allows you to
                    work faster and consistently. The design system uses a pre-defined and limited radius system derived from the primitive
                    spacing values.
                </p>
                <ScaleTable
                    visual="Radius"
                    rows={RADII.map(([name, px]) => ({
                        name,
                        size: px >= 9999 ? "∞" : rem(px),
                        px: `${px}px`,
                        // The top-right corner of a box, rounded to the value
                        preview: (
                            <span
                                className="block h-[18px] w-[46px] border-t-[1.5px] border-r-[1.5px] border-[#8e78d8] bg-[#faf7ff]"
                                style={{ borderTopRightRadius: Math.min(px, 18) }}
                            />
                        ),
                    }))}
                />
            </div>
        </div>
    </div>
);
