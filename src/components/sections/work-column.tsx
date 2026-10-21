import { ArrowUp, Check, Hash02 } from "@untitledui/icons";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { DashboardMock } from "@/components/ui/dashboard-mock";
import CopyIcon from "@/components/ui/animated-icons/copy-icon";
import MailFilledIcon from "@/components/ui/animated-icons/mail-filled-icon";
import type { AnimatedIconHandle } from "@/components/ui/animated-icons/types";
import { DotGrid } from "@/components/ui/dot-grid";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { EASE } from "@/components/ui/reveal";
import type { Palette, Project } from "@/data/content";
import { experiences, mailtoHref, profile, projects } from "@/data/content";
import { screenSrcSet } from "@/utils/screen-src-set";

/** Widths of the PNG ladder generated next to each designed cover (`<name>-<width>.png`). */
const COVER_WIDTHS = [
    320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760, 800, 840, 880, 920, 960, 1000, 1080, 1200, 1320, 1440, 1560, 1680, 1800,
    1920, 2000,
];

const accents: Record<Palette, string> = {
    ocean: "#2f5bff",
    sunset: "#f0541c",
    bloom: "#9b3cf0",
    dia: "#6a4cff",
    mint: "#11a676",
};

/** Frosted-glass frame (8px padding, 16px radius) shared by every card in the column. */
const Frame = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className={`relative rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/[0.09] backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_24px_60px_-24px_rgba(0,0,0,0.7)] ${className}`}
    >
        {children}
    </motion.div>
);

