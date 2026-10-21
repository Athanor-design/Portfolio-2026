import { Check, Mail01 } from "@untitledui/icons";
import { type ForwardRefExoticComponent, type RefAttributes, useRef } from "react";
import { motion } from "motion/react";
import FigmaIcon from "@/components/ui/animated-icons/figma-icon";
import CopyIcon from "@/components/ui/animated-icons/copy-icon";
import MapPinIcon from "@/components/ui/animated-icons/map-pin-icon";
import BrandAnthropicIcon from "@/components/ui/animated-icons/brand-anthropic-icon";
import Stack3Icon from "@/components/ui/animated-icons/stack-3-icon";
import type { AnimatedIconHandle, AnimatedIconProps } from "@/components/ui/animated-icons/types";
import UsersIcon from "@/components/ui/animated-icons/users-icon";
import { CtaButton } from "@/components/ui/cta-button";
import { DotGrid } from "@/components/ui/dot-grid";
import { LinkedinIcon } from "@/components/ui/linkedin-icon";
import { SelectionFrame } from "@/components/ui/selection-frame";
import { ShaderButton } from "@/components/ui/shader-button";
import { EASE } from "@/components/ui/reveal";
import { profile } from "@/data/content";
import { SiteHeader } from "./site-header";

type AnimatedIcon = ForwardRefExoticComponent<AnimatedIconProps & RefAttributes<AnimatedIconHandle>>;

// Icons animate (itshover) when the whole row is hovered, not just the glyph.
const expertises: { label: string; icon: AnimatedIcon }[] = [
    { label: "Design system", icon: Stack3Icon },
    { label: "Maquettage", icon: FigmaIcon },
    { label: "Prototypage", icon: BrandAnthropicIcon },
    { label: "Tests utilisateur", icon: UsersIcon },
];

const Expertise = ({ label, icon: Icon }: { label: string; icon: AnimatedIcon }) => {
    const iconRef = useRef<AnimatedIconHandle>(null);
    return (
        <li
            data-dots-quiet
            className="group flex cursor-default items-center gap-2 rounded-full bg-primary py-1.5 pr-3.5 pl-3 text-sm text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.09] transition duration-200 ease-out hover:bg-tertiary hover:text-primary hover:ring-white/20"
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
            <Icon
                ref={iconRef}
                size={15}
                className="shrink-0 text-tertiary transition-colors duration-200 group-hover:text-primary"
                aria-hidden="true"
            />
            {label}
        </li>
    );
};

const fade = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
});

interface IntroPanelProps {
    copied: boolean;
    onCopyEmail: () => void;
}

