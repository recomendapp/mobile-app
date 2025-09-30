import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Animated, { 
  AnimatedStyle,
  clamp, 
  interpolate, 
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
import { scheduleOnRN } from 'react-native-worklets';

interface WheelSelectorItemProps<T> extends React.ComponentProps<typeof Animated.View> {
  index: number;
  item: T;
  scrollX: SharedValue<number>;
  renderItem: (item: T, isActive: boolean) => React.ReactNode;
  itemWidth: number;
  wheelAngle: number;
  wheelIntensity: number;
  isActive: boolean;
}

const WheelSelectorItem = <T,>({
  index,
  item,
  scrollX,
  renderItem,
  itemWidth,
  wheelAngle,
  wheelIntensity,
  isActive,
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
      opacity: interpolate(scrollX.value, inputRange, opacityRange),
      transform: transformations,
    };
  }, [scrollX, index, itemWidth, wheelAngle, wheelIntensity]);

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
      
      console.log('onScroll', { scrollX: scrollX.value, newActiveIndex, activeIndex: activeIndex.value });
      if (newActiveIndex !== activeIndex.value) {
        activeIndex.value = newActiveIndex;
        console.log('newActiveIndex', newActiveIndex);
        if (enableHaptics) {
          scheduleOnRN(vibrate);
        }
        scheduleOnRN(setSelectedItem, { item: data[newActiveIndex], index: newActiveIndex });
      }
    });

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width !== containerWidth) {
        setContainerWidth(width);
      }
    }, [containerWidth]);

    const renderItem = useCallback(({ item, index }: { item: T; index: number }) => {
      console.log('[WheelSelector] current selectedItem', selectedItem?.index);
      console.log(`[WheelSelector] item: ${index}, isActive: ${selectedItem?.index === index}`);
      return (
        <Pressable
        onPress={() => {
          scrollRef.current?.scrollToIndex({
            index,
            animated: true,
          });
        }}
        >
          <WheelSelectorItem
          index={index}
          item={item}
          scrollX={scrollX}
          renderItem={renderItemProps}
          itemWidth={finalItemWidth}
          wheelAngle={wheelAngle}
          wheelIntensity={wheelIntensity}
          isActive={selectedItem?.index === index}
          />
        </Pressable>
      )
    }, [finalItemWidth, scrollX, data.length, renderItemProps, totalItemWidth, wheelAngle, wheelIntensity, selectedItem]);

    useEffect(() => {
      if (debouncedSelectedItem) {
        onSelectionChange?.(debouncedSelectedItem.item, debouncedSelectedItem.index);
      }
    }, [debouncedSelectedItem, onSelectionChange]);

    useEffect(() => {
      console.log('MOUNT WHEEL SELECTOR');
      return () => {
        console.log('UNMOUNT WHEEL SELECTOR');
      }
    }, []);

    useEffect(() => {
      console.log('SelectedItem', selectedItem?.index);
    }, [selectedItem]);

    // useEffect(() => {
    //   if (scrollRef.current) {
    //     scrollRef.current.scrollToOffset({
    //       offset: initialIndex * totalItemWidth,
    //       animated: false,
    //     });
    //   }
    // }, []);

    return (
      <Animated.View
      style={[{ width: '100%' }, containerStyle]}
      onLayout={handleLayout}
      >
        {finalItemWidth > 0 && (
          <AnimatedLegendList
          ref={scrollRef}
          data={data}
          renderItem={renderItem}
          initialScrollIndex={initialIndex}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[
            {
              flexGrow: 0,
              height: finalItemWidth * (1 + wheelIntensity)
            },
            style
          ]}
          contentContainerStyle={{
            gap: itemSpacing,
            paddingHorizontal: (containerWidth - finalItemWidth) / 2,
          }}
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