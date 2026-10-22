/**
 * All editable portfolio content lives here.
 * Entries marked `TODO` are placeholders to replace with real information.
 */

export const profile = {
    name: "Boris Courdouan",
    role: "UX/UI Designer",
    email: "courdouan.boris@gmail.com",
    linkedin: "https://www.linkedin.com/in/boriscourdouan/",
    // TODO: drop your CV in /public with this name
    cv: "/cv-boris-courdouan.pdf",
    portrait: "/portrait.jpg" as string,
    availability: "Disponible — Janvier 2027",
    location: "Paris 15e",
    expertises: ["Design system", "Maquettage", "Prototypage", "Tests utilisateur"],
};

/** Mail link with a pre-filled subject, shared by every "email me" action. */
export const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent("Opportunité — via ton portfolio")}`;

export type Palette = "dia" | "ocean" | "sunset" | "bloom" | "mint";

/** One style guide of a tabbed gallery. */
export interface StyleGuideItem {
    /** Tab label. */
    tab: string;
    /** Style guide page, rebuilt in HTML from the Figma page (the exports are too small to stay sharp on 2x screens). */
    page: "palette-dark" | "palette-light" | "spacing" | "radius";
}

export interface CaseStudyScreen {
    label: string;
    description: string;
    /** Screenshot in /public. When empty, a placeholder frame is shown. */
    image?: string;
    /** Show the capture as is, without the grey stage (for captures that already have their own backdrop). */
    noStage?: boolean;
    /** Element floating over the capture (e.g. an open menu), placed in % of the capture; `width` is its display width
     * on the 856px stage, with exact-size companions `<name>@1x.png` / `@2x.png`. */
    overlay?: { image: string; alt: string; top: number; right: number; width: number };
    /** Interactive replica shown instead of a screenshot (e.g. Figma's Variables panel fed with the real tokens). */
    component?: "figma-variables" | "color-anatomy";
    /**
     * Several cropped captures shown as a grid instead of one screenshot (e.g. a style guide); each crop opens the
     * full, uncropped capture (`full`) in the lightbox. `half` tiles sit two per row.
     */
    gallery?: StyleGuideItem[];
    /** Optional close-up (e.g. a modal opened from this screen), shown floating over the screenshot. */
    detail?: { image: string; description: string };
}

/** Icon shown on a trade-off card (mapped to an Untitled UI icon in the page). */
export type TradeoffIcon =
    | "mental-model"
    | "navigation"
    | "timing"
    | "notification"
    | "integration"
    | "profile"
    | "progressive"
    | "status"
    | "alignment"
    | "unification"
    | "friction"
    | "learning";

export interface CaseStudyStep {
    title: string;
    /** One-sentence takeaway of the step, shown as a lead under the title. */
    summary: string;
    /** Detailed description. */
    paragraphs: string[];
    screen: CaseStudyScreen;
}

export interface CaseStudy {
    need: string;
    consequences: string;
    /** Short scannable headlines for the problem / solution / result summary. */
    headlines: { problem: string; solution: string; result: string };
    /** Short problem statement for the summary (need + consequences in one or two sentences). */
    problem: string;
    /** One-sentence answer, shown in the summary block. */
    solution: string;
    /** Qualitative outcome (no metrics available). */
    result: string;
    /** Illustrated mini-visuals under the summary cards; they're specific to a project, so opt-in. */
    summaryVisuals?: "invoice-automation" | "erp-connectors" | "design-system";
    overview: CaseStudyScreen[];
    steps: CaseStudyStep[];
    tradeoffs: { title: string; description: string; icon?: TradeoffIcon }[];
}

export interface Project {
    slug: string;
    title: string;
    summary: string;
    company: string;
    year: string;
    role: string;
    tags: string[];
    /** Optional key result, e.g. "−40 % de temps de saisie". Hidden when empty. */
    impact?: { value: string; label: string };
    /** Main screen capture in /public, shown in the glass bezel on the `palette` gradient. When empty, an illustrative dashboard is shown. */
    image?: string;
    /** Designed cover visual (full-bleed artwork, not a screen capture). Takes the whole tile instead of the bezel + gradient. */
    cover?: string;
    palette: Palette;
    href: string;
    /** Full case study, shown in the project modal. */
    caseStudy?: CaseStudy;
}

export const projects: Project[] = [
    {
        slug: "connecteurs-erp",
        palette: "ocean",
        title: "Connecter des ERP et logiciels partenaires à la plateforme TRESO2",
        summary: "Permettre aux utilisateurs de garder leur ERP habituel tout en profitant du financement de factures, sans import manuel.",
        company: "TRESO2",
        year: "2026",
        role: "UX/UI Designer",
        tags: ["Intégrations", "Parcours B2B", "Recherche"],
        image: "/projets/connecteurs-erp/etape-1-profil.webp",
        href: "#/projets/connecteurs-erp",
        // Texts from Boris's case-study mockup; the summary-card headlines / solution / result are derived from it (TODO: confirm)
        caseStudy: {
            summaryVisuals: "erp-connectors",
            need: "Certains utilisateurs voulaient continuer à travailler dans leur ERP habituel tout en bénéficiant du module de financement des factures de TRESO2.",
            consequences:
                "Les utilisateurs devaient choisir entre abandonner leur ERP pour basculer sur TRESO2, ou importer manuellement leurs factures. Une option vite intenable dès que les volumes augmentent.",
            problem:
                "Les utilisateurs devaient choisir entre abandonner leur ERP pour basculer sur TRESO2, ou importer manuellement leurs factures. Une option vite intenable dès que les volumes augmentent.",
            headlines: {
                problem: "Abandonner son ERP ou tout importer à la main",
                solution: "Connecter son ERP à TRESO2",
                result: "Garder son ERP, sans ressaisie",
            },
            solution:
                "Depuis le module Funding, l'utilisateur choisit son ERP parmi les connecteurs disponibles et paramètre la connexion pour récupérer ses factures automatiquement.",
            result: "Les factures remontent de l'ERP vers TRESO2, et un statut par connecteur permet de vérifier d'un coup d'œil que tout fonctionne.",
            overview: [
                { label: "Écran 1", description: "Accéder à la section Connecteurs depuis le module Funding." },
                { label: "Écran 2", description: "Choisir son ERP dans la liste des connecteurs disponibles." },
                { label: "Écran 3", description: "Paramétrer la connexion pour récupérer ses factures automatiquement." },
                { label: "Écran 4", description: "Suivre l'état de ses connecteurs depuis une vue dédiée." },
            ],
            steps: [
                {
                    title: "Profil",
                    summary: "Accéder à la section Connecteurs depuis le module Funding.",
                    paragraphs: [
                        "L'utilisateur se connecte sur **Funding**, le module de financement de factures de TRESO2.",
                        "Il accède aux **Connecteurs** depuis son **profil** : la configuration reste rattachée à son identité, ce qui correspond à son **modèle mental**.",
                    ],
                    screen: {
                        label: "Écran 1",
                        description: "Accès aux connecteurs depuis le profil",
                        image: "/projets/connecteurs-erp/etape-1-profil.webp",
                        overlay: {
                            image: "/projets/connecteurs-erp/menu-profil.png",
                            alt: "Menu du profil ouvert sur Connecteurs",
                            top: 5.2,
                            right: 2.2,
                            width: 188,
                        },
                    },
                },
                {
                    title: "Sélectionner un connecteur",
                    summary: "Choisir son ERP dans la liste des connecteurs disponibles.",
                    paragraphs: ["Chaque **ERP** est représenté par son **logo** : l'utilisateur reconnaît le sien **d'un coup d'œil**."],
                    screen: {
                        label: "Écran 2",
                        description: "Liste des connecteurs disponibles",
                        image: "/projets/connecteurs-erp/etape-2-connecteurs.webp",
                    },
                },
                {
                    title: "Se connecter à son ERP",
                    summary: "Paramétrer la connexion pour récupérer ses factures automatiquement.",
                    paragraphs: [
                        "La connexion se déroule en trois temps, pour découper la complexité technique :",
                        "1. Présentation : rappel du connecteur choisi et des fonctionnalités activées.",
                        "2. Connexion : saisie des informations nécessaires (clé API, types de factures, filtrage par client) pour établir le lien entre les deux plateformes.",
                        "3. Configuration : vérification des informations et activation de la connexion.",
                    ],
                    screen: {
                        label: "Écran 3",
                        description:
                            "Paramétrage de la connexion en trois temps : présentation, connexion, puis vérification avant validation",
                        image: "/projets/connecteurs-erp/etape-3-connexion.png",
                        noStage: true,
                    },
                },
                {
                    title: "Mes connecteurs actifs",
                    summary: "Suivre l'état de ses connecteurs depuis une vue dédiée.",
                    paragraphs: [
                        "Une fois la connexion établie, une section **« Mes connecteurs »** apparaît dans le profil.",
                        "Un **badge de statut** confirme que les factures **remontent correctement**.",
                    ],
                    screen: {
                        label: "Écran 4",
                        description: "Vue « Mes connecteurs » et statuts",
                        image: "/projets/connecteurs-erp/etape-4-mes-connecteurs.webp",
                    },
                },
            ],
            tradeoffs: [
                {
                    title: "Intégrer son ERP plutôt que de le remplacer",
                    description: "Conserver l'ERP existant de l'utilisateur au lieu de forcer une migration totale vers TRESO2.",
                    icon: "integration",
                },
                {
                    title: "Rattacher les connecteurs au profil",
                    description: "La configuration appartient à l'utilisateur connecté, pas aux paramètres généraux de la plateforme.",
                    icon: "profile",
                },
                {
                    title: "Faciliter le paramétrage via la divulgation progressive",
                    description:
                        "Présentation → Connexion → Validation. On découpe une étape technique lourde (clé API, périmètre, types de factures) pour que chaque écran reste simple à compléter.",
                    icon: "progressive",
                },
                {
                    title: "Afficher l'état de chaque connexion",
                    description:
                        "Une connexion API peut tomber. Un statut visible sur chaque connecteur permet à l'utilisateur de savoir tout de suite si ses factures remontent correctement.",
                    icon: "status",
                },
            ],
        },
    },
    {
        // TODO: confirm project & copy
        slug: "rapprochement-factures",
        palette: "bloom",
        title: "Automatiser l'approbation des factures réconciliées",
        summary:
            "Les factures déjà réconciliées par le système devaient encore être validées une à une. J'ai conçu leur approbation automatique, intégrée au workflow existant.",
        company: "TRESO2",
        year: "2025",
        role: "UX/UI Designer",
        tags: ["Workflow", "Automatisation", "Parcours B2B"],
        image: "/projets/rapprochement-factures/etape-1-parametrage.webp",
        href: "#/projets/rapprochement-factures",
        caseStudy: {
            need: "Les factures qui atteignaient le statut « Réconcilié » (attribué par le système) obligeaient toujours les utilisateurs à valider chaque facture, même quand ce n'était pas nécessaire.",
            consequences:
                "Lors d'imports importants, cette tâche devenait chronophage, et de nombreux utilisateurs s'en sont plaints auprès de notre support.",
            summaryVisuals: "invoice-automation",
            // TODO: confirm headlines, solution & result wording
            problem:
                "Même réconciliées par le système, les factures devaient être validées une à une : un vrai frein lors des gros imports, souvent remonté au support.",
            headlines: {
                problem: "Une validation manuelle devenue inutile",
                solution: "L'approbation automatique, là où on l'attend",
                result: "Moins de clics, autant de contrôle",
            },
            solution:
                "Une approbation automatique des factures réconciliées, activable depuis l'écran de rapprochement et intégrée au workflow de validation existant.",
            result: "Plus de validation une à une des factures déjà réconciliées, sans perdre le contrôle grâce aux validateurs de secours et aux notifications.",
            overview: [
                {
                    label: "Écran 1",
                    description:
                        "Ajouter l'option depuis l'écran de rapprochement, pour qu'elle corresponde au modèle mental de l'utilisateur.",
                },
                {
                    label: "Écran 2",
                    description: "Définir à quelle étape du workflow de validation de la facture l'automatisation doit intervenir.",
                },
                {
                    label: "Écran 3",
                    description: "Ajouter une option pour activer les notifications lors de l'approbation automatique d'une facture.",
                },
            ],
            steps: [
                {
                    title: "Paramétrage",
                    // TODO: confirm step summaries
                    summary: "Un réglage unique, placé là où l'utilisateur configure déjà son rapprochement.",
                    paragraphs: [
                        "L'automatisation repose sur des **seuils de tolérance** (la marge d'erreur acceptable), définis avec le **type de rapprochement** de chaque filiale.",
                        "Un réglage fait **une seule fois**, à la création de l'espace.",
                        "Pour guider ce premier passage, un **lien de redirection** mène directement à l'écran d'activation de l'approbation automatique.",
                    ],
                    screen: {
                        label: "Écran 1",
                        description: "Écran de rapprochement et seuils de tolérance",
                        image: "/projets/rapprochement-factures/etape-1-parametrage.webp",
                    },
                },
                {
                    title: "Activer l'automatisation",
                    summary: "L'automatisation s'insère dans le workflow de validation existant, avec un filet de sécurité.",
                    paragraphs: [
                        "L'utilisateur choisit à quelle **étape du workflow** intégrer l'automatisation.",
                        "En cas d'échec, des **validateurs humains** prennent le relais.",
                    ],
                    screen: {
                        label: "Écran 2",
                        description: "Configuration de l'étape du workflow",
                        image: "/projets/rapprochement-factures/etape-2-workflow.webp",
                        detail: {
                            image: "/projets/rapprochement-factures/etape-2-modale.png",
                            description: "Modale d'une étape : validation automatique si la facture est réconciliée",
                        },
                    },
                },
                {
                    title: "Notification",
                    summary: "Chaque utilisateur choisit d'être prévenu des approbations automatiques, pour garder la main.",
                    // TODO: written from the screen (the mockup reused step 2's text) — confirm or replace with the real copy
                    paragraphs: [
                        "Une notification **« Facture approuvée automatiquement »** rejoint les préférences de chaque utilisateur.",
                        "**Désactivée par défaut**, elle s'active par email **en un clic**.",
                    ],
                    screen: {
                        label: "Écran 3",
                        description: "Préférences de notification de l'utilisateur",
                        image: "/projets/rapprochement-factures/etape-3-notifications.webp",
                    },
                },
            ],
            tradeoffs: [
                {
                    title: "Adapter le parcours au modèle mental",
                    description: "L'interface s'adapte à l'utilisateur, pas l'inverse.",
                    icon: "mental-model",
                },
                {
                    title: "Réduire la charge cognitive via une aide à la navigation",
                    description: "Empêcher l'utilisateur de perdre le contexte de sa navigation.",
                    icon: "navigation",
                },
                {
                    title: "Placer l'automatisation au bon moment du parcours",
                    description: "L'activation se fait là où elle a du sens pour l'utilisateur.",
                    icon: "timing",
                },
                {
                    title: "Laisser les notifications flexibles",
                    description: "Chaque utilisateur choisit d'être informé des approbations automatiques.",
                    icon: "notification",
                },
            ],
        },
    },
    {
        slug: "design-system",
        palette: "sunset",
        // Texts from Boris's case-study mockup; the title, summary-card headlines / solution / result are derived from it (TODO: confirm)
        title: "Créer un design system basé sur le theming shadcn/ui",
        summary:
            "Structurer les tokens du design system sur le theming de shadcn/ui, pour faciliter la production de l'équipe dev qui utilise ce framework.",
        company: "TRESO2",
        year: "2023 — Actuel",
        role: "UX/UI Designer",
        tags: ["Design system", "Tokens", "Documentation"],
        cover: "/projets/design-system/couverture.webp",
        href: "#/projets/design-system",
        caseStudy: {
            summaryVisuals: "design-system",
            need: "Créer un design system en basant la structure de ses tokens sur le theming de shadcn, pour faciliter la production de l'équipe dev qui utilise ce framework.",
            consequences:
                "Deux plateformes développées indépendamment, avec des architectures de tokens incompatibles, ce qui freinait la scalabilité et alourdissait la collaboration design et dev.",
            problem:
                "Deux plateformes développées indépendamment, avec des architectures de tokens incompatibles, ce qui freinait la scalabilité et alourdissait la collaboration design et dev.",
            headlines: {
                problem: "Deux plateformes, deux architectures de tokens",
                solution: "Un design system aligné sur shadcn",
                result: "Design et dev sur une base commune",
            },
            solution:
                "Face à deux plateformes aux architectures incompatibles, j'ai structuré un design system documenté autour de la logique shadcn, pour aligner design et développement sur une base commune.",
            result: "Les tokens reflètent directement la structure attendue par les devs, et les composants visibles dans les projets 1 et 2 sont issus de ce système.",
            overview: [
                { label: "Écran 1", description: "Style guide : espacements et typographie." },
                { label: "Écran 2", description: "Architecture des tokens : Primitive, Theme et Mode." },
                { label: "Écran 3", description: "Guide d'usage des variables de couleur." },
            ],
            steps: [
                {
                    title: "Style guide",
                    summary: "Documenter les fondations visuelles du produit, pour parler le même langage visuel.",
                    paragraphs: [
                        "Un style guide documente les fondations visuelles d'un produit : les **couleurs**, les **espacements** et les **radius**, présentés sous forme de planches de référence.",
                        "C'est ce qui permet à toute l'équipe de parler le même langage visuel.",
                    ],
                    screen: {
                        label: "Écran 1",
                        description: "Style guide : palettes dark et light, espacements et radius",
                        // Carousel: the full light palette page (its top reads well in the card); the step rebuilds the pages in HTML
                        image: "/projets/design-system/palette-light.webp",
                        gallery: [
                            { tab: "Palette light", page: "palette-light" },
                            { tab: "Palette dark", page: "palette-dark" },
                            { tab: "Spacing", page: "spacing" },
                            { tab: "Radius", page: "radius" },
                        ],
                    },
                },
                {
                    title: "Architecture des tokens",
                    summary: "Trois couches de tokens, de la valeur brute au composant.",
                    paragraphs: [
                        "1. Primitive : les valeurs brutes (couleurs, espacements, radius, opacités).",
                        "2. Theme : les variables sémantiques (primary, destructive, muted…) qui donnent du sens aux primitives et personnalisent le système pour TRESO2.",
                        "3. Mode : les variables lues par les composants, héritées du Theme et déclinées en light et dark.",
                        "Le flux est unidirectionnel : Primitive → Theme → Mode.",
                    ],
                    screen: {
                        label: "Écran 2",
                        description: "Variables Figma : collections Primitive, Theme et Mode",
                        component: "figma-variables",
                    },
                },
                {
                    title: "Guide d'usage des couleurs",
                    summary: "Chaque variable de couleur du groupe de base a un but spécifique dans shadcn/ui.",
                    paragraphs: [
                        "Le guide associe chaque variable à son usage : **background** pour le fond de l'application, **primary** pour les actions principales, **muted** pour les éléments secondaires, **destructive** pour les erreurs et suppressions, etc.",
                    ],
                    screen: {
                        label: "Écran 3",
                        description: "Guide d'usage : chaque variable de couleur appliquée aux composants",
                        component: "color-anatomy",
                    },
                },
            ],
            tradeoffs: [
                {
                    title: "Alignement design-dev",
                    description:
                        "Adoption de la logique shadcn/Tailwind comme référence commune : les tokens du design system reflètent directement la structure attendue par les devs.",
                    icon: "alignment",
                },
                {
                    title: "Unification des plateformes",
                    description:
                        "Deux plateformes, deux conventions différentes. La migration vers une architecture de tokens unifiée a supprimé les incohérences et réduit la dette de maintenance.",
                    icon: "unification",
                },
                {
                    title: "Réduction des frictions",
                    description:
                        "Moins d'allers-retours en implémentation : les composants livrés correspondent à ce que le front-end peut consommer sans retraduction.",
                    icon: "friction",
                },
                {
                    title: "Montée en compétence transversale",
                    description:
                        "Comprendre le theming au niveau code (CSS custom properties, config Tailwind) a élargi mon périmètre d'action au-delà du design pur.",
                    icon: "learning",
                },
            ],
        },
    },
];

export interface Experience {
    company: string;
    /** Optional logo in /public, shown instead of the company name. */
    logo?: string;
    role: string;
    /** Contracts held in this role, current one first (e.g. CDI, then the work-study that led to it). */
    contracts?: { label: string; period?: string }[];
    period: string;
    context: string;
    highlights: string[];
}

export const about =
    "Je travaille main dans la main avec les équipes produit et tech dès les premières phases d'un projet. Comprendre les contraintes tôt me permet de concevoir des interfaces solides, cohérentes d'une itération à l'autre — et plus rapides à développer.";

export const experiences: Experience[] = [
    {
        company: "TRESO2",
        logo: "/logos/treso2.png",
        role: "UX/UI Designer",
        contracts: [
            { label: "CDI", period: "depuis 2025" },
            { label: "Alternance", period: "2023 — 2025" },
        ],
        period: "2023 — Actuel",
        context: "Plateforme SaaS de facturation électronique agréée.",
        highlights: [
            "Conception d'interfaces pour des workflows complexes : validation, rapprochement de factures, conformité fournisseurs.",
            "Prise en compte des contraintes réglementaires et métier propres à la facturation électronique.",
            "Conception et maintenance du design system, garant de la cohérence visuelle et fonctionnelle.",
            "Tests utilisateurs pour valider et affiner les parcours, avec les équipes Produit, Tech et Marketing.",
        ],
    },
    {
        company: "HAVAS",
        logo: "/logos/havas.png",
        role: "UX/UI Designer",
        contracts: [{ label: "Alternance" }],
        period: "2021 — 2022",
        context: "Groupe de communication et de conseil.",
        highlights: [
            "Solutions responsive adaptées à chaque device : desktop, tablette, mobile.",
            "Benchmarks, audits et veille concurrentielle pour nourrir les choix de conception.",
            "Landing pages et newsletters, de la conception à la mise en production.",
        ],
    },
];
