import {
    Activity,
    ArrowLeft,
    ArrowRight,
    BellRinging01,
    Code02,
    GraduationHat01,
    LayersThree01,
    Lightning01,
    ClockFastForward,
    Compass03,
    Link01,
    Rows03,
    UserCircle,
    Users01,
} from "@untitledui/icons";
import { type FC, type MouseEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DashboardMock } from "@/components/ui/dashboard-mock";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { EASE } from "@/components/ui/reveal";
import { HeroShowcase } from "@/components/case-study/hero-showcase";
import { ScreenCarousel } from "@/components/case-study/screen-carousel";
import { ColorAnatomy } from "@/components/case-study/color-anatomy";
import { FigmaVariables } from "@/components/case-study/figma-variables";
import { type LightboxImage, ScreenLightbox } from "@/components/case-study/screen-lightbox";
import { StyleGuideTabs } from "@/components/case-study/style-guide-tabs";
import { SummaryCards } from "@/components/case-study/summary-cards";
import { LearningsRail } from "@/components/case-study/learnings-rail";
import type { CaseStudyScreen, Palette, Project, TradeoffIcon } from "@/data/content";
import { projects } from "@/data/content";
import { useActiveSection } from "@/hooks/use-active-section";
import { screenSrcSet } from "@/utils/screen-src-set";

const accents: Record<Palette, string> = {
    ocean: "#2f5bff",
    sunset: "#f0541c",
    bloom: "#9b3cf0",
    dia: "#6a4cff",
    mint: "#11a676",
};

/** Small uppercase section label. */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-medium tracking-[0.12em] text-tertiary uppercase">{children}</p>
);

/** Section title block shared by every part of the case study. */
const SectionHeading = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
    <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display mt-2 text-[1.75rem] leading-[1.15] text-balance md:text-[2rem]">{title}</h2>
    </div>
);

/** Illustrative dashboard on the project's gradient, until a real capture is provided. */
const MockScreen = ({ palette, variant, className = "" }: { palette: Palette; variant: number; className?: string }) => (
    <div className={`relative isolate overflow-hidden ${className}`}>
        <GradientMesh palette={palette} className="-z-10" intensity={0.6} />
        <div className="absolute top-[10%] left-[7%] w-full overflow-hidden rounded-lg shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/40">
            <div className="aspect-[16/10]">
                <DashboardMock accent={accents[palette]} variant={variant} />
            </div>
        </div>
    </div>
);

/** Inline emphasis for step copy: "**key words**" are lifted to a brighter tone so the text can be skimmed. */
const emphasize = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, index) =>
        part.startsWith("**") ? (
            <strong key={index} className="font-medium text-secondary">
                {part.slice(2, -2)}
            </strong>
        ) : (
            part
        ),
    );

/** Click-to-zoom wrapper: opens the screenshot at its real size in the lightbox. */
const zoomButton =
    "block w-full cursor-zoom-in text-left outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-secondary";

