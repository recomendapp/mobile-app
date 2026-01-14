import React, { useCallback } from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { MediaTvSeries, UserActivityTvSeries } from '@recomendapp/types';
import { LinkProps, usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { TrueSheet as RNTrueSheet } from '@lodev09/react-native-true-sheet';
import TrueSheet from '@/components/ui/TrueSheet';
import BottomSheetDefaultView from '../templates/BottomSheetDefaultView';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/providers/AuthProvider';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import BottomSheetShareTvSeries from './share/BottomSheetShareTvSeries';
import { FlashList } from '@shopify/flash-list';
import { getTmdbImage } from '@/lib/tmdb/getTmdbImage';

interface BottomSheetTvSeriesProps extends BottomSheetProps {
  tvSeries?: MediaTvSeries,
  activity?: UserActivityTvSeries,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

type Item = {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
  closeOnPress?: boolean;
  disabled?: boolean;
} | string;

const BottomSheetTvSeries = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetTvSeriesProps
>(({ id, tvSeries, activity, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const openSheet = useBottomSheetStore((state) => state.openSheet);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const { colors, mode, isLiquidGlassAvailable } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // REFs
  const BottomSheetMainCreditsRef = React.useRef<RNTrueSheet>(null);
  // States
  const items: Item[] = React.useMemo(() => ([
    'header',
    ...additionalItemsTop,
    {
      icon: Icons.Share,
      onPress: () => openSheet(BottomSheetShareTvSeries, {
        tvSeries: tvSeries!,
      }),
      label: upperFirst(t('common.messages.share')),
    },
    ...((activity) ? [
      {
        icon: Icons.Feed,
        onPress: () => router.push(`/user/${activity.user?.username}`),
        label: upperFirst(t('common.messages.go_to_activity')),
      },
    ] : []),
    {
      icon: Icons.Movie,
      onPress: () => router.push(tvSeries?.url as LinkProps['href']),
      label: upperFirst(t('common.messages.go_to_tv_series')),
      disabled: tvSeries?.url ? pathname.startsWith(tvSeries.url) : false
    },
    ...((tvSeries?.created_by && tvSeries.created_by.length > 0) ? [
      tvSeries.created_by.length > 1 ? {
        icon: Icons.Users,
        onPress: () => BottomSheetMainCreditsRef.current?.present(),
        label: upperFirst(t('common.messages.show_creator', { gender: 'male', count: tvSeries.created_by.length })),
        closeOnPress: false,
      } : {
        icon: Icons.User,
        onPress: () => router.push(tvSeries.created_by?.[0].url as LinkProps['href']),
        label: upperFirst(t('common.messages.go_to_creator', { gender: tvSeries.created_by![0].gender === 1 ? 'female' : 'male', count: 1 }))
      },
    ] : []),
    ...(session ? [
      {
        icon: Icons.AddPlaylist,
        onPress: () => tvSeries?.id && router.push({
          pathname: '/playlist/add/tv-series/[tv_series_id]',
          params: {
            tv_series_id: tvSeries?.id,
            tv_series_name: tvSeries?.name,
          }
        }),
        label: upperFirst(t('common.messages.add_to_playlist')),
      },
      {
        icon: Icons.Reco,
        onPress: () => tvSeries?.id && router.push({
          pathname: '/reco/send/tv-series/[tv_series_id]',
          params: {
            tv_series_id: tvSeries?.id,
            tv_series_name: tvSeries?.name,
          }
        }),
        label: upperFirst(t('common.messages.send_to_friend')),
      }
    ] : []),
    ...additionalItemsBottom,
  ]), [tvSeries, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname, activity, session]);

  const renderItem = useCallback(({ item }: { item: Item }) => {
    if (typeof item === 'string') {
      return (
        <View
        style={[
          { backgroundColor: isLiquidGlassAvailable ? 'transparent' : colors.muted, borderColor: colors.mutedForeground },
          tw`border-b p-4`,
        ]}
        >
          <View style={tw`flex-row items-center gap-2 `}>
            <ImageWithFallback
            alt={tvSeries?.name ?? ''}
            source={{ uri: getTmdbImage({ path: tvSeries?.poster_path, size: 'w342' }) ?? '' }}
            style={[
              { aspectRatio: 2 / 3, height: 'fit-content' },
              tw.style('rounded-md w-12'),
            ]}
            type={'tv_series'}
            />
            <View style={tw`shrink`}>
              <Text numberOfLines={2} style={tw`shrink`}>{tvSeries?.name}</Text>
              {tvSeries?.created_by && tvSeries?.created_by.length > 0 && (
                <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
                {tvSeries.created_by?.map((creator) => creator.name).join(', ')}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    }

    return (
      <Button
      variant='ghost'
      icon={item.icon}
      iconProps={{
        color: colors.mutedForeground,
      }}
      disabled={item.disabled}
      style={tw`justify-start h-auto py-4`}
      onPress={() => {
        (item.closeOnPress || item.closeOnPress === undefined) && closeSheet(id);
        item.onPress();
      }}
      >
        {item.label}
      </Button>
    );
  }, [colors.mutedForeground, colors.muted, closeSheet, id, tvSeries, isLiquidGlassAvailable]);


  return (
    <TrueSheet
    ref={ref}
    scrollable
    {...props}
    >
      <FlashList
      data={items}
      bounces={false}
      stickyHeaderIndices={[0]}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderItem}
      indicatorStyle={mode === 'dark' ? 'white' : 'black'}
      nestedScrollEnabled
      />
      {tvSeries?.created_by && (
        <BottomSheetDefaultView
        ref={BottomSheetMainCreditsRef}
        id={`${id}-credits`}
        scrollable
        >
          <FlashList
          data={tvSeries?.created_by || []}
          bounces={false}
          renderItem={({ item }) => (
            <Button
            variant="ghost"
            size="fit"
            onPress={() => {
              BottomSheetMainCreditsRef.current?.dismiss();
              closeSheet(id);
              router.push(item.url as LinkProps['href']);
            }}
            style={[
              { paddingVertical: PADDING_HORIZONTAL, paddingHorizontal: PADDING_HORIZONTAL },
            ]}
            >
              <View style={tw`flex-1 flex-row items-center gap-2 justify-between`}>
                <Text>{item.name}</Text>
                <Icons.ChevronRight color={colors.mutedForeground} size={16} />
              </View>
            </Button>
          )}
          indicatorStyle={mode === 'dark' ? 'white' : 'black'}
          nestedScrollEnabled
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingTop: PADDING_VERTICAL,
          }}
          />
        </BottomSheetDefaultView>
      )}
    </TrueSheet>
  );
});
BottomSheetTvSeries.displayName = 'BottomSheetTvSeries';

export default BottomSheetTvSeries;