/** Project tile: dashboard on an aurora background; hover blurs it and reveals the title. */
const ProjectTile = ({ project, index }: { project: Project; index: number }) => (
    <div className="relative">
        {/* Soft neutral glow behind the card so the frosted glass has depth */}
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-8 bottom-20 rounded-[40px] blur-3xl"
            style={{
                background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.10), transparent 70%)",
            }}
        />
        <Frame>
            <a href={project.href} className="group block rounded-[10px] outline-offset-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[10px]">
                    <div className="absolute inset-0 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:blur-sm group-focus-visible:scale-105 group-focus-visible:blur-sm">
                        {project.cover ? (
                            // Designed cover: shown full-bleed, anchored left so its title is never cropped. The tile width
                            // varies with the window, so a ladder of PNG widths lets the browser pick one just above the
                            // drawn size (a 16:9 cover filling a 16:10 tile is drawn 10/9 of the tile width)
                            <img
                                src={project.cover}
                                srcSet={COVER_WIDTHS.map((w) => `${project.cover!.replace(/\.\w+$/, "")}-${w}.png ${w}w`).join(", ")}
                                sizes="(min-width: 1024px) calc((min(100vw, 1600px) / 2 - 35px) * 1.112), calc((100vw - 55px) * 1.112)"
                                alt=""
                                className="size-full object-cover object-left [image-rendering:-webkit-optimize-contrast]"
                            />
                        ) : (
                            <>
                                <GradientMesh palette={project.palette} />
                                {/* Screen sitting in a glass bezel: the real capture when provided, else an illustrative dashboard */}
                                <div className="absolute top-[12%] left-[8%] w-[108%] rounded-[14px] bg-white/20 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_30px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/40 backdrop-blur-xl">
                                    <div className="aspect-[16/10] overflow-hidden rounded-[9px]">
                                        {project.image ? (
                                            <img
                                                src={project.image}
                                                srcSet={screenSrcSet(project.image, 896)}
                                                sizes="(min-width: 1024px) 50vw, 100vw"
                                                alt=""
                                                className="size-full object-cover object-left-top [image-rendering:-webkit-optimize-contrast]"
                                            />
                                        ) : (
                                            <DashboardMock accent={accents[project.palette]} variant={index} />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Hover / focus: dim + clear call to action */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="translate-y-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[#18181b] shadow-lg transition duration-500 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                            Voir l'étude de cas →
                        </span>
                    </div>
                </div>

                {/* Caption — always visible so the work is readable without hovering */}
                <div className="flex items-end justify-between gap-4 px-2 pt-4 pb-2">
                    <div>
                        <p className="text-sm text-tertiary">
                            {project.company} · {project.year}
                            {/* Em dash after a single year; a range ("2023 — Actuel") already carries one */}
                            {project.year.includes("—") ? " · " : " — "}
                            {project.tags.join(", ")}
                        </p>
                        <h3 className="font-display mt-1 text-[1.4rem] leading-tight text-balance text-primary md:text-[1.75rem]">
                            {project.title}
                        </h3>
                    </div>
                    <span
                        aria-hidden="true"
                        className="mb-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary ring-1 ring-white/15 backdrop-blur-md transition duration-300 group-hover:bg-primary-solid group-hover:text-primary_on-solid"
                    >
                        ↗
                    </span>
                </div>
            </a>
        </Frame>
    </div>
);

const JourneyCard = () => (
    // Anchor sits outside the animated Frame so its entrance transform can't offset the scroll target
    <div id="experiences" className="scroll-mt-4">
        <Frame>
            <div className="p-5 md:p-8">
                <h2 className="text-sm text-tertiary">Expériences</h2>
                <div className="mt-6 divide-y divide-secondary">
                    {experiences.map((exp) => (
                        <div key={exp.company} className="py-6 first:pt-0 last:pb-0">
                            <div className="flex items-baseline justify-between gap-4">
                                {exp.logo ? (
                                    <img src={exp.logo} alt={exp.company} className="h-6 w-auto" />
                                ) : (
                                    <p className="font-display text-[1.6rem]">{exp.company}</p>
                                )}
                                <p className="text-sm text-tertiary">{exp.period}</p>
                            </div>
                            <p className="mt-1 text-sm text-tertiary">
                                {exp.role} · {exp.context}
                            </p>
                            <ul className="mt-4 space-y-2">
                                {exp.highlights.map((item) => (
                                    <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-secondary">
                                        <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary-solid/30" aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </Frame>
    </div>
);

/** Out-of-focus "flowers" that give the contact card its depth of field (Lassie-style). */

/** Dashed inner stroke, like a frame boundary on a design canvas (its name sits just above, as in Figma). */
const DashedStroke = () => (
    <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-10 bottom-4 -z-10 rounded-[6px] border border-dashed border-white/[0.22]"
    />
);

/** Figma-style frame name in the corner; hovering the card reveals its live size, like a selected frame. */
const ArtboardLabel = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const card = ref.current?.parentElement;
        if (!card) return;
        const observer = new ResizeObserver(([entry]) => {
            setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) });
        });
        observer.observe(card);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none absolute top-[17px] left-4 flex items-center gap-2 font-mono text-[11px]"
        >
            <span className="flex items-center gap-1 text-quaternary transition-colors duration-200 group-hover/card:text-[#0d99ff]">
                <Hash02 className="size-3" />
                Contact
            </span>
            <span className="rounded-[3px] bg-[#0d99ff] px-1.5 py-0.5 leading-none text-white tabular-nums opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                {size.w} × {size.h}
            </span>
        </div>
    );
};

/*
 * Contact card as a design-tool canvas ("craft"): dark artboard with a
 * cursor-reactive dot grid, a soft spotlight, a dashed inner stroke and a Figma-style
 * frame name (the hero has the selected layer; this end of the page has the frame).
 */
const ContactCard = ({ copied, onCopyEmail }: { copied: boolean; onCopyEmail: () => void }) => {
    // The envelope opens while the "Écrire un email" button is hovered (itshover icon)
    const mailRef = useRef<AnimatedIconHandle>(null);
    const copyRef = useRef<AnimatedIconHandle>(null);
    return (
        <div id="contact" className="scroll-mt-4">
            <Frame>
                <div className="group/card relative isolate flex aspect-[4/5] flex-col items-center justify-center overflow-hidden rounded-[10px] bg-[#111111] px-6 text-center sm:aspect-[4/3]">
                    <DotGrid className="-z-10 [mask-image:radial-gradient(ellipse_75%_70%_at_50%_45%,black,transparent)]" />
                    {/* Spotlight falling on the headline */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 -z-10 h-3/4 bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(255,255,255,0.11),transparent_70%)]"
                    />
                    <DashedStroke />
                    <ArtboardLabel />

                    {/* Desktop already shows availability in the sticky intro panel; on mobile that panel is far above, so repeat it here */}
                    <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-sm text-secondary ring-1 ring-white/[0.12] lg:hidden">
                        <span className="animate-pulse-ring size-2 rounded-full bg-[#4ade80]" aria-hidden="true" />
                        {profile.availability}
                    </p>

                    <p className="font-display text-[2.4rem] leading-[1.15] text-primary md:text-5xl">
                        Une opportunité
                        <br />à me proposer ?
                    </p>

                    {/* Two explicit actions: open the mail app (subject pre-filled) or copy the address */}
                    <div className="mt-11 flex w-full flex-col gap-2 px-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:px-0">
                        <a
                            href={mailtoHref}
                            onMouseEnter={() => mailRef.current?.startAnimation()}
                            onMouseLeave={() => mailRef.current?.stopAnimation()}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 sm:py-2.5 text-[15px] font-semibold text-[#18181b] shadow-[0_8px_30px_-6px_rgba(255,255,255,0.25)] transition duration-100 ease-linear hover:bg-white/90"
                        >
                            <MailFilledIcon ref={mailRef} size={16} aria-hidden="true" />
                            Écrire un email
                        </a>
                        <button
                            type="button"
                            onClick={onCopyEmail}
                            onMouseEnter={() => copyRef.current?.startAnimation()}
                            onMouseLeave={() => copyRef.current?.stopAnimation()}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] px-5 py-3 sm:py-2.5 text-[15px] font-semibold text-primary ring-1 ring-white/[0.14] transition duration-100 ease-linear hover:bg-white/[0.1]"
                        >
                            {copied ? (
                                <Check className="size-4" aria-hidden="true" />
                            ) : (
                                <CopyIcon ref={copyRef} size={16} aria-hidden="true" />
                            )}
                            {copied ? "Adresse copiée" : "Copier l'adresse"}
                        </button>
                    </div>
                </div>
            </Frame>
        </div>
    );
};

/** Right column: the work scrolls while the intro stays put. */
export const WorkColumn = ({ copied, onCopyEmail }: { copied: boolean; onCopyEmail: () => void }) => (
    <div id="travaux" className="flex flex-col gap-3 px-3 pb-24 sm:pb-6 lg:py-3 lg:pr-3 lg:pl-0">
        <h2 className="sr-only">Travaux sélectionnés</h2>
        {projects.map((project, index) => (
            <ProjectTile key={project.slug} project={project} index={index} />
        ))}
        <JourneyCard />
        <ContactCard copied={copied} onCopyEmail={onCopyEmail} />
        <footer className="flex flex-col gap-4 border-t border-white/[0.06] px-2 pt-6 pb-4 text-sm text-tertiary sm:flex-row sm:items-center sm:justify-between">
            <p>
                © {new Date().getFullYear()} {profile.name}
            </p>
            {/* Contact details live once, at the bottom of the intro panel */}
            {/* Hidden on mobile: the floating nav pill already brings the visitor back up */}
            <a
                href="#top"
                className="group hidden w-fit items-center sm:inline-flex gap-1.5 rounded-full py-1.5 transition duration-100 ease-linear hover:text-primary"
            >
                Revenir en haut
                <ArrowUp className="size-4 transition duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
        </footer>
    </div>
);
