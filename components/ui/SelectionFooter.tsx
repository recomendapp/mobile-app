import React, { useCallback, useEffect } from 'react';
import { FlatList, FlatListProps, ListRenderItem, StyleSheet, ViewStyle } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider'; // Pour le style
import { View } from './view';
import tw from '@/lib/tw';
import { PADDING, PADDING_VERTICAL } from '@/theme/globals';

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
};

export const SelectionFooter = <T extends {}>({
    data,
    height = useSharedValue(0),
    renderItem,
    keyExtractor,
    contentContainerStyle,
	containerStyle,
	animationDuration = 250,
	onHeightChange,
	ItemSeparatorComponent = () => <View style={{ width: 4 }} />,
	...props
}: SelectionFooterProps<T>) => {
  const { colors, inset } = useTheme();
  const isVisible = data.length > 0;

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
    //   height: withTiming(isVisible ? height.value : 0, { duration: animationDuration }),
      opacity: withTiming(isVisible ? 1 : 0, { duration: animationDuration }),
      transform: [
        {
          translateY: withTiming(isVisible ? 0 : 50, { duration: animationDuration }),
        },
      ],
    };
  });
  
  return (
    <Animated.View
	onLayout={(e) => {
		height.value = e.nativeEvent.layout.height;
		onHeightChange?.(e.nativeEvent.layout.height);
	}}
	style={[
		tw`absolute bottom-0 left-0 right-0 border-t`,
		{ backgroundColor: colors.background, borderColor: colors.border }, 
		containerStyle,
		animatedContainerStyle
	]}
	>
		<FlatList<T>
		horizontal
		data={data}
		renderItem={renderItem}
		keyExtractor={keyExtractor}
		showsHorizontalScrollIndicator={false}
		contentContainerStyle={[
			{ paddingBottom: inset.bottom + PADDING_VERTICAL, paddingLeft: inset.left + PADDING, paddingRight: inset.right + PADDING, paddingTop: PADDING_VERTICAL  },
			contentContainerStyle
		]}
		ItemSeparatorComponent={ItemSeparatorComponent}
		{...props}
		/>
    </Animated.View>
  );
};