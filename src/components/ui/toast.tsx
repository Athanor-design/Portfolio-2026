import { CheckCircle } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";

interface ToastProps {
    isVisible: boolean;
    message: string;
}

/** Small confirmation pill pinned to the bottom of the viewport. */
export const Toast = ({ isVisible, message }: ToastProps) => (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className="flex items-center gap-2 rounded-full bg-primary-solid px-4 py-2.5 text-sm font-medium text-primary_on-solid shadow-xl"
                >
                    <CheckCircle className="size-4 text-fg-success-secondary" aria-hidden="true" />
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);
