import { cn } from '@/lib/utils';
import { SafeAreaView } from 'react-native';
import { SafeAreaViewProps } from 'react-native-safe-area-context';
import { ThemedView } from './ThemedView';


export type ThemedSafeAreaViewProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSafeAreaView({ className, ...props }: ThemedSafeAreaViewProps) {
  return <SafeAreaView className={cn('bg-background', className)} {...props} />;
}