/** Left column: stays in place on desktop while the work scrolls on the right (YWY-style). */
export const IntroPanel = ({ copied, onCopyEmail }: IntroPanelProps) => {
    const copyRef = useRef<AnimatedIconHandle>(null);
    const pinRef = useRef<AnimatedIconHandle>(null);
    return (
        <div className="relative isolate flex flex-col gap-14 px-5 pt-5 pb-10 lg:sticky lg:top-0 lg:h-svh lg:gap-6 lg:overflow-y-auto lg:px-8 lg:pt-6 lg:pb-8">
            {/* Figma-like canvas: dot grid that reacts to the cursor, fading out at the edges */}
            <DotGrid className="-z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_40%_45%,black,transparent)]" />
            <SiteHeader />

            <div className="lg:flex lg:flex-1 lg:flex-col lg:justify-center">
                {/* Availability first: it's the first thing a recruiter needs to know */}
                <motion.p
                    {...fade(0.1)}
                    className="mb-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm text-secondary ring-1 ring-white/[0.09]"
                >
                    <span className="animate-pulse-ring size-2 rounded-full bg-[#4ade80]" aria-hidden="true" />
                    {profile.availability}
                </motion.p>
                <SelectionFrame spacingBelow={56}>
                    <h1
                        className="font-display text-[3.4rem] leading-[1.04] tracking-[-0.035em] md:text-[4.75rem] lg:text-[clamp(3.5rem,min(6.4vw,10.5vh),6.25rem)]"
                        style={{ fontWeight: 400 }}
                    >
                        {[
                            { text: "Votre prochain", className: "text-quaternary" },
                            { text: "UX/UI", className: "text-primary" },
                            { text: "Designer", className: "text-primary" },
                        ].map((line, i) => (
                            <span key={line.text} className="block overflow-hidden pb-[0.08em]">
                                <motion.span
                                    className={`block ${line.className}`}
                                    initial={{ y: "105%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: EASE }}
                                >
                                    {line.text}
                                </motion.span>
                            </span>
                        ))}
                    </h1>
                </SelectionFrame>

                <motion.p {...fade(0.5)} className="mt-14 max-w-[34rem] text-[17px] leading-[1.7] text-pretty text-tertiary">
                    3 ans d'expérience en SaaS B2B finance. Je transforme des parcours techniques complexes en interfaces simples et
                    intuitives, main dans la main avec les équipes produit et tech.
                </motion.p>

                <motion.ul {...fade(0.55)} aria-label="Expertises" className="mt-7 flex flex-wrap gap-2">
                    {expertises.map((item) => (
                        <Expertise key={item.label} {...item} />
                    ))}
                </motion.ul>

                <motion.div {...fade(0.6)} className="mt-14 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <ShaderButton href="#contact" baseColor="#232326" glassColor="#e4e4e7" className="w-full sm:w-auto">
                        Me contacter
                    </ShaderButton>
                    <span data-dots-quiet className="flex sm:inline-flex">
                        <CtaButton href={profile.cv} color="secondary" icon="download" download="CV_Boris_Courdouan.pdf" fullWidthMobile>
                            Télécharger le CV
                        </CtaButton>
                    </span>
                </motion.div>
            </div>

            {/* Contact details, shown once: pinned to the bottom of the panel on desktop */}
            {/* Mobile: one line per item with a leading icon; desktop: a single inline row */}
            <motion.div
                {...fade(0.65)}
                className="flex flex-col items-start gap-3.5 text-[15px] text-tertiary sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-sm lg:mt-auto"
            >
                {/* Contact links are underlined (actions); expertises above use icons (information) */}
                <button
                    type="button"
                    onClick={onCopyEmail}
                    onMouseEnter={() => copyRef.current?.startAnimation()}
                    onMouseLeave={() => copyRef.current?.stopAnimation()}
                    aria-label={copied ? "Email copié" : `Copier l'adresse ${profile.email}`}
                    className="group/copy relative inline-flex items-center gap-2.5 transition duration-100 ease-linear hover:text-primary sm:gap-1.5"
                >
                    <Mail01 className="size-4 shrink-0 sm:hidden" aria-hidden="true" />
                    <span className="underline decoration-white/25 underline-offset-4 transition duration-100 ease-linear group-hover/copy:decoration-current">
                        {profile.email}
                    </span>
                    {copied ? (
                        <Check className="size-3.5 text-fg-success-secondary" aria-hidden="true" />
                    ) : (
                        <CopyIcon ref={copyRef} size={14} aria-hidden="true" />
                    )}
                    {/* Instant tooltip, above the link (it sits at the bottom of the panel) */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-md bg-primary-solid px-2 py-1 text-xs font-medium whitespace-nowrap text-primary_on-solid opacity-0 transition duration-150 group-hover/copy:translate-y-0 group-hover/copy:opacity-100 group-focus-visible/copy:translate-y-0 group-focus-visible/copy:opacity-100"
                    >
                        {copied ? "Copié ✓" : "Copier l'email"}
                    </span>
                </button>
                <span aria-hidden="true" className="hidden text-quaternary sm:inline">
                    ·
                </span>
                <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="group/in inline-flex items-center gap-2.5 transition duration-100 ease-linear hover:text-primary"
                >
                    <LinkedinIcon className="size-4 shrink-0 sm:hidden" />
                    <span className="underline decoration-white/25 underline-offset-4 group-hover/in:decoration-current">LinkedIn ↗</span>
                </a>
                <span aria-hidden="true" className="hidden text-quaternary sm:inline">
                    ·
                </span>
                <span
                    className="inline-flex cursor-default items-center gap-2.5 sm:gap-1.5"
                    onMouseEnter={() => pinRef.current?.startAnimation()}
                    onMouseLeave={() => pinRef.current?.stopAnimation()}
                >
                    <MapPinIcon ref={pinRef} size={16} className="size-4 shrink-0 sm:size-3.5" aria-hidden="true" />
                    {profile.location}
                </span>
            </motion.div>
        </div>
    );
};
