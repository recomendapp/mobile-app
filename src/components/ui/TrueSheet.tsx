import { useTheme } from '@/providers/ThemeProvider';
import { TrueSheet as RNTrueSheet, TrueSheetProps as RNTrueSheetProps } from '@lodev09/react-native-true-sheet';
import { forwardRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TrueSheetProps extends RNTrueSheetProps {
  lightColor?: string;
  darkColor?: string;
};

const TrueSheet = forwardRef<
  React.ComponentRef<typeof RNTrueSheet>,
  TrueSheetProps
>(({ backgroundColor, contentContainerStyle, cornerRadius = 24, sizes = ["auto"], edgeToEdge = true, children, ...props }, ref) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
  <RNTrueSheet
  ref={ref}
  sizes={sizes}
  cornerRadius={cornerRadius}
  backgroundColor={backgroundColor ?? colors.muted}
  contentContainerStyle={[
    {
      paddingTop: 16,
      paddingBottom: insets.bottom,
    },
    contentContainerStyle,
  ]}
  edgeToEdge={edgeToEdge}
  {...props}
  >
    {/* <GestureHandlerRootView // break content style and isn't working with Pressable from 'react-native' either
    style={[
      { flexGrow: 1 },
      contentContainerStyle
    ]}
    > */}
      {children}
    {/* </GestureHandlerRootView> */}
  </RNTrueSheet>
  )
});
TrueSheet.displayName = 'TrueSheet';

export {
  TrueSheetProps,
}

export default TrueSheet;
