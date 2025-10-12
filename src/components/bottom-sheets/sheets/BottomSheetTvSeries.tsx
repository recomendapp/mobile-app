import React from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { MediaPerson, MediaTvSeries, UserActivityTvSeries } from '@recomendapp/types';
import { LinkProps, usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Pressable, View, ScrollView, FlatList } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import BottomSheetDefaultView from '../templates/BottomSheetDefaultView';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/providers/AuthProvider';
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from '@/theme/globals';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetShareTvSeries from './share/BottomSheetShareTvSeries';

interface BottomSheetTvSeriesProps extends BottomSheetProps {
  tvSeries?: MediaTvSeries,
  activity?: UserActivityTvSeries,
  additionalItemsTop?: Item[];
  additionalItemsBottom?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
  closeOnPress?: boolean;
  disabled?: boolean;
}

const BottomSheetTvSeries = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetTvSeriesProps
>(({ id, tvSeries, activity, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const openSheet = useBottomSheetStore((state) => state.openSheet);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
  const BottomSheetMainCreditsRef = React.useRef<TrueSheet>(null);
  const creditsScrollRef = React.useRef<FlatList<MediaPerson>>(null);
  // States
  const items: Item[][] = React.useMemo(() => ([
    [
      ...additionalItemsTop,
    ],
    [
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
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [tvSeries, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname, activity, session]);

  return (
    <ThemedTrueSheet
    ref={ref}
    scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
    contentContainerStyle={tw`p-0`}
    {...props}
    >
      <ScrollView
      ref={scrollRef}
      bounces={false}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      stickyHeaderIndices={[0]}
      >
        <View
        style={[
          { backgroundColor: colors.muted, borderColor: colors.mutedForeground },
          tw`border-b p-4`,
        ]}
        >
          <View style={tw`flex-row items-center gap-2 `}>
            <ImageWithFallback
            alt={tvSeries?.name ?? ''}
            source={{ uri: tvSeries?.poster_url ?? '' }}
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
        {items.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((item, j) => (
              <Button
              key={j}
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
            ))}
          </React.Fragment>
        ))}
      </ScrollView>
      {tvSeries?.created_by && (
        <BottomSheetDefaultView
        ref={BottomSheetMainCreditsRef}
        id={`${id}-credits`}
        scrollRef={creditsScrollRef as React.RefObject<React.Component<unknown, {}, any>>}
        >
          <FlatList
          ref={creditsScrollRef}
          data={tvSeries?.created_by || []}
          renderItem={({ item }) => (
            <Pressable
            onPress={() => {
              BottomSheetMainCreditsRef.current?.dismiss();
              closeSheet(id);
              router.push(item.url as LinkProps['href']);
            }}
            style={[
              {
                paddingHorizontal: PADDING_HORIZONTAL,
                paddingVertical: PADDING_VERTICAL,
                gap: GAP
              },
              tw`flex-row justify-between items-center`,
            ]}
            >
              <Text>
                {item.name}
              </Text>
              <Button
              variant="ghost"
              icon={Icons.ChevronRight}
              size="icon"
              />
            </Pressable>
          )}
          contentContainerStyle={{
            paddingTop: PADDING_VERTICAL,
          }}
          />
        </BottomSheetDefaultView>
      )}
    </ThemedTrueSheet>
  );
});
BottomSheetTvSeries.displayName = 'BottomSheetTvSeries';

export default BottomSheetTvSeries;