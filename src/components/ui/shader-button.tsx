import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";

/*
 * Premium shader button — liquid glass rim, specular highlight and drifting
 * stars rendered in a fragment shader. Hover speeds the liquid up and adds
 * stars; pressing sends a surge from the centre.
 *
 * Ported from a Framer component: the shader is unchanged, but it runs on a
 * raw WebGL quad (no three.js) and Framer-only APIs are replaced by props.
 */

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uHover;
uniform float uClick;
uniform vec3 uBaseColor;
uniform vec3 uGlassColor;
uniform vec3 uStarColor;
uniform vec2 uResolution;
uniform float uBorderRadius;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
        f += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return f;
}

void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= aspect;

    vec2 center = vec2(0.5);
    vec2 dirToCenter = normalize(vUv - center + vec2(0.0001));
    float distToCenter = length(vUv - center);

    // Rounded-rect SDF matching the CSS border-radius
    float r = clamp((uBorderRadius * 2.0) / uResolution.y, 0.0, 1.0);
    vec2 b = vec2(max(aspect - r, 0.0), max(1.0 - r, 0.0));
    vec2 d = abs(p) - b;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
    float innerDist = clamp(abs(dist), 0.0, 1.0);

    // Liquid noise field, warped on hover and surging on click
    float t = uTime;
    vec2 noiseUv = vUv * vec2(2.0, 1.0);
    vec2 warp = vec2(fbm(noiseUv + t * 0.5), fbm(noiseUv + t * 0.5 + 12.34)) * mix(0.0, 0.4, uHover);
    warp -= dirToCenter * uClick * 0.25 * smoothstep(0.8, 0.0, distToCenter);
    float n1 = fbm(noiseUv + warp + vec2(t, 0.0));
    float n2 = fbm(noiseUv + warp + vec2(n1, t * 1.2));

    // Glassy rim and specular highlight
    float rimWidth = mix(0.15, 0.35, n2) * mix(1.0, 1.4, uHover);
    rimWidth += uClick * 0.15;
    float rim = smoothstep(rimWidth, 0.0, innerDist);
    float specDist = abs(innerDist - 0.12 + n1 * 0.08);
    float specular = smoothstep(0.03, 0.0, specDist);
    float rightBias = smoothstep(0.2, 1.0, vUv.x);
    rim *= mix(0.6, 1.5, rightBias);
    specular *= mix(0.5, 2.0, rightBias);

    // Drifting, twinkling stars
    vec2 starUv = vUv * vec2(aspect * 6.0, 6.0);
    starUv.x -= uTime * 0.2;
    starUv.y += sin(uTime * 0.5 + starUv.x) * mix(0.2, 0.6, uHover);
    starUv += dirToCenter * uClick * 1.5;
    vec2 id = floor(starUv);
    vec2 gv = fract(starUv) - 0.5;
    float nStar = hash(id);
    float star = 0.0;
    float starThreshold = mix(0.94, 0.86, uHover);
    if (nStar > starThreshold) {
        float sizeMod = mix(0.5, 2.5, hash(id + 13.37));
        vec2 localWiggle = vec2(sin(uTime * 2.0 + nStar * 50.0), cos(uTime * 2.3 + nStar * 40.0)) * 0.25 * uHover;
        float starDist = length(gv - localWiggle) * sizeMod;
        star = smoothstep(0.12, 0.0, starDist);
        star += smoothstep(0.25, 0.0, starDist) * 0.3;
        float twinklePhase = uTime * mix(5.0, 15.0, hash(id + 42.0));
        star *= sin(twinklePhase + nStar * 100.0) * 0.5 + 0.5;
        star *= smoothstep(0.05, 0.2, innerDist);
    }

    // Compositing
    vec3 color = uBaseColor;
    float innerLiquid = smoothstep(0.2, 0.9, n2) * (1.0 - innerDist) * mix(0.2, 0.45, uHover);
    color += uGlassColor * innerLiquid;
    color += uGlassColor * rim * mix(0.6, 1.2, uHover);
    color += vec3(1.0) * specular * mix(0.8, 2.0, uHover);
    // Stars are blended toward uStarColor (white on dark bases, a dark tone on light ones)
    color = mix(color, uStarColor, clamp(star * mix(0.8, 1.5, uHover), 0.0, 1.0));
    color += uGlassColor * rim * uClick * 0.8;
    color += vec3(1.0) * specular * uClick * 1.5;
    color += uGlassColor * exp(-distToCenter * 6.0) * uClick * 0.6;
    color *= smoothstep(1.5, 0.2, length(vUv - 0.5));

    gl_FragColor = vec4(color, 1.0);
}
`;

const hexToRgb = (hex: string): [number, number, number] => {
    const value = hex.replace("#", "");
    const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
    const n = parseInt(full, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(Math.max(t, 0), 1);

const ArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

interface ShaderButtonProps {
    href: string;
    children: ReactNode;
    /** Show an arrow after the label. */
    showIcon?: boolean;
    baseColor?: string;
    glassColor?: string;
    /** Animation speed while hovered (idle speed is 0.15). */
    hoverSpeed?: number;
    /** Must match the visual radius; 999 gives a pill. */
    borderRadius?: number;
    /** Label colour — use a dark value on a light base. */
    textColor?: string;
    /** Particle colour — white on dark bases, a darker tone on light ones. */
    starColor?: string;
    className?: string;
}

export const ShaderButton = ({
    href,
    children,
    showIcon = true,
    baseColor = "#000000",
    glassColor = "#C2C2C2",
    hoverSpeed = 0.6,
    borderRadius = 999,
    textColor = "#ffffff",
    starColor = "#ffffff",
    className,
}: ShaderButtonProps) => {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hoverRef = useRef(0);
    const clickRef = useRef(0);
    const reduce = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false });
        if (!canvas || !gl) return; // No WebGL: the CSS background colour remains.

        const compile = (type: number, source: string) => {
            const shader = gl.createShader(type)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };
        const program = gl.createProgram()!;
        const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        // Full-screen quad
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const u = (name: string) => gl.getUniformLocation(program, name);
        const uTime = u("uTime");
        const uHover = u("uHover");
        const uClick = u("uClick");
        const uResolution = u("uResolution");
        gl.uniform3fv(u("uBaseColor"), hexToRgb(baseColor));
        gl.uniform3fv(u("uGlassColor"), hexToRgb(glassColor));
        gl.uniform3fv(u("uStarColor"), hexToRgb(starColor));
        gl.uniform1f(u("uBorderRadius"), borderRadius);

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(rect.width * dpr));
            canvas.height = Math.max(1, Math.round(rect.height * dpr));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uResolution, rect.width, rect.height);
        };

        let time = 2;
        let hover = 0;
        let click = 0;
        let last = performance.now();
        let visible = true;
        let frame = 0;

        const render = () => {
            gl.uniform1f(uTime, time);
            gl.uniform1f(uHover, hover);
            gl.uniform1f(uClick, click);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            const delta = Math.min((now - last) / 1000, 0.1);
            last = now;
            if (!visible) return;

            hover = lerp(hover, hoverRef.current, delta * 4);
            if (clickRef.current > 0) {
                click = clickRef.current;
                clickRef.current = 0;
            }
            click = lerp(click, 0, delta * 6);
            // Accumulated time so speeding up on hover never jumps.
            time += delta * lerp(0.15, hoverSpeed, hover);
            render();
        };

        resize();
        const resizeObserver = new ResizeObserver(() => {
            resize();
            render();
        });
        resizeObserver.observe(canvas);
        const intersection = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        });
        intersection.observe(canvas);

        if (reduce) render();
        else frame = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            intersection.disconnect();
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, [baseColor, glassColor, starColor, borderRadius, hoverSpeed, reduce]);

    const press = () => {
        clickRef.current = 1;
        if (linkRef.current) linkRef.current.style.transform = "scale(0.96)";
    };
    const release = () => {
        if (linkRef.current) linkRef.current.style.transform = "scale(1)";
    };

    return (
        <a
            ref={linkRef}
            href={href}
            onPointerEnter={() => (hoverRef.current = 1)}
            onPointerLeave={() => {
                hoverRef.current = 0;
                release();
            }}
            onPointerDown={press}
            onPointerUp={release}
            onFocus={() => (hoverRef.current = 1)}
            onBlur={() => (hoverRef.current = 0)}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    clickRef.current = 1;
                }
            }}
            style={{ backgroundColor: baseColor, borderRadius, color: textColor }}
            className={cx(
                "relative isolate inline-flex items-center justify-center overflow-hidden h-[52px] px-6 text-base font-semibold",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_10px_30px_-10px_rgba(0,0,0,0.5)]",
                "transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                className,
            )}
        >
            <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full" />
            <span className="flex items-center gap-2">
                {children}
                {showIcon && <ArrowRight />}
            </span>
        </a>
    );
};
