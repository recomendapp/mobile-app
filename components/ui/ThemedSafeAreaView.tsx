import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface ThemedSafeAreaViewProps extends SafeAreaViewProps {
  lightColor?: string;
  darkColor?: string;
};

const ThemedSafeAreaView = forwardRef<
  React.ComponentRef<typeof SafeAreaView>,
  ThemedSafeAreaViewProps
>(({ className, ...props }, ref) => {
  return <SafeAreaView ref={ref} className={cn('bg-background', className)} {...props} />
});

export {
  ThemedSafeAreaViewProps,
  ThemedSafeAreaView,
}
