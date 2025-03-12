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

interface SkeletonProps
  extends React.ComponentPropsWithoutRef<typeof Animated.View> {
    borderRadius?: number;
  }

const Skeleton = React.forwardRef<
  React.ElementRef<typeof Animated.View>,
  SkeletonProps
>(({ style, borderRadius = 6, ...props }, ref) => {
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
    borderRadius: borderRadius,
    backgroundColor: colors.muted,
    
  }));

  return (
    <Animated.View
    ref={ref}
    style={[
      styleDefault,
      style,
    ]}
    {...props}
    />
  );
});

export { Skeleton };
