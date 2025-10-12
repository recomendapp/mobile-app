import React, { ReactNode, useRef } from 'react';
import { StyleSheet, I18nManager } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Swipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

interface ActionConfig {
  icon?: ReactNode;
  backgroundColor?: string;
  onPress?: () => void;
  threshold?: number;
}

interface LeftActionProps {
  dragX: SharedValue<number>;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
  config?: ActionConfig;
}

const LeftAction = ({ dragX, swipeableRef, config }: LeftActionProps) => {
  const { icon, backgroundColor = '#388e3c', onPress } = config || {};
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(dragX.value, [0, config?.threshold || 80], [0, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const handlePress = () => {
    swipeableRef.current?.close();
    onPress?.();
  };

  return (
    <RectButton
      style={[styles.leftAction, { backgroundColor }]}
      onPress={handlePress}>
      <Animated.View style={[styles.actionIcon, animatedStyle]}>
        {icon}
      </Animated.View>
    </RectButton>
  );
};

interface RightActionProps {
  dragX: SharedValue<number>;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
  config?: ActionConfig;
}

const RightAction = ({ dragX, swipeableRef, config }: RightActionProps) => {
  const { icon, backgroundColor = '#dd2c00', onPress } = config || {};
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(dragX.value, [-(config?.threshold || 40), 0], [1, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const handlePress = () => {
    swipeableRef.current?.close();
    onPress?.();
  };

  return (
    <RectButton
      style={[styles.rightAction, { backgroundColor }]}
      onPress={handlePress}>
      <Animated.View style={[styles.actionIcon, animatedStyle]}>
        {icon}
      </Animated.View>
    </RectButton>
  );
};

const renderLeftActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>,
  config?: ActionConfig
) => config ? <LeftAction dragX={progress} swipeableRef={swipeableRef} config={config} /> : null;

const renderRightActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>,
  config?: ActionConfig
) => config ? <RightAction dragX={progress} swipeableRef={swipeableRef} config={config} /> : null;

interface ReusableSwipeableRowProps extends React.ComponentProps<typeof Swipeable> {
  children?: ReactNode;
  leftAction?: ActionConfig;
  rightAction?: ActionConfig;
  friction?: number;
  enableTrackpadTwoFingerGesture?: boolean;
}

export default function ReusableSwipeableRow({
  children,
  leftAction,
  rightAction,
  friction = 2,
  enableTrackpadTwoFingerGesture = true,
  ...props
}: ReusableSwipeableRowProps) {
  const swipeableRow = useRef<SwipeableMethods>(null);

  return (
    <Swipeable
    ref={swipeableRow}
    friction={friction}
    leftThreshold={leftAction?.threshold || 80}
    enableTrackpadTwoFingerGesture={enableTrackpadTwoFingerGesture}
    rightThreshold={rightAction?.threshold || 40}
    renderLeftActions={leftAction ? (_, progress) =>
      renderLeftActions(_, progress, swipeableRow, leftAction)
    : undefined}
    renderRightActions={rightAction ? (_, progress) =>
      renderRightActions(_, progress, swipeableRow, rightAction)
    : undefined}
    {...props}  
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
});