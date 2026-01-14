import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheetScrollableCreator,
} from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { BottomSheetSearchbar } from '@/components/ui/BottomSheetSearchbar';
import { GAP, PADDING_HORIZONTAL } from '@/theme/globals';
import { ExploreTile } from '@recomendapp/types';
import tw from '@/lib/tw';
import Fuse from 'fuse.js';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { LegendList } from '@legendapp/list';
import { useExploreStore } from '@/stores/useExploreStore';
import { Icons } from '@/constants/Icons';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';
import { useExploreTileQuery } from '@/api/explore/exploreQueries';

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
  const t = useTranslations();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const filters = useExploreStore((state) => state.filters);

  // States
  const [isLoading, setIsLoading] = useState(true);

  // Queries
  const {
		data: tile,
	} = useExploreTileQuery({ exploreId: 1 });
  const locations = useMemo(
    () => tile?.features || [],
    [tile]
  );

  // Search
  const [results, setResults] = useState<ExploreTile['features'] | undefined>(undefined);
  const fuse = useMemo(() => {
    return new Fuse(locations, {
      keys: ['properties.movie.title'],
      threshold: 0.5,
    });
  }, [locations]);
  const applyFilters = useCallback((items: ExploreTile['features']) => {
    return items.filter((f) => {
      const movie = f.properties.movie;

      if (filters.runtime.min != null && movie.runtime! < filters.runtime.min) return false;
      if (filters.runtime.max != null && movie.runtime! > filters.runtime.max) return false;

      const year = new Date(movie.release_date!).getFullYear();
      if (filters.releaseDate.min != null && year < filters.releaseDate.min) return false;
      if (filters.releaseDate.max != null && year > filters.releaseDate.max) return false;

      if (filters.genres.selected.length > 0) {
        const movieGenres = movie.genres_ids || [];
        const selected = filters.genres.selected;
        const matchAll = filters.genres.match === 'all';

        if (matchAll) {
          const hasAll = selected.every((id) => movieGenres.includes(id));
          if (!hasAll) return false;
        } else {
          const hasAny = selected.some((id) => movieGenres.includes(id));
          if (!hasAny) return false;
        }
      }

      return true;
    });
  }, [filters]);
  const handleOnSearch = (query: string) => {
    setIsLoading(true);
    if (query) {
      const fuseResults = fuse.search(query).map((r) => r.item);
      setResults(applyFilters(fuseResults));
    } else {
      setResults(applyFilters(locations));
    }
    setIsLoading(false);
  };

  const init = useCallback(() => {
    setResults(applyFilters(locations));
    setIsLoading(false);
  }, [locations, applyFilters]);

  // Styles
  const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
    opacity: index.value,
  }), [index.value]);

  const BottomSheetLegendListScrollable = useBottomSheetScrollableCreator();

  useEffect(() => {
    init();
  }, [init]);

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
    backdropComponent={(props) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={true}
        pressBehavior="none"
        appearsOnIndex={2}
        disappearsOnIndex={1}
      />
    )}
    handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
    backgroundStyle={{ backgroundColor: colors.muted }}
    >
      <BottomSheetSearchbar onSearch={handleOnSearch} containerStyle={{ marginHorizontal: PADDING_HORIZONTAL, marginBottom: GAP, backgroundColor: colors.background }} />
      <LegendList
      data={results || []}
      renderItem={({ item }) => (
        <Button variant='ghost' size='fit' onPress={() => onItemPress(item)}>
          <View style={tw`w-full flex-row items-center`}>
            <ImageWithFallback
            source={{ uri: item.properties.movie.poster_url || '' }}
            alt={item.properties.movie.title || ''}
            style={[tw`w-12`, { aspectRatio: 2 / 3 }]}
            />
            <Text style={tw`p-4 text-base`}>{item.properties.movie.title}</Text>
          </View>
        </Button>
      )}
      keyExtractor={(item) => item.properties.id.toString()}
      ListEmptyComponent={
        (isLoading || !results) ? <Icons.Loader />
        : (
          <View style={tw`flex-1 items-center justify-center p-4`}>
            <Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
              {upperFirst(t('common.messages.no_results'))}
            </Text>
          </View>
        )
      }
      scrollIndicatorInsets={{
        bottom: bottomSafeArea,
      }}
      contentContainerStyle={{
        paddingBottom: bottomSafeArea,
        paddingHorizontal: PADDING_HORIZONTAL,
        gap: GAP,
      }}
      style={[tw`flex-1`, scrollViewAnimatedStyle]}
      renderScrollComponent={BottomSheetLegendListScrollable}
      />
    </BottomSheetModal>
  );
});
SearchBottomSheet.displayName = 'SearchBottomSheet';