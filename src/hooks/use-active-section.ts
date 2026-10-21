import { useEffect, useState } from "react";

/**
 * Returns the id of the last section whose top has crossed `offset` (fraction of the viewport),
 * or the last section once the page is scrolled to the bottom.
 */
export const useActiveSection = (ids: string[], offset = 0.4) => {
    const [active, setActive] = useState(ids[0]);

    useEffect(() => {
        const update = () => {
            const line = window.innerHeight * offset;
            let current = ids[0];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            // At the very bottom the last section can't reach the line: treat it as active.
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            if (atBottom) current = ids[ids.length - 1];
            setActive(current);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [ids, offset]);

    return active;
};
