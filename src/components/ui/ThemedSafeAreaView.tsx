import { useTheme } from '@/providers/ThemeProvider';
import { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface ThemedSafeAreaViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedSafeAreaView = forwardRef<
  React.ComponentRef<typeof View>,
  ThemedSafeAreaViewProps
>(({ style, ...props }, ref) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
  <View
  ref={ref}
  style={[
    {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
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
