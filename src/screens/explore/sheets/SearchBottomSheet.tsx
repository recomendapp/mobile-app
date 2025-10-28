import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlashList,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import BlurredHandle from './components/BlurredHandle';
import BlurredBackground from './components/BlurredBackground';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { BottomSheetSearchbar } from '@/components/ui/BottomSheetSearchbar';
import { PADDING_HORIZONTAL } from '@/theme/globals';
import { ExploreTile } from '@recomendapp/types';
import { FlashList } from '@shopify/flash-list';
import tw from '@/lib/tw';
import { useQuery } from '@tanstack/react-query';
import { exploreTileOptions } from '@/api/options';
import Fuse from 'fuse.js';
import { LegendList } from '@legendapp/list';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { Button } from '@/components/ui/Button';

interface SearchBottomSheetProps {
  index: SharedValue<number>;
  position: SharedValue<number>;
  onItemPress: (item: ExploreTile['features'][number]) => void;
}

export const MIDDLE_SNAP_POINT = 300;

const SNAP_POINTS = [96, MIDDLE_SNAP_POINT, '100%'];

export const SearchBottomSheet = forwardRef<
  BottomSheetModal,
  SearchBottomSheetProps
>(({ index, position, onItemPress }, ref) => {
  // Hooks
  const headerHeight = useHeaderHeight();
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  // Queries
  const {
		data: tile,
	} = useQuery(exploreTileOptions({ exploreId: 1 }));
  const locations = useMemo(
    () => tile?.features || [],
    [tile]
  );

  // Search
  const [results, setResults] = React.useState<ExploreTile['features']>(locations.slice(0, 30));
  const fuse = useMemo(() => {
    return new Fuse(locations, {
      keys: ['properties.movie.title'],
      threshold: 0.5,
    });
  }, [locations]);
  const handleOnSearch = useCallback(
    (query: string) => {
      if (query.length === 0) {
        setResults(locations.slice(0, 30));
      } else {
        const fuseResults = fuse.search(query);
        setResults(fuseResults.map((result) => result.item).slice(0, 30));
      }
    },
    [fuse, locations]
  );

  // Styles
  const scrollViewAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: index.value,
    }),
    [index.value]
  );
  const scrollViewStyle = useMemo(
    () => [tw`flex-1`, scrollViewAnimatedStyle],
    [scrollViewAnimatedStyle]
  );
  const scrollViewContentContainer = useMemo(
    (): StyleProp<ViewStyle> => [
      { paddingBottom: bottomSafeArea },
    ],
    [bottomSafeArea]
  );

  // Render
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={true}
        pressBehavior="none"
        appearsOnIndex={2}
        disappearsOnIndex={1}
      />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: {item: ExploreTile['features'][number], index: number}) => (
      <Button onPress={() => onItemPress(item)}>
        <View style={tw`flex-row items-center border-b border-gray-200`}>
          <ImageWithFallback
          source={{ uri: item.properties.movie.poster_url || '' }}
          alt={item.properties.movie.title || ''}
          style={[tw`w-12`, { aspectRatio: 2 / 3 }]}
          />
          <Text style={tw`p-4 text-base`}>{item.properties.movie.title}</Text>
        </View>
      </Button>
    ),
    [onItemPress]
  );

  return (
    <BottomSheetModal
      ref={ref}
      key="PoiListSheet"
      name="PoiListSheet"
      index={1}
      snapPoints={SNAP_POINTS}
      topInset={headerHeight}
      enableDismissOnClose={false}
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      animatedPosition={position}
      animatedIndex={index}
      backdropComponent={renderBackdrop}
      handleComponent={BlurredHandle}
      backgroundComponent={BlurredBackground}
      >
        <BottomSheetSearchbar onSearch={handleOnSearch} containerStyle={{ marginHorizontal: PADDING_HORIZONTAL }} />
        <BottomSheetScrollView
        style={scrollViewStyle}
        contentContainerStyle={scrollViewContentContainer}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="never"
        >
          <LegendList
          data={results}
          // data={new Array(20).fill(null).map((_, i) => ({ id: i, title: `Location ${i + 1}` }))}
          keyExtractor={(item) => item.properties.id.toString()}
          renderItem={renderItem}
          // renderItem={({ item }) => (
          //   <TouchableOpacity
          //     onPress={() => {
          //     }}
          //     style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
          //   >
          //     <Text>{item.title}</Text>
          //   </TouchableOpacity>
          // )}
          />
        </BottomSheetScrollView>
    </BottomSheetModal>
  );
});