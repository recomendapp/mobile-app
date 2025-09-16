import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Animated, { 
  AnimatedStyle,
  clamp, 
  interpolate, 
  runOnJS, 
  SharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue 
} from 'react-native-reanimated';
import { Pressable } from 'react-native-gesture-handler';
import tw from '@/lib/tw';
import * as Haptics from 'expo-haptics';
import { GAP } from '@/theme/globals';
import { AnimatedLegendList, AnimatedLegendListProps } from '@legendapp/list/reanimated';
import { LegendListRef } from '@legendapp/list';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import useDebounce from '@/hooks/useDebounce';

interface WheelSelectorItemProps<T> extends React.ComponentProps<typeof Animated.View> {
  index: number;
  totalItems: number;
  item: T;
  scrollX: SharedValue<number>;
  renderItem: (item: T, isActive: boolean) => React.ReactNode;
  itemWidth: number;
  wheelAngle: number;
  wheelIntensity: number;
}

const WheelSelectorItem = <T,>({
  index,
  totalItems,
  item,
  scrollX,
  renderItem,
  itemWidth,
  wheelAngle,
  wheelIntensity,
  ...props
}: WheelSelectorItemProps<T>) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];
    const opacityRange = [0.65, 1, 0.65];
    
    // Calcul de l'effet wheel
    let transformations: any[] = [];
    
    if (wheelIntensity > 0) {
      // Calcul de la translation Y (effet de courbe)
      const translateYOffset = (itemWidth / 3) * wheelIntensity;
      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [translateYOffset, 0, translateYOffset],
      );
      
      // Calcul de la rotation basée sur l'angle
      const maxRotation = wheelAngle * wheelIntensity;
      const rotateZ = interpolate(
        scrollX.value,
        inputRange,
        [-maxRotation, 0, maxRotation],
      );
      
      transformations.push({ translateY });
      
      if (wheelAngle !== 0) {
        transformations.push({ rotateZ: `${rotateZ}deg` });
      }
    }
    
    return {
    //   opacity: interpolate(scrollX.value, inputRange, opacityRange),
      transform: transformations,
    };
  }, [scrollX, index, itemWidth, wheelAngle, wheelIntensity]);

  const isActive = Math.round(scrollX.value) === index;

  return (
    <Animated.View
      style={[
        tw`relative rounded-full items-center justify-center`,
        { width: itemWidth, height: itemWidth },
        animatedStyle
      ]}
      {...props}
    >
      {renderItem(item, isActive)}
    </Animated.View>
  );
};

export interface WheelSelectorRef {
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToOffset: (offset: number, animated?: boolean) => void;
  getCurrentIndex: () => number;
}

