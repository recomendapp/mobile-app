import { useTheme } from '@/providers/ThemeProvider';
import { TrueSheet as RNTrueSheet, TrueSheetProps as RNTrueSheetProps } from '@lodev09/react-native-true-sheet';
import { forwardRef } from 'react';

interface TrueSheetProps extends RNTrueSheetProps {
  lightColor?: string;
  darkColor?: string;
};

const TrueSheet = forwardRef<
  React.ComponentRef<typeof RNTrueSheet>,
  TrueSheetProps
>(({ backgroundColor, style, cornerRadius = 24, detents = ["auto"], edgeToEdgeFullScreen = true, children, ...props }, ref) => {
  const { colors } = useTheme();
  return (
  <RNTrueSheet
  ref={ref}
  detents={detents}
  cornerRadius={cornerRadius}
  backgroundColor={backgroundColor ?? colors.muted}
  edgeToEdgeFullScreen={edgeToEdgeFullScreen}
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
