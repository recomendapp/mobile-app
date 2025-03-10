import * as React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '~/lib/utils';

const duration = 1000;

function Skeleton({
  className,
  style,
  ...props
}: React.ComponentPropsWithoutRef<typeof Animated.View>) {
  const sv = useSharedValue(1);

  React.useEffect(() => {
    sv.value = withRepeat(
      withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
      -1
    );
  }, []);

  const styleDefault = useAnimatedStyle(() => ({
    opacity: sv.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        styleDefault,
      ]}
      className={cn('rounded-md bg-secondary dark:bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
