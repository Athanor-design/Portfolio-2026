import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";

/*
 * Figma-like canvas dot grid that reacts to the cursor: nearby dots grow,
 * brighten and are gently pushed away, then ease back. While hovering a
 * [data-dots-quiet] element the grid stays still. The animation loop only
 * runs while something is moving, so the grid costs nothing when idle.
 */

const SPACING = 20;
const BASE_RADIUS = 1;
const BASE_ALPHA = 0.09;
const INFLUENCE = 130; // px radius around the cursor
const MAX_PUSH = 7; // px

interface DotGridProps {
    className?: string;
}

export const DotGrid = ({ className }: DotGridProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduce = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let width = 0;
        let height = 0;
        let cols = 0;
        let rows = 0;
        let energy = new Float32Array(0); // 0 → 1 per dot, eased toward its target
        let frame = 0;
        let running = false;
        const mouse = { x: -9999, y: -9999, active: false };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cols = Math.ceil(width / SPACING) + 1;
            rows = Math.ceil(height / SPACING) + 1;
            energy = new Float32Array(cols * rows);
        };

        /** Draws one frame; returns true while any dot is still animating. */
        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            let moving = false;

            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const idx = i + j * cols;
                    const x = i * SPACING + 1;
                    const y = j * SPACING + 1;

                    let target = 0;
                    let dx = 0;
                    let dy = 0;
                    if (mouse.active) {
                        dx = x - mouse.x;
                        dy = y - mouse.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist < INFLUENCE) target = 1 - dist / INFLUENCE;
                    }

                    const e = energy[idx] + (target - energy[idx]) * 0.14;
                    energy[idx] = e;
                    if (Math.abs(target - e) > 0.002) moving = true;

                    const eased = e * e * (3 - 2 * e); // smoothstep
                    const len = Math.hypot(dx, dy) || 1;
                    const push = eased * MAX_PUSH;
                    const px = x + (dx / len) * push;
                    const py = y + (dy / len) * push;

                    ctx.globalAlpha = BASE_ALPHA + eased * 0.5;
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(px, py, BASE_RADIUS + eased * 1.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            return moving;
        };

        const loop = () => {
            const moving = draw();
            if (moving || mouse.active) {
                frame = requestAnimationFrame(loop);
            } else {
                running = false;
            }
        };
        const start = () => {
            if (reduce || running) return;
            running = true;
            frame = requestAnimationFrame(loop);
        };

        resize();
        draw();
        const resizeObserver = new ResizeObserver(() => {
            resize();
            draw();
        });
        resizeObserver.observe(canvas);

        const parent = canvas.parentElement;
        const onMove = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            // Stay still while hovering marked elements (badges, secondary CTA) so the effect never competes with them.
            if ((event.target as Element | null)?.closest("[data-dots-quiet]")) {
                if (mouse.active) {
                    mouse.active = false;
                    start(); // let dots ease back
                }
                return;
            }
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
            mouse.active = true;
            start();
        };
        const onLeave = () => {
            mouse.active = false;
            start(); // let dots ease back
        };
        parent?.addEventListener("pointermove", onMove);
        parent?.addEventListener("pointerleave", onLeave);

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            parent?.removeEventListener("pointermove", onMove);
            parent?.removeEventListener("pointerleave", onLeave);
        };
    }, [reduce]);

    return <canvas ref={canvasRef} aria-hidden="true" className={cx("pointer-events-none absolute inset-0 size-full", className)} />;
};
