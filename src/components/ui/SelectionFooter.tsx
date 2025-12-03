import React, { useEffect, useState } from 'react';
import { FlatList, FlatListProps, ListRenderItem, ViewStyle } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider'; // Pour le style
import { View } from './view';
import tw from '@/lib/tw';
import { PADDING, PADDING_VERTICAL } from '@/theme/globals';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type InheritedFlatListProps<T> = Omit<
  FlatListProps<T>,
  'data' | 'renderItem' | 'keyExtractor' | 'style' | 'ItemSeparatorComponent' | 'horizontal'
>;

interface SelectionFooterProps<T> extends InheritedFlatListProps<T> {
    data: T[];
    renderItem: ListRenderItem<T>;
    keyExtractor: (item: T) => string;
    height?: SharedValue<number>;
    animationDuration?: number;
    onHeightChange?: (height: number) => void;
    containerStyle?: ViewStyle | ViewStyle[];
    ItemSeparatorComponent?: React.ComponentType<any> | null;
    keyboardAware?: boolean;
};

export const SelectionFooter = <T extends any>({
  data,
  height: externalHeight,
  renderItem,
  keyExtractor,
	containerStyle,
	animationDuration = 250,
	onHeightChange,
	ItemSeparatorComponent = () => <View style={{ width: 4 }} />,
  keyboardAware = true,
  children,
	...props
}: SelectionFooterProps<T>) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const isVisible = data.length > 0;
  const internalHeight = useSharedValue(0);
  const height = externalHeight || internalHeight;

  const [internalData, setInternalData] = useState(data);

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const animatedVisibilityStyle = useAnimatedStyle(() => {
    const isKeyboardVisible = keyboardHeight.value !== 0;
    const targetPaddingBottom = isKeyboardVisible 
        ? PADDING_VERTICAL 
        : insets.bottom + PADDING_VERTICAL;
    return {
      opacity: withTiming(isVisible ? 1 : 0, { duration: animationDuration }),
      transform: [
        {
          translateY: withTiming(isVisible ? 0 : height.value, { duration: animationDuration }),
        },
      ],
      paddingBottom: withTiming(targetPaddingBottom, { duration: 150 }), // On peut utiliser une durée plus courte pour un effet réactif
    };
  });

  const animatedKeyboardStyle = useAnimatedStyle(() => {
    return {
      pointerEvents: isVisible ? 'auto' : 'none',
      transform: [
        { translateY: keyboardAware ? keyboardHeight.value : 0 },
      ],
    };
  });

  useEffect(() => {
    if (data.length > 0) {
      setInternalData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        setInternalData([]);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationDuration]);
  
  return (
    <Animated.View style={[tw`absolute bottom-0 left-0 right-0`, animatedKeyboardStyle]}>
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
          onHeightChange?.(e.nativeEvent.layout.height);
        }}
        style={[
          tw`border-t gap-2`,
          { backgroundColor: colors.background, borderColor: colors.border },
          { paddingBottom: insets.bottom + PADDING_VERTICAL, paddingLeft: insets.left + PADDING, paddingRight: insets.right + PADDING, paddingTop: PADDING_VERTICAL },
          containerStyle,
          animatedVisibilityStyle
        ]}
      >
        <FlatList<T>
          horizontal
          data={internalData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparatorComponent}
          {...props}
        />
        {children}
      </Animated.View>
    </Animated.View>
  );
};