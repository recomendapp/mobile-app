import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBottomTabOverflow } from '@/components/TabBarBackground';
import { ThemedView } from './ThemedView';
import { useState } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  backgroundImage?: string;
  headerContent?: ReactElement; // Contenu superposé
  headerBackgroundColor: { dark: string; light: string };
}>;

const HeaderParallaxScrollView = ({
  children,
  backgroundImage,
  headerContent,
  headerBackgroundColor,
}: Props) => {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const [headerHeight, setHeaderHeight] = useState(0); // Hauteur dynamique

  // Mesurer la hauteur du contenu du header
  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView className="flex-1">
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        {backgroundImage ? (
          <Animated.View
            style={[
              styles.header,
              { height: headerHeight || 250 }, // Hauteur par défaut si pas de contenu
              { backgroundColor: headerBackgroundColor[colorScheme.colorScheme] },
              headerAnimatedStyle,
            ]}
          >
            {backgroundImage ? (<ImageBackground
            source={{ uri: backgroundImage }}
            style={{ width: '100%', height: '100%' }}
            /> ) : null}
          </Animated.View>
        ) : null}
        <SafeAreaView style={styles.headerOverlay} onLayout={onHeaderLayout}>
          {headerContent}
        </SafeAreaView>
        <ThemedView className="flex-1 p-8 gap-4 overflow-hidden">{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16, // Padding interne ajustable
  },
});

export default HeaderParallaxScrollView;