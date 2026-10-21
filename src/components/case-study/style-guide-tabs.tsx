import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tab as AriaTab, TabList as AriaTabList, TabPanel as AriaTabPanel, Tabs as AriaTabs } from "react-aria-components";
import { PaletteGuide, RadiusGuide, SpacingGuide } from "@/components/case-study/style-guide-pages";
import type { StyleGuideItem } from "@/data/content";
import { cx } from "@/utils/cx";

const PAGES: Record<StyleGuideItem["page"], () => React.JSX.Element> = {
    "palette-dark": () => <PaletteGuide mode="dark" />,
    "palette-light": () => <PaletteGuide mode="light" />,
    spacing: () => <SpacingGuide />,
    radius: () => <RadiusGuide />,
};

/*
 * Style guide viewer (after Square's and Copilot's segmented tabs on Mobbin): a segmented control to switch between
 * the guides and a scrollable window onto each page, rebuilt in HTML so it stays sharp on any screen.
 */
export const StyleGuideTabs = ({ items }: { items: StyleGuideItem[] }) => {
    const [selected, setSelected] = useState(items[0].tab);
    const current = items.find((item) => item.tab === selected) ?? items[0];
    const Page = PAGES[current.page];

    return (
        <AriaTabs
            selectedKey={selected}
            onSelectionChange={(key) => setSelected(String(key))}
            className="overflow-hidden rounded-xl bg-white/[0.035] ring-1 ring-white/[0.08]"
        >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] p-2">
                <AriaTabList
                    aria-label="Style guides"
                    className="flex min-w-0 gap-0.5 overflow-x-auto rounded-lg bg-white/[0.04] p-0.5 [scrollbar-width:none]"
                >
                    {items.map((item) => (
                        <AriaTab
                            key={item.tab}
                            id={item.tab}
                            className={({ isSelected, isFocusVisible }) =>
                                cx(
                                    "relative shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap outline-none transition duration-100 ease-linear",
                                    isSelected ? "text-primary" : "text-tertiary hover:text-secondary",
                                    isFocusVisible && "ring-2 ring-white/60",
                                )
                            }
                        >
                            {({ isSelected }) => (
                                <>
                                    {isSelected && (
                                        <motion.span
                                            layoutId="style-guide-tab"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                                            className="absolute inset-0 rounded-md bg-white/[0.1] shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                                        />
                                    )}
                                    <span className="relative">{item.tab}</span>
                                </>
                            )}
                        </AriaTab>
                    ))}
                </AriaTabList>
            </div>

            {/* A window onto the real page: it opens at the top and scrolls through the whole guide */}
            <AriaTabPanel id={current.tab} className="relative outline-none">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={current.tab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="h-[360px] overflow-y-auto overscroll-contain px-4 pt-4 [scrollbar-width:none] md:h-[520px]"
                    >
                        <div className="mx-auto max-w-[864px] overflow-hidden rounded-t-md ring-1 ring-white/[0.06]">
                            <Page />
                        </div>
                    </motion.div>
                </AnimatePresence>
                {/* Fade at the bottom edge: the page continues below */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#1a1a19]/80 to-transparent"
                />
            </AriaTabPanel>
        </AriaTabs>
    );
};
