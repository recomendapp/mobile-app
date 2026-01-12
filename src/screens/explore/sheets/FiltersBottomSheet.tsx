import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { SharedValue } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/providers/ThemeProvider';
import { useExploreStore } from '@/stores/useExploreStore';
import { View } from '@/components/ui/view';
import tw from '@/lib/tw';
import { BORDER_RADIUS_FULL, GAP, GAP_XS, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/constants/Icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';
import SliderRange, { SliderRangeRef } from '@/components/ui/SliderRange';
import { Skeleton } from '@/components/ui/Skeleton';
import { MediaMovie } from '@recomendapp/types';
import { useAuth } from '@/providers/AuthProvider';
import Switch from '@/components/ui/Switch';
import { useExploreTileQuery } from '@/api/explore/exploreQueries';

interface FiltersBottomSheetProps {
  index: SharedValue<number>;
  position: SharedValue<number>;
}

export const FiltersBottomSheet = forwardRef<
  BottomSheetModal,
  FiltersBottomSheetProps
>(({ index, position }, ref) => {
  // Hooks
  const { session } = useAuth();
  const t = useTranslations();
  const { filters, setFilters, activeFiltersCount } = useExploreStore((state) => state);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  // REFs
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const runtimeRangeRef = useRef<SliderRangeRef>(null);
  const releaseDateRangeRef = useRef<SliderRangeRef>(null);

  const { data: tile } = useExploreTileQuery({ exploreId: 1 });

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [runtimeRange, setRuntimeRange] = useState<{ min: number; max: number } | undefined>(undefined);
  const [releaseDateRange, setReleaseDateRange] = useState<{ min: number; max: number } | undefined>(undefined);
  const [genres, setGenres] = useState<MediaMovie['genres'] | undefined>(undefined);

  const handleOpen = () => {
    bottomSheetRef.current?.present();
    setIsOpen(true);
  };

  const handleClose = () => {
    bottomSheetRef.current?.dismiss();
    setIsOpen(false);
  };

  const setRuntimeFilter = useCallback(() => {
    if (!tile?.features.length) return;
    const runtimes = tile.features
      .map(f => f.properties?.movie?.runtime)
      .filter((r): r is number => typeof r === 'number' && !isNaN(r));

    if (runtimes.length === 0) return;

    const rawMin = Math.min(...runtimes);
    const rawMax = Math.max(...runtimes);

    const roundTo15 = (v: number, direction: 'down' | 'up') => {
      const mod = v % 15;
      if (mod === 0) return v;
      return direction === 'up' ? v + (15 - mod) : v - mod;
    };

    setRuntimeRange({
      min: roundTo15(rawMin, 'down'),
      max: roundTo15(rawMax, 'up'),
    });
  }, [tile]);

  const setReleaseDateFilter = useCallback(() => {
    if (!tile?.features.length) return;
    const releaseDates = tile.features
      .map(f => f.properties?.movie?.release_date)
      .filter((d): d is string => typeof d === 'string' && !isNaN(new Date(d).getTime()))
      .map(d => new Date(d).getFullYear());
    if (releaseDates.length === 0) return;

    const min = Math.min(...releaseDates);
    const max = Math.max(...releaseDates);

    setReleaseDateRange({ min, max });
  }, [tile]);

  const setGenresFilter = useCallback(() => {
    if (!tile?.features.length) return;

    const map = new Map<number, string>();

    tile.features.forEach(f => {
      f.properties?.movie?.genres?.forEach(g => {
        if (!map.has(g.id)) map.set(g.id, g.name);
      });
    });

    setGenres(Array.from(map, ([id, name]) => ({ id, name })));
  }, [tile]);

  useEffect(() => {
    setRuntimeFilter();
    setReleaseDateFilter();
    setGenresFilter();
  }, [setRuntimeFilter, setReleaseDateFilter, setGenresFilter]);

  return (
  <>
    {!isOpen && (
      <Button
      icon={Icons.Filters}
      size="icon"
      variant={isOpen ? "accent-yellow" : "muted"}
      onPress={handleOpen}
      >
        {activeFiltersCount > 0 ? (
          <View
          style={[
            tw`absolute  -top-3 -right-3 items-center justify-center rounded-full px-1`,
            { backgroundColor: colors.accentYellow },
          ]}
          >
            <Text style={[tw`text-xs font-semibold`, { color: colors.accentYellowForeground }]}>
              {activeFiltersCount}
            </Text>
          </View>
        ) : null}
      </Button>
    )}
    <BottomSheetModal
    ref={bottomSheetRef}
    key="FiltersBottomSheet"
    name="FiltersBottomSheet"
    snapPoints={['35%']}
    topInset={headerHeight}
    animatedPosition={position}
    animatedIndex={index}
    onChange={(state) => setIsOpen(state === -1 ? false : true)}
    handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}
    backgroundStyle={{ backgroundColor: colors.muted }}
    >
      <BottomSheetScrollView
      contentContainerStyle={{
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: insets.bottom + PADDING_VERTICAL,
        gap: GAP,
      }}
      bounces={false}
      >
        <View style={[tw`flex-row justify-between items-center`, { gap: GAP }]}>
          <Text variant='title'>{upperFirst(t('common.messages.filter', { count: 2 }))}</Text>
          <View style={[tw`flex-row items-center`, { gap: GAP }]}>
            <Button
            variant='muted'
            icon={Icons.X}
            size='icon'
            style={{ borderRadius: BORDER_RADIUS_FULL, backgroundColor: colors.background }}
            onPress={handleClose}
            />
          </View>
        </View>
        {/* RELEASE DATE */}
        <View>
          <View style={[tw`flex-row items-center`, { gap: GAP }]}>
            <Text>{upperFirst(t('common.messages.release_date'))}</Text>
            {filters.releaseDate.min != null && filters.releaseDate.max != null && (
              <Button
              icon={Icons.Reset}
              iconProps={{ color: colors.mutedForeground }}
              size='fit'
              variant='ghost'
              onPress={() => {
                setFilters({ releaseDate: { min: null, max: null }});
                releaseDateRangeRef.current?.reset();
              }}
              />
            )}
          </View>
          {releaseDateRange ? (
            <SliderRange
            ref={releaseDateRangeRef}
            min={releaseDateRange.min}
            max={releaseDateRange.max}
            step={1}
            defaultMin={filters.releaseDate.min || undefined}
            defaultMax={filters.releaseDate.max || undefined}
            onValueChange={(v) => setFilters({ releaseDate: { min: v.min, max: v.max }})}
            />
          ) : <Skeleton color={colors.background} style={tw`h-10 w-full`} />}
        </View>
        {/* RUNTIME */}
        <View>
          <View style={[tw`flex-row items-center`, { gap: GAP }]}>
            <Text>{upperFirst(t('common.messages.runtime'))}</Text>
            {filters.runtime.min != null && filters.runtime.max != null && (
              <Button
              icon={Icons.Reset}
              iconProps={{ color: colors.mutedForeground }}
              size='fit'
              variant='ghost'
              onPress={() => {
                setFilters({ runtime: { min: null, max: null }});
                runtimeRangeRef.current?.reset();
              }}
              />
            )}
          </View>
          {runtimeRange ? (
            <SliderRange
            ref={runtimeRangeRef}
            min={runtimeRange.min}
            max={runtimeRange.max}
            step={15}
            defaultMin={filters.runtime.min || undefined}
            defaultMax={filters.runtime.max || undefined}
            formatLabel={(v) => {
              'worklet'

              const hours = Math.floor(v / 60);
              const minutes = Math.round(v % 60);
              return `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}`;
            }}
            onValueChange={(v) => setFilters({ runtime: { min: v.min, max: v.max }})}
            />
          ) : <Skeleton color={colors.background} style={tw`h-10 w-full`} />}
        </View>
        {/* GENRES */}
        <View style={{ gap: GAP_XS }}>
          <View style={[tw`flex-row items-center`, { gap: GAP }]}>
            <Text>{upperFirst(t('common.messages.genre', { count: 2 }))}</Text>
            {filters.genres.selected.length > 0 && (
              <Button
              icon={Icons.Reset}
              iconProps={{ color: colors.mutedForeground }}
              size='fit'
              variant='ghost'
              onPress={() => {
                setFilters({ genres: { selected: [] } });
              }}
              />
            )}
          </View>
          {genres?.length ? (
            <View style={[tw`flex-row flex-wrap`, { gap: GAP }]}>
              {genres.map((g) => {
                const isSelected = filters.genres.selected.includes(g.id);
                return (
                  <Button
                  key={g.id}
                  variant={isSelected ? 'accent-yellow' : 'muted'}
                  style={!isSelected ? {
                    backgroundColor: colors.background,
                  } : undefined}
                  onPress={() => {
                    if (isSelected) {
                      setFilters({
                        genres: {
                          selected: filters.genres.selected.filter(id => id !== g.id),
                        },
                      });
                    } else {
                      setFilters({
                        genres: {
                          selected: [...filters.genres.selected, g.id],
                        },
                      });
                    }
                  }}
                  >
                    {g.name}
                  </Button>
                );
              })}
            </View>
          ) : <Skeleton color={colors.background} style={[tw`h-40 w-full`]} />}
        </View>
        {/* USER */}
        {session && (
          <View style={[tw`flex-row items-center justify-between`, { gap: GAP }]}>
            <Text>{upperFirst(t('common.messages.hide_watched'))}</Text>
            <Switch key={`hide-watched-${filters.user.hideWatched}`} value={filters.user.hideWatched} onValueChange={(value) => setFilters({ user: { hideWatched: value }})} />
          </View>
        )}
      </BottomSheetScrollView>      
    </BottomSheetModal>
  </>
  );
});
FiltersBottomSheet.displayName = 'FiltersBottomSheet';