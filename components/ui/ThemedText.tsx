import { Text, type TextProps } from 'react-native';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const ThemedText = forwardRef<
  React.ComponentRef<typeof Text>,
  ThemedTextProps
>(({ className, ...props }, ref) => {
  return <Text ref={ref} className={cn('text-foreground', className)} {...props} />
});

export {
  ThemedTextProps,
  ThemedText,
}
