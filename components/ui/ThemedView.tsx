import { useThemeColor } from '@/hooks/useThemeColor';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';


interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedView = forwardRef<
  React.ComponentRef<typeof View>,
  ThemedViewProps
>(({ className, ...props }, ref) => {
  return <View ref={ref} className={cn('bg-background', className)} {...props} />
});

export {
  ThemedViewProps,
  ThemedView,
}
