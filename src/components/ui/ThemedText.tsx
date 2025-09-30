import { Text, type TextProps } from 'react-native';
import { forwardRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const ThemedText = forwardRef<
  React.ComponentRef<typeof Text>,
  ThemedTextProps
>(({ style, ...props }, ref) => {
  const { colors } = useTheme();
  return (
  <Text
  ref={ref}
  style={[
    { color: colors.foreground },
    style,
  ]}
  {...props}
  />
  );
});

export {
  ThemedTextProps,
  ThemedText,
}
