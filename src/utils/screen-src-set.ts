/**
 * Screenshots are exported at 2× (e.g. 2000px wide). Next to each one sit two lossless PNG companions sized to the
 * exact pixels they are displayed at: `<name>@1x.png` (the display width) for standard screens and `<name>@2x.png`
 * (twice that) for retina. The browser then draws them pixel for pixel instead of resampling the original on the fly,
 * which is what blurs small UI text.
 */
export const screenSrcSet = (src: string, displayWidth: number) => {
    const base = src.replace(/\.(webp|png|jpe?g)$/, "");
    return `${base}@1x.png ${displayWidth}w, ${base}@2x.png ${displayWidth * 2}w`;
};
