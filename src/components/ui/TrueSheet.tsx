import { isAndroid } from '@/platform/detection';
import { useTheme } from '@/providers/ThemeProvider';
import { TrueSheet as RNTrueSheet, TrueSheetProps as RNTrueSheetProps } from '@lodev09/react-native-true-sheet';
import { forwardRef } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TrueSheetProps extends RNTrueSheetProps {
  lightColor?: string;
  darkColor?: string;
};

const TrueSheet = forwardRef<
  React.ComponentRef<typeof RNTrueSheet>,
  TrueSheetProps
>(({ backgroundColor, style, cornerRadius = 24, detents, edgeToEdgeFullScreen = true, children, ...props }, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
  <RNTrueSheet
  ref={ref}
  detents={detents || (props.scrollable && isAndroid) ? [0.33, 1] : ['auto']}
  cornerRadius={cornerRadius}
  backgroundColor={backgroundColor ?? colors.muted}
  edgeToEdgeFullScreen={edgeToEdgeFullScreen}
  style={[
    { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 },
    style,
  ]}
  {...props}
  >
    {children}
  </RNTrueSheet>
  )
});
TrueSheet.displayName = 'TrueSheet';

export {
  TrueSheetProps,
}

export default TrueSheet;