interface WheelSelectorProps<T> extends Omit<AnimatedLegendListProps<T>, 'data' | 'renderItem'> {
  data: readonly T[];
  renderItem: (item: T, isActive: boolean) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onSelectionChange?: (item: T, index: number) => void;
  initialIndex?: number;
  enableHaptics?: boolean;
  itemWidth?: number;
  itemSpacing?: number;
  wheelAngle?: number;
  wheelIntensity?: number;
  containerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

function WheelSelectorInner<T>({
    data,
    renderItem: renderItemProps,
    onSelectionChange,
    initialIndex = 0,
    enableHaptics = true,
    itemWidth,
    itemSpacing = GAP,
    wheelAngle = 0,
    wheelIntensity = 0,
    style,
    contentContainerStyle,
    containerStyle,
	...props
  }: WheelSelectorProps<T>, ref: React.ForwardedRef<WheelSelectorRef>) {
    const scrollRef = useRef<LegendListRef>(null);
    const scrollX = useSharedValue(0);
    const activeIndex = useSharedValue(initialIndex);
    const [selectedItem, setSelectedItem] = useState<{ item: T; index: number } | null>(data[initialIndex] ? { item: data[initialIndex], index: initialIndex } : null);
    const debouncedSelectedItem = useDebounce(selectedItem, 200);
    const [containerWidth, setContainerWidth] = useState(0);

     const finalItemWidth = useMemo(() => {
      return itemWidth || (containerWidth > 0 ? containerWidth * 0.2 : 80); // fallback width
    }, [itemWidth, containerWidth]);

    const totalItemWidth = useMemo(() => finalItemWidth + itemSpacing, [finalItemWidth, itemSpacing]);

    useImperativeHandle(ref, () => ({
      scrollToIndex: (index: number, animated = true) => {
        scrollRef.current?.scrollToOffset({
          offset: index * totalItemWidth,
          animated,
        });
      },
      scrollToOffset: (offset: number, animated = true) => {
        scrollRef.current?.scrollToOffset({
          offset,
          animated,
        });
      },
      getCurrentIndex: () => {
        return Math.round(scrollX.value);
      },
    }), [scrollX, totalItemWidth]);


    const vibrate = useCallback(() => {
      if (enableHaptics && process.env.EXPO_OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, [enableHaptics]);

    const onScroll = useAnimatedScrollHandler(e => {
      'worklet';
      scrollX.value = clamp(e.contentOffset.x / totalItemWidth, 0, data.length - 1);
      const newActiveIndex = Math.round(scrollX.value);
      
      if (newActiveIndex !== activeIndex.value) {
        activeIndex.value = newActiveIndex;
        if (enableHaptics) {
          runOnJS(vibrate)();
        }
        runOnJS(setSelectedItem)({ item: data[newActiveIndex], index: newActiveIndex });
      }
    });

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width !== containerWidth) {
        setContainerWidth(width);
      }
    }, [containerWidth]);

    const renderItem = useCallback(({ item, index }: { item: T; index: number }) => {
      return (
        <Pressable
        key={index}
        onPress={() => {
          scrollRef.current?.scrollToOffset({
            offset: index * totalItemWidth,
            animated: true,
          });
        }}
        >
          <WheelSelectorItem
          index={index}
          totalItems={data.length}
          item={item}
          scrollX={scrollX}
          renderItem={renderItemProps}
          itemWidth={finalItemWidth}
          wheelAngle={wheelAngle}
          wheelIntensity={wheelIntensity}
          />
        </Pressable>
      )
    }, [finalItemWidth, scrollX, data.length, renderItemProps, totalItemWidth, wheelAngle, wheelIntensity]);

    const listStyle = useMemo(() => {
      return [
        {
          flexGrow: 0,
          height: finalItemWidth * (1 + wheelIntensity)
        },
        style
      ];
    }, [finalItemWidth, wheelIntensity, style]);

    const listContentContainerStyle = useMemo(() => {
      return {
        gap: itemSpacing,
        paddingHorizontal: (containerWidth - finalItemWidth) / 2,
      };
    }, [containerWidth, finalItemWidth, itemSpacing]);

    const initialScrollIndex = useMemo(() => {
      if (initialIndex > 0) {
        return {
          index: initialIndex,
          viewOffset: -((containerWidth - finalItemWidth) / 2),
          viewPosition: 0
        };
      }
      return undefined;
    }, [initialIndex, containerWidth, finalItemWidth]);

    useEffect(() => {
      if (debouncedSelectedItem) {
        onSelectionChange?.(debouncedSelectedItem.item, debouncedSelectedItem.index);
      }
    }, [debouncedSelectedItem, onSelectionChange]);

    return (
      <Animated.View
      style={[{ width: '100%' }, containerStyle]}
      onLayout={handleLayout}
      >
        {finalItemWidth > 0 && (
          <AnimatedLegendList<T>
            ref={scrollRef}
            data={data}
            renderItem={renderItem}
            initialScrollIndex={initialScrollIndex}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={listStyle}
            contentContainerStyle={listContentContainerStyle}
            onScroll={onScroll}
            scrollEventThrottle={1000 / 60} // ~16ms
            snapToInterval={totalItemWidth}
			      {...props}
          />
        )}
      </Animated.View>
    );
  }

const WheelSelector = forwardRef(WheelSelectorInner) as <T>(
  props: WheelSelectorProps<T> & { ref?: React.Ref<WheelSelectorRef> }
) => React.ReactElement;

export default WheelSelector;