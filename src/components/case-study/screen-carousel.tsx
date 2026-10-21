import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    type AnimationPlaybackControls,
    animate,
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
} from "motion/react";
import { ColorAnatomy } from "@/components/case-study/color-anatomy";
import { FigmaVariables } from "@/components/case-study/figma-variables";
import type { LightboxImage } from "@/components/case-study/screen-lightbox";
import { DashboardMock } from "@/components/ui/dashboard-mock";
import { screenSrcSet } from "@/utils/screen-src-set";

/*
 * Curved 3D screen carousel, reproducing Storyflow (storyflow.framer.media).
 * Built on a fixed 1500×680 stage that is scaled to fit, like the original:
 * the active screen is large and flat; the others shrink to portrait cards
 * fanned along an arc (30° / 42° / 50°). On each switch every card glides to
 * its neighbour's slot while morphing its size, in one soft spring move.
 * Auto-advances every 8s (progress line on the active card), pauses on
 * hover/focus/off-screen, and loops. Two cards are shown per side (the outer slot
 * only parks hidden cards) and the stage edges fade out; fewer than 5
 * screens are repeated so the arc stays full.
 */

export interface CarouselSlide {
    title: string;
    description: string;
    image?: string;
    component?: "figma-variables" | "color-anatomy";
}

interface ScreenCarouselProps {
    slides: CarouselSlide[];
    accent: string;
    /** Opens the active screen at its real size. */
    onZoom?: (image: LightboxImage) => void;
}

const STAGE_W = 1500;
const STAGE_H = 680;
const VISIBLE = 3; // arc slots on each side of the active one
const SHOWN = 2; // cards actually shown per side — the outermost slot only parks hidden cards
const DURATION = 8; // seconds per screen
// Soft spring: quick start, long cushioned landing with a hint of give, instead of a rigid ease-in-out
const MOVE = { type: "spring", visualDuration: 0.9, bounce: 0.12 } as const;

// Slot geometry by distance from the centre (measured on Storyflow).
const SLOT_X = [0, 455, 610, 770];
const SLOT_ROTATE = [0, 30, 42, 50];
// Active slot = 896 px, the exact width of the @1x captures, so a screen is drawn pixel for pixel (no resampling blur);
// its height follows the captures' 2000×1299 ratio
const SLOT_W = [896, 300, 300, 300];
const SLOT_H = [582, 510, 430, 430];
const SLOT_SCALE = [1, 0.85, 0.7167, 0.7167];
const SLOT_DIM = [0, 0.3, 0.45, 0.55];

const pad = (n: number) => String(n).padStart(2, "0");

/** Shortest signed distance on a ring of `size` items. */
const ringOffset = (i: number, active: number, size: number) => {
    let d = i - active;
    if (d > size / 2) d -= size;
    if (d < -size / 2) d += size;
    return d;
};

const arrowButton =
    "flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-primary ring-1 ring-white/10 transition duration-100 ease-linear outline-none hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/60";

