import { CaseStudyPage } from "@/components/case-study/case-study-page";
import { IntroPanel } from "@/components/sections/intro-panel";
import { WorkColumn } from "@/components/sections/work-column";
import { Toast } from "@/components/ui/toast";
import { profile, projects } from "@/data/content";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProjectRoute } from "@/hooks/use-project-route";

/** Split layout (YWY-style): fixed intro on the left, scrolling work on the right; case studies get their own page. */
const App = () => {
    const { copied, copy } = useCopyToClipboard();
    const copyEmail = () => copy(profile.email);
    const { slug, close } = useProjectRoute();
    const isProject = projects.some((p) => p.slug === slug);

    return (
        <>
            {isProject && slug ? (
                <CaseStudyPage slug={slug} onClose={close} />
            ) : (
                <main id="top" className="mx-auto grid max-w-[1600px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <IntroPanel copied={copied} onCopyEmail={copyEmail} />
                    <WorkColumn copied={copied} onCopyEmail={copyEmail} />
                </main>
            )}
            <Toast isVisible={copied} message="Email copié dans le presse-papier" />
        </>
    );
};

export default App;
