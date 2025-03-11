import { useTheme } from '@/context/ThemeProvider';
import { forwardRef } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface ThemedSafeAreaViewProps extends SafeAreaViewProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedSafeAreaView = forwardRef<
  React.ComponentRef<typeof SafeAreaView>,
  ThemedSafeAreaViewProps
>(({ style, ...props }, ref) => {
  const { colors } = useTheme();
  return (
  <SafeAreaView
  ref={ref}
  style={[
    { backgroundColor: colors.background },
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
