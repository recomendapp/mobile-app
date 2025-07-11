import { useTheme } from '@/providers/ThemeProvider';
import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedView = forwardRef<
  React.ComponentRef<typeof View>,
  ThemedViewProps
>(({ style, ...props }, ref) => {
  const { colors } = useTheme();
  return (
  <View
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
  ThemedViewProps,
  ThemedView,
}
