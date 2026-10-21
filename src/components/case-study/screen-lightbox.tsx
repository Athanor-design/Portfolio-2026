import { XClose } from "@untitledui/icons";
import { useState } from "react";
import { Dialog as AriaDialog, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components";

export interface LightboxImage {
    src: string;
    alt: string;
}

interface ScreenLightboxProps {
    image: LightboxImage | null;
    onClose: () => void;
}

/*
 * Full-screen viewer for a screenshot at its real size: the original file is drawn 1:1, one image pixel per
 * device pixel (width = natural width / devicePixelRatio), so the smallest UI text is perfectly sharp.
 * Larger than the viewport → it scrolls. Esc, the close button or a click on the backdrop closes it;
 * React Aria handles the focus trap, scroll lock and focus return.
 */
export const ScreenLightbox = ({ image, onClose }: ScreenLightboxProps) => {
    const [width, setWidth] = useState<number>();

    return (
        <AriaModalOverlay
            isOpen={!!image}
            onOpenChange={(open) => !open && onClose()}
            isDismissable
            className="fixed inset-0 z-[100] flex overflow-auto overscroll-contain bg-black/90 p-6 backdrop-blur-sm md:p-12"
        >
            {/* Shrinks to the image and centres with auto margins, so a click on the dark area around it closes the viewer */}
            <AriaModal className="m-auto outline-none">
                <AriaDialog aria-label={image?.alt ?? "Écran agrandi"} className="outline-none">
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
                            {image && (
                                <img
                                    key={image.src}
                                    src={image.src}
                                    alt={image.alt}
                                    onLoad={(event) => setWidth(Math.round(event.currentTarget.naturalWidth / window.devicePixelRatio))}
                                    style={{ width }}
                                    className="block max-w-none rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.12)] [image-rendering:-webkit-optimize-contrast]"
                                />
                            )}
                        </>
                    )}
                </AriaDialog>
            </AriaModal>
        </AriaModalOverlay>
    );
};
