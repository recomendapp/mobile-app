import { useTheme } from '@/providers/ThemeProvider';
import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { forwardRef } from 'react';

interface ThemedTrueSheetProps extends TrueSheetProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedTrueSheet = forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  ThemedTrueSheetProps
>(({ backgroundColor, contentContainerStyle, cornerRadius = 24, sizes = ["auto"], ...props }, ref) => {
  const { colors, inset } = useTheme();
  return (
  <TrueSheet
  ref={ref}
  sizes={sizes}
  cornerRadius={cornerRadius}
  backgroundColor={backgroundColor ?? colors.muted}
  contentContainerStyle={[
    {
      paddingTop: 16,
      paddingBottom: inset.bottom,
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
