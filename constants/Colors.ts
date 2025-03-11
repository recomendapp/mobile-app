export type ColorTheme = {
  foreground: string;
  background: string;
  muted: string;
  tint: string;
};

const sharedColors = {
  black: '#000000',
  white: '#FFFFFF',
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
    background: 'hsl(240 10% 3.9%)',
    muted: 'hsl(0 0% 12%)',
    tint: 'hsl(0 0% 100%)',
    ...sharedColors,
  },
  light: {
    foreground: 'hsl(240 10% 3.9%)',
    background: 'hsl(0 0% 100%)',
    muted: 'hsl(0 0% 8%)',
    tint: 'hsl(240 5.9% 10%)',
    ...sharedColors,
  },
};

export default Colors;

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// const tintColorLight = '#0a7ea4';
// const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     text: '#11181C',
//     background: '#fff',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };

// export const Colors = {
//   light: {
//     background: 'hsl(0 0% 100%)', // background
//     border: 'hsl(240 5.9% 90%)', // border
//     card: 'hsl(0 0% 100%)', // card
//     notification: 'hsl(0 84.2% 60.2%)', // destructive
//     primary: 'hsl(240 5.9% 10%)', // primary
//     text: 'hsl(240 10% 3.9%)', // foreground
//     icon: '#687076',
//     tint: tintColorLight,
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     background: 'hsl(240 10% 3.9%)', // background
//     border: 'hsl(240 3.7% 15.9%)', // border
//     card: 'hsl(240 10% 3.9%)', // card
//     notification: 'hsl(0 72% 51%)', // destructive
//     primary: 'hsl(0 0% 98%)', // primary
//     text: 'hsl(0 0% 98%)', // foreground
//     icon: '#9BA1A6',
//     tint: tintColorDark,
//     tabIconSelected: tintColorDark,
//   },
// };