/** Screenshot frame with its caption; clicking a capture opens it 1:1 in the lightbox. */
const ScreenFrame = ({
    screen,
    palette,
    variant,
    onZoom,
}: {
    screen: CaseStudyScreen;
    palette: Palette;
    variant: number;
    onZoom: (image: LightboxImage) => void;
}) => (
    <figure>
        <div className={`relative ${screen.detail ? "md:mb-20" : ""}`}>
            {/* Real captures keep their own proportions so nothing gets cropped */}
            {/* Screenshots keep tight corners; the Figma panel replica gets Figma's rounder window radius */}
            <div
                className={
                    screen.gallery
                        ? ""
                        : `overflow-hidden bg-[#1e1e20] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_30px_70px_-25px_rgba(0,0,0,0.85)] ${
                              screen.component ? "rounded-[14px]" : "rounded-md"
                          }`
                }
            >
                {screen.gallery ? (
                    <StyleGuideTabs items={screen.gallery} />
                ) : screen.component === "color-anatomy" ? (
                    <ColorAnatomy className="md:h-[560px]" />
                ) : screen.component === "figma-variables" ? (
                    <FigmaVariables className="h-[560px]" />
                ) : screen.image ? (
                    <button
                        type="button"
                        onClick={() => onZoom({ src: screen.image!, alt: screen.description })}
                        aria-label={`Agrandir l'écran : ${screen.description}`}
                        className={
                            screen.noStage ? zoomButton : `${zoomButton} overflow-hidden bg-white/[0.06] pt-5 pl-5 sm:pt-10 sm:pl-10`
                        }
                    >
                        {/* Grey stage: the capture is inset top / left and runs to the right and bottom edges, whole.
                            It is shown at 856px with exact-size companions (-stage@1x / @2x) so it stays pixel-exact */}
                        <span className="relative block">
                            <img
                                src={screen.image}
                                srcSet={
                                    screen.noStage
                                        ? screenSrcSet(screen.image, 896)
                                        : screenSrcSet(screen.image.replace(/\.\w+$/, "-stage.png"), 856)
                                }
                                sizes={screen.noStage ? "(min-width: 1024px) 896px, 100vw" : "(min-width: 1024px) 856px, 100vw"}
                                alt={screen.description}
                                loading="lazy"
                                className={
                                    screen.noStage
                                        ? "block h-auto w-full [image-rendering:-webkit-optimize-contrast]"
                                        : "block h-auto w-full rounded-tl-md shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.8)] [image-rendering:-webkit-optimize-contrast]"
                                }
                            />
                            {/* Floating element (e.g. the open profile menu), anchored in % so it follows the capture */}
                            {screen.overlay && (
                                <motion.img
                                    // Appears like a dropdown opening from the avatar once the capture is in view
                                    initial={{ opacity: 0, y: -3, scale: 0.985 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.6 }}
                                    transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
                                    src={screen.overlay.image}
                                    srcSet={screenSrcSet(screen.overlay.image, screen.overlay.width)}
                                    sizes={`${screen.overlay.width}px`}
                                    alt={screen.overlay.alt}
                                    className="absolute h-auto origin-top-right drop-shadow-[0_16px_28px_rgba(0,0,0,0.28)] [image-rendering:-webkit-optimize-contrast]"
                                    style={{
                                        top: `${screen.overlay.top}%`,
                                        right: `${screen.overlay.right}%`,
                                        width: `${(screen.overlay.width / 856) * 100}%`,
                                    }}
                                />
                            )}
                        </span>
                    </button>
                ) : (
                    <MockScreen palette={palette} variant={variant} className="aspect-[16/10]" />
                )}
            </div>

            {/* Close-up (e.g. the modal opened from this screen), floating over the bottom-right corner on desktop.
                Fixed 420 px = its @1x file's width, at whole-pixel offsets, so it is drawn pixel for pixel (no blur). */}
            {screen.detail && (
                <motion.button
                    type="button"
                    onClick={() => onZoom({ src: screen.detail!.image, alt: screen.detail!.description })}
                    aria-label={`Agrandir : ${screen.detail.description}`}
                    className="absolute right-[-27px] bottom-[-92px] hidden w-[420px] cursor-zoom-in rounded-md shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:block"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                >
                    <img
                        src={screen.detail.image}
                        srcSet={screenSrcSet(screen.detail.image, 420)}
                        sizes="420px"
                        alt={screen.detail.description}
                        loading="lazy"
                        className="block w-full rounded-md [image-rendering:-webkit-optimize-contrast]"
                    />
                </motion.button>
            )}
        </div>
        {/* On mobile the close-up sits under the screen instead */}
        {screen.detail && (
            <button
                type="button"
                onClick={() => onZoom({ src: screen.detail!.image, alt: screen.detail!.description })}
                aria-label={`Agrandir : ${screen.detail.description}`}
                className={`${zoomButton} mt-3 md:hidden`}
            >
                <img
                    src={screen.detail.image}
                    srcSet={screenSrcSet(screen.detail.image, 420)}
                    sizes="100vw"
                    alt={screen.detail.description}
                    loading="lazy"
                    className="h-auto w-full rounded-md ring-1 ring-white/[0.09] [image-rendering:-webkit-optimize-contrast]"
                />
            </button>
        )}
        <figcaption className="flex items-start gap-2 px-2 pt-3 pb-1 text-sm text-tertiary">
            <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-secondary">
                {screen.label}
            </span>
            <span>
                {screen.description}
                {screen.detail && <span className="text-quaternary"> · {screen.detail.description}</span>}
            </span>
        </figcaption>
    </figure>
);

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className={className}
    >
        {children}
    </motion.section>
);

