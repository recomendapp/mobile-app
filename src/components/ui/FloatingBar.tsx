import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  AnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

interface FloatingBarProps {
  children: React.ReactNode;
  initialVisible?: boolean;
  initialAnimation?: boolean;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  containerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  maxWidth?: number;
  animationDuration?: number;
  bottomOffset?: number;
  height?: SharedValue<number>; // Expose height via SharedValue
  onHeightChange?: (height: number) => void; // Optional callback for height changes
}

export interface FloatingBarRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const FloatingBar = forwardRef<FloatingBarRef, FloatingBarProps>(
  (
    {
      children,
      initialVisible = true,
      initialAnimation = true,
      style,
      containerStyle,
      maxWidth = 600,
      animationDuration = 300,
      bottomOffset,
      height,
      onHeightChange,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const shouldAnimateOnMount = initialVisible && initialAnimation;
    const isVisible = useSharedValue(initialVisible);
    const scale = useSharedValue(shouldAnimateOnMount ? 0.8 : initialVisible ? 1 : 0.8);
    const translateY = useSharedValue(shouldAnimateOnMount ? 100 : initialVisible ? 0 : 100);
    const opacity = useSharedValue(shouldAnimateOnMount ? 0 : initialVisible ? 1 : 0);

    const show = () => {
      isVisible.value = true;
      
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 150,
        mass: 0.8,
      });
      
      translateY.value = withSpring(0);
      opacity.value = withTiming(1, { duration: 200 });
    };

    const hide = () => {
      scale.value = withTiming(0.8, { duration: animationDuration });
      translateY.value = withTiming(100, { duration: animationDuration });
      opacity.value = withTiming(0, { duration: animationDuration }, () => {
        scheduleOnRN(() => {
          isVisible.value = false;
        });
      });
    };

    const toggle = () => {
      if (isVisible.value) {
        hide();
      } else {
        show();
      }
    };

    useImperativeHandle(ref, () => ({
      show,
      hide,
      toggle,
    }));

    React.useEffect(() => {
      if (shouldAnimateOnMount) {
        show();
      }
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        pointerEvents: isVisible.value ? 'auto' : 'none',
      };
    });

    const finalBottomOffset = bottomOffset !== undefined 
      ? bottomOffset 
      : insets.bottom + PADDING_VERTICAL;

    return (
      <Animated.View
        style={[
          tw`absolute bottom-0 left-0 right-0 items-center`,
          {
            paddingBottom: finalBottomOffset,
            paddingLeft: insets.left + (PADDING_HORIZONTAL / 2),
            paddingRight: insets.right + (PADDING_HORIZONTAL / 2),
          },
          containerStyle,
          animatedStyle,
        ]}
      >
        <Animated.View
          onLayout={(e) => {
            const newHeight = e.nativeEvent.layout.height;
            if (height) {
              height.value = newHeight;
            }
            onHeightChange?.(newHeight);
          }}
          style={[
            tw`rounded-2xl shadow-lg w-full`,
            {
              backgroundColor: colors.muted,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: PADDING_VERTICAL,
              paddingHorizontal: PADDING_HORIZONTAL,
              maxWidth: maxWidth,
            },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    );
  }
);

FloatingBar.displayName = 'FloatingBar';