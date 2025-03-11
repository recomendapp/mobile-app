import { useTheme } from '@/context/ThemeProvider';
import * as React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const duration = 1000;

function Skeleton({
  className,
  style,
  ...props
}: React.ComponentPropsWithoutRef<typeof Animated.View>) {
  const { colors } = useTheme();
  const sv = useSharedValue(1);

  React.useEffect(() => {
    sv.value = withRepeat(
      withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
      -1
    );
  }, []);

  const styleDefault = useAnimatedStyle(() => ({
    opacity: sv.value,
    borderRadius: 6,
    backgroundColor: colors.muted,
  }));

  return (
    <Animated.View
      style={[
        styleDefault,
        style,
      ]}
      {...props}
    />
  );
}

export { Skeleton };
