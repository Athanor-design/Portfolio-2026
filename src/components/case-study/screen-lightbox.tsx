import { XClose } from "@untitledui/icons";
import { useState } from "react";
import { Dialog as AriaDialog, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";

export interface LightboxImage {
    src: string;
    alt: string;
    /** Higher-resolution file used on mobile, where the image is stretched to fill the screen. */
    mobileSrc?: string;
}

const MOBILE_QUERY = "(max-width: 767px)";

interface ScreenLightboxProps {
    image: LightboxImage | null;
    onClose: () => void;
}

/*
 * Full-screen viewer for a screenshot at its real size: the original file is drawn 1:1, one image pixel per
 * device pixel (width = natural width / devicePixelRatio), so the smallest UI text is perfectly sharp.
 * Larger than the viewport → it scrolls. On mobile the image fills the screen instead (contained, no scroll),
 * from `mobileSrc` when given so it stays sharp. Esc, the close button or a click on the backdrop closes it;
 * React Aria handles the focus trap, scroll lock and focus return.
 */
export const ScreenLightbox = ({ image, onClose }: ScreenLightboxProps) => {
    const [width, setWidth] = useState<number>();
    // Read when the viewer opens; a phone does not cross the breakpoint while it is open
    const isMobile = typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;
    const src = (isMobile && image?.mobileSrc) || image?.src;

    return (
        <AriaModalOverlay
            isOpen={!!image}
            onOpenChange={(open) => !open && onClose()}
            isDismissable
            // The blur lives on a pseudo-element: a backdrop-filter on the scrolling overlay itself would make it the
            // containing block of the fixed close button, which would then scroll away with the image.
            className="fixed inset-0 z-[100] flex overflow-auto overscroll-contain bg-black/90 p-0 before:pointer-events-none before:fixed before:inset-0 before:-z-10 before:backdrop-blur-sm md:p-12"
        >
            {/* Shrinks to the image and centres with auto margins, so a click on the dark area around it closes the viewer */}
            <AriaModal className="m-auto outline-none max-md:flex max-md:h-dvh max-md:w-screen max-md:items-center max-md:justify-center">
                <AriaDialog
                    aria-label={image?.alt ?? "Écran agrandi"}
                    className="outline-none max-md:flex max-md:size-full max-md:items-center max-md:justify-center"
                >
                    {({ close }) => (
                        <>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Fermer"
                                className="fixed top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-xl transition duration-100 ease-linear outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
                            >
                                <XClose className="size-5" aria-hidden="true" />
                            </button>
                            {image && src && (
                                <img
                                    key={src}
                                    src={src}
                                    alt={image.alt}
                                    onLoad={(event) => setWidth(Math.round(event.currentTarget.naturalWidth / window.devicePixelRatio))}
                                    style={isMobile ? undefined : { width }}
                                    className="block max-w-none rounded-md max-md:max-h-dvh max-md:max-w-full max-md:rounded-none max-md:object-contain max-md:shadow-none shadow-[0_0_0_1px_rgba(255,255,255,0.12)] [image-rendering:-webkit-optimize-contrast]"
                                />
                            )}
                        </>
                    )}
                </AriaDialog>
            </AriaModal>
        </AriaModalOverlay>
    );
};
