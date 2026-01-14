import React, { useEffect, useState } from 'react';
import { FlatList, FlatListProps, ListRenderItem, ViewStyle } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withTiming, useDerivedValue } from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider';
import { View } from './view';
import tw from '@/lib/tw';
import { PADDING, PADDING_VERTICAL } from '@/theme/globals';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';

type InheritedFlatListProps<T> = Omit<
  FlatListProps<T>,
  'data' | 'renderItem' | 'keyExtractor' | 'style' | 'ItemSeparatorComponent' | 'horizontal'
>;

interface SelectionFooterProps<T> extends InheritedFlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  visibleHeight?: SharedValue<number>;
  animationDuration?: number;
  onHeightChange?: (height: number) => void;
  containerStyle?: ViewStyle | ViewStyle[];
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  keyboardAware?: boolean;
  bottomOffset?: number;
};

export const SelectionFooter = <T extends any>({
  data,
  visibleHeight: externalVisibleHeight,
  renderItem,
  keyExtractor,
  containerStyle,
  contentContainerStyle,
  animationDuration = 250,
  onHeightChange,
  ItemSeparatorComponent = () => <View style={{ width: 4 }} />,
  keyboardAware = true,
  bottomOffset = 0,
  children,
  ...props
}: SelectionFooterProps<T>) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const isVisible = data.length > 0;
  const isGlassAvailable = isLiquidGlassAvailable();

  const actualHeight = useSharedValue(0);

  const internalVisibleHeight = useSharedValue(0);
  const visibleHeight = externalVisibleHeight || internalVisibleHeight;

  const [internalData, setInternalData] = useState(data);

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  useDerivedValue(() => {
    visibleHeight.value = isVisible ? actualHeight.value : 0;
  });

  const animatedVisibilityStyle = useAnimatedStyle(() => {
    const isKeyboardVisible = keyboardHeight.value !== 0;
    const targetPaddingBottom = isKeyboardVisible
      ? PADDING_VERTICAL
      : insets.bottom + PADDING_VERTICAL + bottomOffset;

    return {
      opacity: withTiming(isVisible ? 1 : 0, { duration: animationDuration }),
      transform: [
        {
          // valeur FIXE → plus de dérive
          translateY: withTiming(isVisible ? 0 : 40, { duration: animationDuration }),
        },
      ],
      paddingBottom: withTiming(targetPaddingBottom, { duration: 150 }),
    };
  });

  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: keyboardAware ? keyboardHeight.value : 0 },
    ],
  }));

  useEffect(() => {
    if (data.length > 0) setInternalData(data);
  }, [data]);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setInternalData([]), animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationDuration]);

  return (
    <Animated.View
      style={[
        tw`relative absolute bottom-0 left-0 right-0`,
        animatedKeyboardStyle,
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <Animated.View
        onLayout={(e) => {
          actualHeight.value = e.nativeEvent.layout.height;
          onHeightChange?.(e.nativeEvent.layout.height);
        }}
        style={[
          tw`border-t gap-2`,
          { backgroundColor: isGlassAvailable ? 'transparent' : colors.background, borderColor: colors.border },
          { paddingBottom: insets.bottom + PADDING_VERTICAL + bottomOffset, paddingTop: PADDING_VERTICAL },
          containerStyle,
          animatedVisibilityStyle,
        ]}
      >
        {isGlassAvailable && (
          <BlurView style={tw`absolute inset-0`} />
        )}

        <FlatList<T>
          horizontal
          data={internalData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparatorComponent}
          contentContainerStyle={[
            { paddingLeft: insets.left + PADDING, paddingRight: insets.right + PADDING },
            contentContainerStyle,
          ]}
          {...props}
        />

        <View style={{ paddingLeft: insets.left + PADDING, paddingRight: insets.right + PADDING }}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
};
