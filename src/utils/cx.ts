type ClassValue = string | false | null | undefined;

/** Joins truthy class names. */
export const cx = (...classes: ClassValue[]) => classes.filter(Boolean).join(" ");