export const ScreenCarousel = ({ slides, accent, onZoom }: ScreenCarouselProps) => {
    const count = slides.length;
    // Virtual ring: repeat the screens until the arc can be filled.
    const ringSize = count >= SHOWN * 2 + 1 ? count : count * Math.ceil((SHOWN * 2 + 1) / count);
    const [active, setActive] = useState(0);
    const current = active % count;

    const rootRef = useRef<HTMLDivElement>(null);
    const stageWrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);
    const inView = useInView(rootRef, { amount: 0.4 });
    const reduce = useReducedMotion();
    const progress = useMotionValue(0);
    const controls = useRef<AnimationPlaybackControls | null>(null);
    const swipeStart = useRef<number | null>(null);
    const didSwipe = useRef(false);

    const step = (delta: number) => setActive((a) => (((a + delta) % ringSize) + ringSize) % ringSize);
    const paused = isHovered || hasFocus || !inView;

    // Scale the fixed stage to the available width (larger on small screens so the screen stays legible).
    useEffect(() => {
        const el = stageWrapRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            // No down-scaling on desktop: a fractional scale (e.g. 0.96) resamples the screens and blurs their text.
            // The stage is full-bleed and edge-masked, so it can simply be cropped at the sides instead.
            setScale(width >= 1200 ? 1 : Math.min(1, width / (width < 768 ? 960 : STAGE_W)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Restart the timer for each screen; advance when the line fills up.
    useEffect(() => {
        if (reduce || count < 2) return;
        progress.set(0);
        controls.current = animate(progress, 1, { duration: DURATION, ease: "linear", onComplete: () => step(1) });
        return () => controls.current?.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, reduce, count, progress]);

    useEffect(() => {
        if (paused) controls.current?.pause();
        else controls.current?.play();
    }, [paused, active]);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
    };

    const slide = slides[current];

    return (
        <div
            ref={rootRef}
            role="region"
            aria-roledescription="carrousel"
            aria-label="Écrans du projet"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={(event) => setHasFocus(event.target.matches(":focus-visible"))}
            onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setHasFocus(false)}
            className="relative mt-12 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-8 focus-visible:ring-offset-secondary md:mt-16"
        >
            {/* Full-bleed stage, scaled to fit */}
            <div
                ref={stageWrapRef}
                className="relative ml-[calc(50%-50vw)] w-screen touch-pan-y overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
                style={{ height: STAGE_H * scale }}
                onPointerEnter={(event) => event.pointerType === "mouse" && setIsHovered(true)}
                onPointerLeave={(event) => event.pointerType === "mouse" && setIsHovered(false)}
                onPointerDown={(event) => {
                    swipeStart.current = event.clientX;
                    didSwipe.current = false;
                }}
                onPointerUp={(event) => {
                    if (swipeStart.current === null) return;
                    const delta = event.clientX - swipeStart.current;
                    swipeStart.current = null;
                    if (Math.abs(delta) > 50) {
                        didSwipe.current = true;
                        step(delta < 0 ? 1 : -1);
                    }
                }}
            >
                {/* Soft light behind the active screen */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_50%,rgba(255,255,255,0.08),transparent_70%)]"
                />

                <div
                    className="absolute top-0 left-1/2 origin-top [perspective:1900px]"
                    style={{
                        width: STAGE_W,
                        height: STAGE_H,
                        marginLeft: -STAGE_W / 2,
                        transform: scale === 1 ? undefined : `scale(${scale})`,
                    }}
                >
                    {Array.from({ length: ringSize }, (_, k) => {
                        const d = ringOffset(k, active, ringSize);
                        const a = Math.min(Math.abs(d), VISIBLE);
                        const side = Math.sign(d);
                        const isActive = d === 0;
                        const item = slides[k % count];
                        const transition = reduce ? { duration: 0 } : MOVE;
                        const canZoom = !!item.image && !!onZoom;

                        return (
                            // Slot anchor: a point on the arc, rotated to face the centre
                            <motion.div
                                key={k}
                                className="absolute top-1/2 left-1/2"
                                style={{ zIndex: 10 - a }}
                                initial={false}
                                animate={{ x: side * SLOT_X[a], rotateY: side * SLOT_ROTATE[a], opacity: Math.abs(d) > SHOWN ? 0 : 1 }}
                                transition={transition}
                            >
                                {/* Card: centred on the anchor, morphs between screen and portrait sizes */}
                                <motion.button
                                    type="button"
                                    // Side card: bring it to the centre. Active card: open the screen at its real size.
                                    onClick={() => {
                                        if (didSwipe.current) return;
                                        if (!isActive) setActive(k);
                                        else if (canZoom) onZoom({ src: item.image!, alt: item.description });
                                    }}
                                    tabIndex={isActive ? (canZoom ? 0 : -1) : Math.abs(d) > 1 ? -1 : 0}
                                    aria-label={
                                        isActive
                                            ? canZoom
                                                ? `Agrandir l'écran : ${item.title}`
                                                : undefined
                                            : `Afficher l'écran : ${item.title}`
                                    }
                                    aria-hidden={isActive ? undefined : Math.abs(d) > 1}
                                    // Centred with whole-pixel offsets (896 / 582 halve evenly); backface-visibility keeps the
                                    // composited card from being re-rasterised blurry while the others rotate around it
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-[#1e1e20] text-left shadow-[0_0_0_1px_rgba(255,255,255,0.12)] outline-none [backface-visibility:hidden] focus-visible:shadow-[0_0_0_2px_rgba(255,255,255,0.7)] ${
                                        isActive ? (canZoom ? "cursor-zoom-in" : "cursor-default") : "cursor-pointer"
                                    }`}
                                    initial={false}
                                    animate={{ width: SLOT_W[a], height: SLOT_H[a], scale: SLOT_SCALE[a] }}
                                    transition={transition}
                                >
                                    {/* Screen at full size, anchored to the top and cropped by the card */}
                                    <div className="pointer-events-none absolute top-0 left-1/2 flex h-[582px] w-[896px] -translate-x-1/2 flex-col">
                                        {item.component === "color-anatomy" ? (
                                            <ColorAnatomy preview className="min-h-0 flex-1" />
                                        ) : item.component === "figma-variables" ? (
                                            <FigmaVariables preview autoplay={isActive && !reduce} className="min-h-0 flex-1" />
                                        ) : item.image ? (
                                            <img
                                                src={item.image}
                                                srcSet={screenSrcSet(item.image, 896)}
                                                sizes="896px"
                                                alt=""
                                                draggable={false}
                                                // Full width, never cropped on the sides (that cut the app's sidebar); taller captures crop at the bottom
                                                className="h-auto w-full shrink-0 [image-rendering:-webkit-optimize-contrast]"
                                            />
                                        ) : (
                                            <div className="min-h-0 flex-1">
                                                <DashboardMock accent={accent} variant={k % count} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Side cards sink into the dark */}
                                    <motion.div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 bg-black"
                                        initial={false}
                                        animate={{ opacity: SLOT_DIM[a] }}
                                        transition={transition}
                                    />

                                    {/* Caption over the active screen, then the timing line along its bottom edge */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                key={k}
                                                className="pointer-events-none absolute inset-x-0 bottom-0 px-8 pt-24 pb-8"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1, transition: { duration: 0.5, delay: reduce ? 0 : 0.45 } }}
                                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                            >
                                                {/* Dark scrim only (no blur) so the caption reads while the screen stays sharp */}
                                                <div
                                                    aria-hidden="true"
                                                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent"
                                                />
                                                {/* Same wording as the steps below ("Étape 01"), so screen ↔ step is obvious */}
                                                <p className="relative mb-2 font-mono text-xs tracking-[0.14em] text-white/60 uppercase">
                                                    Étape {pad((k % count) + 1)}
                                                </p>
                                                <p className="relative font-display text-[2.25rem] leading-[1.05] tracking-[-0.035em] text-white">
                                                    {item.title}
                                                </p>
                                                <p className="relative mt-2 text-base text-white/80">{item.description}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {isActive && !reduce && (
                                        <motion.div
                                            aria-hidden="true"
                                            className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-white/80"
                                            style={{ scaleX: progress }}
                                        />
                                    )}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
                <button type="button" onClick={() => step(-1)} aria-label="Écran précédent" className={arrowButton}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
                <span className="min-w-24 text-center text-sm text-tertiary tabular-nums">
                    Écran {pad(current + 1)} / {pad(count)}
                </span>
                <button type="button" onClick={() => step(1)} aria-label="Écran suivant" className={arrowButton}>
                    <ArrowRight className="size-4" aria-hidden="true" />
                </button>
            </div>
            <p aria-live="polite" className="sr-only">
                Écran {current + 1} sur {count} : {slide.title}. {slide.description}
            </p>
        </div>
    );
};
