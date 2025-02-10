import { useThemeColor } from '@/hooks/useThemeColor';
import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ className, ...props }: ThemedViewProps) {
  return <View className={cn('bg-background', className)} {...props} />;
}
