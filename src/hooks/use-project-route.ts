import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const PREFIX = "#/projets/";

const readSlug = () => (window.location.hash.startsWith(PREFIX) ? decodeURIComponent(window.location.hash.slice(PREFIX.length)) : null);

/**
 * Tracks the project opened through the URL hash (`#/projets/<slug>`), so a case
 * study has its own shareable page and the browser back button returns home.
 * The home scroll position is remembered and restored when leaving a project.
 */
export const useProjectRoute = () => {
    const [slug, setSlug] = useState<string | null>(readSlug);
    // Home scroll position, and whether the project was opened from the home (vs. a direct link).
    const homeScroll = useRef(0);
    const openedFromHome = useRef(false);
    const previous = useRef(slug);

    useEffect(() => {
        if ("scrollRestoration" in history) history.scrollRestoration = "manual";
        const onChange = () => {
            const nextSlug = readSlug();
            if (nextSlug && !previous.current) {
                homeScroll.current = window.scrollY;
                openedFromHome.current = true;
            }
            setSlug(nextSlug);
        };
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);

    // Project page → top of the page; back home → where the visitor left it.
    useLayoutEffect(() => {
        if (slug === previous.current) return;
        window.scrollTo({ top: slug ? 0 : homeScroll.current, behavior: "instant" });
        if (!slug) openedFromHome.current = false;
        previous.current = slug;
    }, [slug]);

    const close = useCallback(() => {
        if (openedFromHome.current) {
            history.back();
            return;
        }
        // Direct link: there's no home entry to go back to, so swap the URL in place.
        history.replaceState(null, "", window.location.pathname + window.location.search);
        setSlug(null);
    }, []);

    return { slug, close };
};
