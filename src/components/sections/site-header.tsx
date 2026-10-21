import { createPortal } from "react-dom";
import { Home02 } from "@untitledui/icons";
import { motion } from "motion/react";
import { EASE } from "@/components/ui/reveal";
import { profile } from "@/data/content";
import { useActiveSection } from "@/hooks/use-active-section";
import { cx } from "@/utils/cx";

const links = [
    { id: "travaux", label: "Travaux" },
    { id: "experiences", label: "Expériences" },
    { id: "contact", label: "Contact" },
];
const ids = links.map((link) => link.id);
// On mobile the intro sits above the work, so the floating pill also needs a way back to it.
const mobileIds = ["top", ...ids];

interface NavPillProps {
    active: string;
    layoutId: string;
    className?: string;
    /** Prepend a home (back to intro) button — used on mobile. */
    showHome?: boolean;
}

const NavPill = ({ active, layoutId, className, showHome }: NavPillProps) => (
    <nav
        aria-label="Navigation principale"
        className={cx(
            "shrink-0 items-center rounded-full bg-primary p-1 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.08]",
            className,
        )}
    >
        <ul className="flex items-center">
            {showHome && (
                <li>
                    <a
                        href="#top"
                        aria-label="Accueil"
                        aria-current={active === "top" ? "location" : undefined}
                        className={cx(
                            "relative flex items-center rounded-full px-3 py-1.5 transition duration-200 ease-out",
                            active === "top" ? "text-primary" : "text-tertiary hover:text-primary",
                        )}
                    >
                        {active === "top" && (
                            <motion.span
                                layoutId={layoutId}
                                className="absolute inset-0 rounded-full bg-tertiary"
                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            />
                        )}
                        <Home02 className="relative size-4" aria-hidden="true" />
                    </a>
                </li>
            )}
            {links.map((link) => {
                const isActive = active === link.id;
                return (
                    <li key={link.id}>
                        <a
                            href={`#${link.id}`}
                            aria-current={isActive ? "location" : undefined}
                            className={cx(
                                "relative flex items-center rounded-full px-3.5 py-1.5 text-sm transition duration-200 ease-out",
                                isActive ? "text-primary" : "text-tertiary hover:text-primary",
                            )}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId={layoutId}
                                    className="absolute inset-0 rounded-full bg-tertiary"
                                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                />
                            )}
                            <span className="relative">{link.label}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    </nav>
);

/**
 * Identity on the left (avatar, name, role),
 * pill navigation with a sliding indicator that follows the section in view
 * (mymind / T1 Energy-inspired). On mobile the pill floats at the bottom of the screen.
 */
export const SiteHeader = () => {
    const active = useActiveSection(ids);
    const activeMobile = useActiveSection(mobileIds);

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="flex items-center justify-between gap-4"
            >
                <a href="#top" className="flex min-w-0 items-center gap-3">
                    {/* Glass frame around the photo: translucent fill, light rim and top highlight */}
                    <span className="relative shrink-0 rounded-[14px] bg-white/[0.08] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_rgba(0,0,0,0.6)] ring-1 ring-white/20 backdrop-blur-md">
                        <span className="flex size-11 items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-semibold text-white">
                            {profile.portrait ? (
                                // Square photo: zoom onto the face so it reads at avatar size
                                <img src={profile.portrait} alt="" className="size-full origin-[49%_10%] scale-[2.2] object-cover" />
                            ) : (
                                "BC"
                            )}
                        </span>
                    </span>
                    <span className="min-w-0 leading-tight">
                        <span className="block truncate font-semibold text-primary">{profile.name}</span>
                        <span className="block truncate text-sm text-tertiary">{profile.role}</span>
                    </span>
                </a>

                {/* Desktop / tablet: inline pill */}
                <NavPill active={active} layoutId="nav-indicator" className="hidden sm:flex" />
            </motion.header>

            {/* Mobile: floating pill at the bottom of the screen, within thumb reach.
                Portalled to <body> so no parent stacking context can hide it behind the cards. */}
            {createPortal(
                <NavPill
                    active={activeMobile}
                    layoutId="nav-indicator-mobile"
                    showHome
                    className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit bg-primary_alpha backdrop-blur-xl sm:hidden"
                />,
                document.body,
            )}
        </>
    );
};
