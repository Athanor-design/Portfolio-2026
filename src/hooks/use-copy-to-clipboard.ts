import { useCallback, useEffect, useRef, useState } from "react";

/** Copies text and exposes a `copied` flag that resets after `timeout` ms. */
export const useCopyToClipboard = (timeout = 2000) => {
    const [copied, setCopied] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const copy = useCallback(
        async (text: string) => {
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                return false;
            }
            setCopied(true);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setCopied(false), timeout);
            return true;
        },
        [timeout],
    );

    return { copied, copy };
};