const pad = (n: number) => String(n).padStart(2, "0");

const tradeoffIcons: Record<TradeoffIcon, FC<{ className?: string }>> = {
    "mental-model": Users01,
    navigation: Compass03,
    timing: ClockFastForward,
    notification: BellRinging01,
    integration: Link01,
    profile: UserCircle,
    progressive: Rows03,
    status: Activity,
    alignment: Code02,
    unification: LayersThree01,
    friction: Lightning01,
    learning: GraduationHat01,
};

/** Sticky "on this page" index; highlights the section being read (Attio / Contractbook). */
const TableOfContents = ({ items }: { items: { id: string; label: string }[] }) => {
    const ids = useMemo(() => items.map((item) => item.id), [items]);
    const active = useActiveSection(ids, 0.35);

    return (
        <nav aria-label="Sur cette page" className="sticky top-24 hidden self-start lg:block">
            <p className="text-xs font-medium tracking-[0.12em] text-quaternary uppercase">Sur cette page</p>
            <ul className="mt-4 border-l border-white/[0.08]">
                {items.map((item) => {
                    const isActive = item.id === active;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() =>
                                    document.getElementById(item.id)?.scrollIntoView({
                                        // Jump instead of gliding when the visitor asked for less motion
                                        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                                    })
                                }
                                aria-current={isActive ? "location" : undefined}
                                className={`-ml-px block border-l py-1.5 pl-4 text-left text-sm transition duration-100 ease-linear outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                                    isActive ? "border-primary text-primary" : "border-transparent text-tertiary hover:text-secondary"
                                }`}
                            >
                                {item.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

const CaseStudyContent = ({ project, index }: { project: Project; index: number }) => {
    const study = project.caseStudy;
    const next = projects[(index + 1) % projects.length];

    const toc = useMemo(
        () =>
            study
                ? [
                      ...study.steps.map((step, i) => ({ id: `cs-step-${i + 1}`, label: `${pad(i + 1)} · ${step.title}` })),
                      { id: "cs-tradeoffs", label: "Arbitrages" },
                  ]
                : [],
        [study],
    );
    // Screenshot opened at its real size (carousel or any step capture)
    const [zoomed, setZoomed] = useState<LightboxImage | null>(null);

    return (
        <div className="mx-auto max-w-[1240px] px-5 pt-12 pb-20 md:px-10 md:pt-20">
            <ScreenLightbox image={zoomed} onClose={() => setZoomed(null)} />
            {/* Hero: context first, then the cover (Contractbook / Dovetail) */}
            <Section>
                <Eyebrow>
                    {project.company} · {project.year}
                </Eyebrow>
                <h1 className="font-display mt-4 max-w-4xl text-[2.5rem] leading-[1.04] tracking-[-0.04em] text-balance md:text-[4rem]">
                    {project.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-pretty text-tertiary">{project.summary}</p>

                <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-y-6 sm:grid-cols-4">
                    {[
                        ["Rôle", project.role],
                        ["Entreprise", project.company],
                        ["Année", project.year],
                        ["Thèmes", project.tags.join(", ")],
                    ].map(([label, value]) => (
                        <div key={label} className="border-l border-white/[0.12] pr-3 pl-4">
                            <dt className="text-xs text-tertiary">{label}</dt>
                            <dd className="mt-1.5 text-sm leading-snug text-primary">{value}</dd>
                        </div>
                    ))}
                </dl>

                {study ? (
                    <ScreenCarousel
                        accent={accents[project.palette]}
                        onZoom={setZoomed}
                        slides={study.steps.map((step) => ({
                            title: step.title,
                            description: step.screen.description,
                            image: step.screen.image,
                            component: step.screen.component,
                        }))}
                    />
                ) : (
                    <HeroShowcase accent={accents[project.palette]} variant={index} image={project.image} />
                )}
            </Section>

            {!study ? (
                <Section className="mt-16 rounded-2xl bg-white/[0.04] p-8 text-center ring-1 ring-white/[0.09]">
                    <p className="font-display text-2xl">Étude de cas en cours de rédaction</p>
                    <p className="mt-2 text-tertiary">Le détail de ce projet arrive bientôt.</p>
                </Section>
            ) : (
                <>
                    {/* 30-second summary: problem / solution / result */}
                    <SummaryCards
                        headlines={study.headlines}
                        problem={study.problem}
                        solution={study.solution}
                        result={study.result}
                        visuals={study.summaryVisuals}
                    />

                    {/* Body: sticky index on the left, reading column on the right */}
                    <div className="mt-24 grid gap-16 lg:grid-cols-[200px_minmax(0,1fr)]">
                        <TableOfContents items={toc} />

                        <div className="min-w-0">
                            {/* Steps: text at reading width, screen at full column width */}
                            {study.steps.map((step, i) => (
                                <Section key={step.title} className={i ? "mt-24" : ""}>
                                    {/* Title + one-line takeaway first (what to remember), then the detail */}
                                    <div id={`cs-step-${i + 1}`} className="scroll-mt-24">
                                        <Eyebrow>Étape {pad(i + 1)}</Eyebrow>
                                        <h2 className="font-display mt-3 text-[2rem] leading-[1.1] text-balance text-primary md:text-[2.5rem]">
                                            {step.title}
                                        </h2>
                                        <p className="mt-4 max-w-[680px] text-xl leading-[1.5] text-pretty text-secondary md:text-[1.375rem]">
                                            {step.summary}
                                        </p>
                                    </div>
                                    <div className="mt-6 max-w-[680px] space-y-3 border-l border-white/[0.1] pl-5">
                                        {step.paragraphs.map((paragraph) => {
                                            // "1. Name : text" paragraphs read as a numbered list: chip, name, then the detail
                                            const item = paragraph.match(/^(\d+)\. ([^:]+?) : (.+)$/);
                                            // "Label : A → B → C." reads as a flow of chips
                                            const flow = paragraph.match(/^([^:]+?) : ([^:]+ → [^:]+?)\.?$/);
                                            if (flow)
                                                return (
                                                    <div key={paragraph} className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2">
                                                        <span className="text-[13px] text-quaternary">{flow[1]}</span>
                                                        <span className="flex flex-wrap items-center gap-1.5">
                                                            {flow[2].split(" → ").map((stage, index) => (
                                                                <span key={stage} className="flex items-center gap-1.5">
                                                                    {index > 0 && (
                                                                        <ArrowRight
                                                                            className="size-3.5 text-quaternary"
                                                                            aria-hidden="true"
                                                                        />
                                                                    )}
                                                                    <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-[13px] font-medium text-secondary ring-1 ring-white/[0.08] ring-inset">
                                                                        {stage}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </span>
                                                    </div>
                                                );
                                            return item ? (
                                                <div key={paragraph} className="flex gap-3 py-1">
                                                    <span className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[11px] font-medium text-secondary tabular-nums">
                                                        {item[1]}
                                                    </span>
                                                    <p className="text-base leading-[1.6] text-pretty text-tertiary">
                                                        <span className="font-medium text-primary">{item[2]}</span>
                                                        <span className="block">
                                                            {emphasize(item[3].charAt(0).toUpperCase() + item[3].slice(1))}
                                                        </span>
                                                    </p>
                                                </div>
                                            ) : (
                                                <p key={paragraph} className="text-base leading-[1.65] text-pretty text-tertiary">
                                                    {emphasize(paragraph)}
                                                </p>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-8">
                                        <ScreenFrame screen={step.screen} palette={project.palette} variant={i} onZoom={setZoomed} />
                                    </div>
                                </Section>
                            ))}

                            {/* Trade-offs: heading + intro on the left, minimal rail of principles on the right (Dovetail) */}
                            <Section className="mt-24 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-14">
                                <div id="cs-tradeoffs" className="scroll-mt-24 md:sticky md:top-24 md:self-start">
                                    <SectionHeading eyebrow="Arbitrages" title="Les choix qui ont guidé la solution" />
                                    <p className="mt-4 text-[15px] leading-[1.65] text-pretty text-tertiary">
                                        Les principes UX qui ont orienté chaque décision de conception.
                                    </p>
                                </div>
                                <LearningsRail
                                    items={study.tradeoffs.map((item) => ({ ...item, icon: tradeoffIcons[item.icon ?? "mental-model"] }))}
                                />
                            </Section>
                        </div>
                    </div>
                </>
            )}

            {/* Next project: a clearly separate navigation card, coloured with the next project's own gradient */}
            <Section className="mt-32">
                <a
                    href={next.href}
                    className="group relative isolate flex min-h-[300px] flex-col justify-between gap-12 overflow-hidden rounded-[28px] bg-white/[0.04] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.09] outline-none transition duration-300 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white md:min-h-[340px] md:p-12"
                >
                    <span className="w-fit rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-secondary ring-1 ring-white/10">
                        Projet suivant · {pad(((index + 1) % projects.length) + 1)} / {pad(projects.length)}
                    </span>

                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
                        <div>
                            <p className="text-sm text-tertiary">
                                {next.company} · {next.year}
                            </p>
                            <p className="font-display mt-2 max-w-2xl text-[2rem] leading-[1.06] tracking-[-0.035em] text-balance text-primary md:text-[3rem]">
                                {next.title}
                            </p>
                        </div>
                        <span className="flex h-12 w-fit shrink-0 items-center gap-2 rounded-full bg-white pr-4 pl-5 text-sm font-semibold text-[#141413] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-[transform,gap,background-color,box-shadow] duration-300 ease-out group-hover:scale-[1.05] group-hover:gap-3 group-hover:bg-[#e9e7e2] group-hover:shadow-[0_0_0_4px_rgba(255,255,255,0.12),0_14px_40px_-8px_rgba(255,255,255,0.25)]">
                            Voir le projet
                            <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                    </div>
                </a>
            </Section>
        </div>
    );
};

interface CaseStudyPageProps {
    slug: string;
    onClose: () => void;
}

const navButton =
    "flex size-9 items-center justify-center rounded-full text-tertiary transition duration-100 ease-linear hover:bg-tertiary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-white/50";

/** Full-page case study, routed through the URL hash. */
export const CaseStudyPage = ({ slug, onClose }: CaseStudyPageProps) => {
    const index = Math.max(
        0,
        projects.findIndex((p) => p.slug === slug),
    );
    const project = projects[index];
    const prev = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];

    useEffect(() => {
        const homeTitle = document.title;
        document.title = `${project.title} — Boris Courdouan`;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => {
            document.title = homeTitle;
            window.removeEventListener("keydown", onKey);
        };
    }, [project, onClose]);

    // Switching project replaces the history entry, so "back" always returns to the home.
    const onProjectLink = (event: MouseEvent) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#/projets/"]');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        window.location.replace(link.getAttribute("href")!);
    };

    return (
        <div onClick={onProjectLink} className="min-h-svh overflow-x-clip">
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-secondary/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-3 py-3 md:px-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="group flex h-9 items-center gap-2 rounded-full pr-4 pl-3 text-sm font-medium text-secondary transition duration-100 ease-linear hover:bg-tertiary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                        <ArrowLeft className="size-4 transition duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
                        Retour aux projets
                    </button>
                    <nav aria-label="Navigation entre projets" className="flex items-center gap-1">
                        <a href={prev.href} aria-label={`Projet précédent : ${prev.title}`} className={navButton}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                        </a>
                        <span className="px-1 text-sm text-tertiary tabular-nums">
                            <span className="hidden sm:inline">Projet </span>
                            {pad(index + 1)} / {pad(projects.length)}
                        </span>
                        <a href={next.href} aria-label={`Projet suivant : ${next.title}`} className={navButton}>
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </a>
                    </nav>
                </div>
            </header>

            <motion.main
                key={project.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
            >
                <CaseStudyContent project={project} index={index} />
            </motion.main>
        </div>
    );
};
