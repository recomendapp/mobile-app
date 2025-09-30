import React, { ReactNode, useRef } from 'react';
import { StyleSheet, Text, View, I18nManager } from 'react-native';
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
  label: string | ReactNode;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
}

interface LeftActionsProps {
  dragX: SharedValue<number>;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
  config?: ActionConfig;
}

const LeftAction = ({ dragX, swipeableRef, config }: LeftActionsProps) => {
  const { label, backgroundColor = '#497AFC', textColor = 'white', onPress } = config || {};
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          dragX.value,
          [0, 50, 100, 101],
          [-20, 0, 0, 1],
          Extrapolation.CLAMP
        ),
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
      onPress={handlePress}
    >
      {typeof label === 'string' ? (
        <Animated.Text style={[styles.archiveText, { color: textColor }, animatedStyle]}>
          {label}
        </Animated.Text>
      ) : (
        <Animated.View style={[styles.actionIcon, animatedStyle]}>
          {label}
        </Animated.View>
      )}
    </RectButton>
  );
};

const renderLeftActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>,
  config?: ActionConfig
) => config ? <LeftAction dragX={progress} swipeableRef={swipeableRef} config={config} /> : null;

interface RightActionProps {
  config: ActionConfig;
  x: number;
  progress: SharedValue<number>;
  totalWidth: number;
  swipeableRef: React.RefObject<SwipeableMethods | null>;
}

const RightAction = ({
  config,
  x,
  progress,
  totalWidth,
  swipeableRef,
}: RightActionProps) => {
  const { label, backgroundColor, textColor = 'white', onPress } = config;
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, -totalWidth], [x, 0]),
      },
    ],
  }));

  const pressHandler = () => {
    swipeableRef.current?.close();
    onPress?.();
  };

  return (
    <Animated.View style={[styles.rightActionView, animatedStyle]}>
      <RectButton
        style={[styles.rightAction, { backgroundColor }]}
        onPress={pressHandler}>
        {typeof label === 'string' ? (
          <Text style={[styles.actionText, { color: textColor }]}>{label}</Text>
        ) : (
          label
        )}
      </RectButton>
    </Animated.View>
  );
};

const renderRightActions = (
  _: any,
  progress: SharedValue<number>,
  swipeableRef: React.RefObject<SwipeableMethods | null>,
  rightActions?: ActionConfig[]
) => {
  if (!rightActions || rightActions.length === 0) return null;

  const actionWidth = 64;
  const totalWidth = rightActions.length * actionWidth;

  return (
    <View style={[styles.rightActionsView, { width: totalWidth }]}>
      {rightActions.map((actionConfig, index) => (
        <RightAction
          key={index}
          config={actionConfig}
          x={totalWidth - (index + 1) * actionWidth}
          progress={progress}
          totalWidth={totalWidth}
          swipeableRef={swipeableRef}
        />
      ))}
    </View>
  );
};

interface ReusableAppleStyleSwipeableRowProps extends React.ComponentProps<typeof Swipeable> {
  children?: ReactNode;
  leftAction?: ActionConfig;
  rightActions?: ActionConfig[];
  friction?: number;
  enableTrackpadTwoFingerGesture?: boolean;
  leftThreshold?: number;
  rightThreshold?: number;
}

export default function ReusableAppleStyleSwipeableRow({
  children,
  leftAction,
  rightActions,
  friction = 2,
  enableTrackpadTwoFingerGesture = true,
  leftThreshold = 30,
  rightThreshold = 40,
  ...props
}: ReusableAppleStyleSwipeableRowProps) {
  const swipeableRow = useRef<SwipeableMethods>(null);

  return (
    <Swipeable
      ref={swipeableRow}
      friction={friction}
      enableTrackpadTwoFingerGesture={enableTrackpadTwoFingerGesture}
      leftThreshold={leftThreshold}
      rightThreshold={rightThreshold}
      renderLeftActions={leftAction ? (_, progress) =>
        renderLeftActions(_, progress, swipeableRow, leftAction)
      : undefined}
      renderRightActions={rightActions ? (_, progress) =>
        renderRightActions(_, progress, swipeableRow, rightActions)
      : undefined}
      {...props}>
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    justifyContent: 'center',
  },
  archiveText: {
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 20,
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
    margin: 'auto',
  },
  rightActionView: {
    flex: 1,
  },
  rightActionsView: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});