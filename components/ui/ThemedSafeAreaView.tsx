import { useTheme } from '@/providers/ThemeProvider';
import { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';
// import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface ThemedSafeAreaViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedSafeAreaView = forwardRef<
  React.ComponentRef<typeof View>,
  ThemedSafeAreaViewProps
>(({ style, ...props }, ref) => {
  const { colors, inset } = useTheme();
  return (
  <View
  ref={ref}
  style={[
    {
      paddingTop: inset.top,
      paddingBottom: inset.bottom,
      paddingLeft: inset.left,
      paddingRight: inset.right,
      backgroundColor: colors.background,
    },
    style,
  ]}
  {...props}
  />
  )
});

export {
  ThemedSafeAreaViewProps,
  ThemedSafeAreaView,
}
