export type ColorTheme = {
  foreground: string;
  background: string;
  primary: string;
  primarySubued: string;
  primaryForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  destructive: string;
  destructiveForeground: string;
  tint: string;
  // Accent colors
  accentYellow: string;
  accentYellowForeground: string;
  accentYellowHover: string;
  accentBlue: string;
  accentBlueForeground: string;
  accentBlueHover: string;
  accentPink: string;
  accentPinkForeground: string;
  accentPinkHover: string;
};

const sharedColors = {
  black: 'hsl(0 0% 0%)',
  white: 'hsl(0 0% 100%)',
};

type SharedColors = typeof sharedColors;

export type TColors = ColorTheme & SharedColors;

type ColorPalettes = {
  light: TColors;
  dark: TColors;
};

const Colors: ColorPalettes = {
  dark: {
    foreground: 'hsl(0 0% 98%)',
    background: 'hsl(0 10% 3.9%)',
    primary: 'hsl(0 100% 100%)',
    primarySubued: 'hsl(0 0% 65%)',
    primaryForeground: 'hsl(0 0% 6%)',
    muted: 'hsl(0 0% 12%)',
    mutedForeground: 'hsl(0 0% 57%)',
    card: 'hsl(0 0% 8%)',
    cardForeground: 'hsl(0 0% 100%)',
    destructive: 'hsl(0 72% 51%)',
    destructiveForeground: 'hsl(0 0% 98%)',
    tint: 'hsl(0 0% 100%)',
    // Accent colors
    accentYellow: 'hsl(51 100% 73%)',
    accentYellowForeground: sharedColors.black,
    accentYellowHover: 'hsl(44 97% 40%)',
    accentBlue: 'hsl(216, 100%, 58%)',
    accentBlueForeground: sharedColors.white,
    accentBlueHover: 'hsl(212 100% 30%)',
    accentPink: 'hsl(320 87% 75%)',
    accentPinkForeground: sharedColors.black,
    accentPinkHover: 'hsl(320 89% 57%)',
    ...sharedColors,
  },
  light: {
    foreground: 'hsl(240 10% 3.9%)',
    background: 'hsl(0 0% 100%)',
    primary: 'hsl(0 100% 100%)',
    primarySubued: 'hsl(0 0% 65%)',
    primaryForeground: 'hsl(240 5.9% 10%;)',
    muted: 'hsl(0 0% 8%)',
    mutedForeground: 'hsl(0 0% 57%)',
    card: 'hsl(240 10% 3.9%)',
    cardForeground: 'hsl(0 0% 98%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(0 0% 98%)',
    tint: 'hsl(240 5.9% 10%)',
    // Accent colors
    accentYellow: 'hsl(51 100% 73%)',
    accentYellowForeground: sharedColors.black,
    accentYellowHover: 'hsl(44 97% 40%)',
    accentBlue: 'hsl(216, 100%, 58%)',
    accentBlueForeground: sharedColors.white,
    accentBlueHover: 'hsl(212 100% 30%)',
    accentPink: 'hsl(320 87% 75%)',
    accentPinkForeground: sharedColors.black,
    accentPinkHover: 'hsl(320 89% 57%)',
    ...sharedColors,
  },
};

export default Colors;