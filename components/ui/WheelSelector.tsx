import React from 'react';
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
import { StyleProp, ViewStyle } from 'react-native';

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
    renderItem,
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
    const scrollRef = React.useRef<LegendListRef>(null);
    const scrollX = useSharedValue(initialIndex);
    const activeIndex = useSharedValue(initialIndex);
    const [containerWidth, setContainerWidth] = React.useState(0);

    const finalItemWidth = itemWidth || (containerWidth * 0.2);
    const TOTAL_ITEM_SIZE = finalItemWidth + itemSpacing;

    const vibrate = () => {
      if (enableHaptics && process.env.EXPO_OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const onScroll = useAnimatedScrollHandler(e => {
      'worklet';
      scrollX.value = clamp(e.contentOffset.x / TOTAL_ITEM_SIZE, 0, data.length - 1);
      const newActiveIndex = Math.round(scrollX.value);
      
      if (newActiveIndex !== activeIndex.value) {
        activeIndex.value = newActiveIndex;
        if (enableHaptics) {
          runOnJS(vibrate)();
        }
        if (onSelectionChange) {
          runOnJS(onSelectionChange)(data[newActiveIndex], newActiveIndex);
        }
      }
    });

    // Expose methods to parent via ref
    React.useImperativeHandle(ref, () => ({
      scrollToIndex: (index: number, animated = true) => {
        scrollRef.current?.scrollToOffset({
          offset: index * TOTAL_ITEM_SIZE,
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
    }), [scrollX, TOTAL_ITEM_SIZE]);

    // Initialize scroll position
    React.useEffect(() => {
      if (scrollRef.current && initialIndex > 0 && finalItemWidth > 0) {
        setTimeout(() => {
          scrollRef.current?.scrollToOffset({
            offset: initialIndex * TOTAL_ITEM_SIZE,
            animated: false,
          });
        }, 100);
      }
    }, [initialIndex, TOTAL_ITEM_SIZE, finalItemWidth]);

    return (
      <Animated.View
        style={[{ width: '100%' }, containerStyle]}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setContainerWidth(width);
        }}
      >
        {finalItemWidth > 0 && (
          <AnimatedLegendList<T>
            ref={scrollRef}
            data={data}
            renderItem={({ item, index }) => (
              <Pressable
                key={index}
                onPress={() => {
                  scrollRef.current?.scrollToOffset({
                    offset: index * TOTAL_ITEM_SIZE,
                    animated: true,
                  });
                }}
              >
                <WheelSelectorItem
                index={index}
                totalItems={data.length}
                item={item}
                scrollX={scrollX}
                renderItem={renderItem}
                itemWidth={finalItemWidth}
                wheelAngle={wheelAngle}
                wheelIntensity={wheelIntensity}
                />
              </Pressable>
            )}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              {
                flexGrow: 0,
                height: finalItemWidth * (1 + wheelIntensity)
              },
              style
            ]}
            contentContainerStyle={[
              {
                gap: itemSpacing,
                paddingHorizontal: (containerWidth - finalItemWidth) / 2,
              },
              contentContainerStyle,
            ]}
            onScroll={onScroll}
            scrollEventThrottle={1000 / 60} // ~16ms
            snapToInterval={TOTAL_ITEM_SIZE}
			      {...props}
          />
        )}
      </Animated.View>
    );
  }

const WheelSelector = React.forwardRef(WheelSelectorInner) as <T>(
  props: WheelSelectorProps<T> & { ref?: React.Ref<WheelSelectorRef> }
) => React.ReactElement;

export default WheelSelector;