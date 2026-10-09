/** SGA brand manual (2023) — primary palette and typography tokens. */
export const SGA_COLORS = {
  navy: "#072334",
  blue: "#297cc1",
  blueDeep: "#044f80",
  white: "#ffffff",
} as const;

/** Performance grade colors aligned with IDP / brand reporting scale. */
export const SGA_GRADE_COLORS = {
  "Below Level": "#a1343c",
  Average: "#ad5129",
  Good: "#05712D",
  "Above Level": SGA_COLORS.blueDeep,
} as const;

/** Carry progressive rate line — identical in the web app and PDF export. */
export const CARRY_PROGRESSIVE_RATE_COLORS = {
  /** In transition (e.g. 80% progressive plays) */
  transition: "#528f66",
  /** In possession (e.g. 33% progressive plays) */
  possession: "#a89028",
} as const;

export type CarryProgressiveSituation = keyof typeof CARRY_PROGRESSIVE_RATE_COLORS;

export function carryProgressiveRateColor(situation: CarryProgressiveSituation): string {
  return CARRY_PROGRESSIVE_RATE_COLORS[situation];
}

export const SGA_FONTS = {
  ui: '"Source Sans 3", "Source Sans Pro", "Trebuchet MS", sans-serif',
  display: '"Good Times", "Source Sans 3", sans-serif',
} as const;

export const BRAND = {
  name: "SGA Performance",
  legal: "Soccer Growth Analytics",
  slogan: "Greatness Can Be Achieved",
  logos: {
    horizontal: "/brand/sga-logo-horizontal.png",
    vertical: "/brand/sga-logo-vertical.png",
    symbol: "/brand/sga-logo-symbol.png",
  },
  /**
   * Horizontal lockup with the transparent margin cropped off. The padded
   * asset cannot be optically centered inside a tight band.
   */
  logoTrimmed: "/brand/sga-logo-horizontal-trim.png",
} as const;

export type LogoVariant = keyof typeof BRAND.logos;
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero" | "sidebar" | "float" | "corner";

export const LOGO_DIMENSIONS: Record<
  LogoVariant,
  { width: number; height: number; className: LogoSize }
> = {
  horizontal: { width: 240, height: 56, className: "lg" },
  vertical: { width: 128, height: 160, className: "sidebar" },
  symbol: { width: 56, height: 56, className: "md" },
};
