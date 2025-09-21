import { useTheme } from '@/providers/ThemeProvider';
import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { forwardRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemedTrueSheetProps extends TrueSheetProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedTrueSheet = forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  ThemedTrueSheetProps
>(({ backgroundColor, contentContainerStyle, cornerRadius = 24, sizes = ["auto"], ...props }, ref) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
  <TrueSheet
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
  {...props}
  />
  )
});

export {
  ThemedTrueSheetProps,
}

export default ThemedTrueSheet;
