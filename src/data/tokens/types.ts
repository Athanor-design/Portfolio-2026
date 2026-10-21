/** One mode's value of a Figma variable. */
export interface TokenValue {
    /** Number or string, or colour as `#RRGGBB`. */
    value: number | string;
    /** Opacity in %, for translucent colours. */
    alpha?: number;
    /** True when the opacity is set on this variable on top of its alias (Figma's "colors/primary-dark · 5%"). */
    ownAlpha?: boolean;
    /** Name of the variable this one points to (e.g. `dark/blue/500` in Primitive), when it's an alias. */
    alias?: string;
}

/** A Figma variable as shown in the Variables panel replica, with one value per mode. */
export interface Token {
    name: string;
    type: "number" | "color" | "string" | "boolean";
    values: TokenValue[];
}

export interface TokenGroup {
    /** Group path, e.g. `["dark", "blue"]`; empty for variables at the root of the collection. */
    path: string[];
    tokens: Token[];
}

export interface TokenCollection {
    name: string;
    /** Column names, e.g. `["Value"]`, `["Treso2", "BPI"]`, `["Dark", "Light"]`. */
    modes: string[];
    groups: TokenGroup[];
}
