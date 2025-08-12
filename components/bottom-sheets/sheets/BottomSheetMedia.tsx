import React from 'react';
import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { Media, UserActivity } from '@/types/type.db';
import { LinkProps, usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { View } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import BottomSheetDefaultView from '../templates/BottomSheetDefaultView';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/providers/AuthProvider';

interface BottomSheetMediaProps extends BottomSheetProps {
  media?: Media,
  activity?: UserActivity,
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

const BottomSheetMedia = React.forwardRef<
  React.ComponentRef<typeof TrueSheet>,
  BottomSheetMediaProps
>(({ id, media, activity, additionalItemsTop = [], additionalItemsBottom = [], ...props }, ref) => {
  const openSheet = useBottomSheetStore((state) => state.openSheet);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const { colors, inset } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  // REFs
  const scrollRef = React.useRef<ScrollView>(null);
  const BottomSheetMainCreditsRef = React.useRef<TrueSheet>(null);
  // States
  const items: Item[][] = React.useMemo(() => ([
    [
      ...additionalItemsTop,
    ],
    [
      ...((activity) ? [
        {
          icon: Icons.Feed,
          onPress: () => router.push(`/user/${activity.user?.username}`),
          label: upperFirst(t('common.messages.go_to_activity')),
        },
      ] : []),
      {
        icon: Icons.Movie,
        onPress: () => router.push(media?.url as LinkProps['href']),
        label: media?.media_type === 'movie'
          ? upperFirst(t('common.messages.go_to_film'))
          : media?.media_type === 'tv_series'
          ? upperFirst(t('common.messages.go_to_serie'))
          : media?.media_type === 'person'
          ? upperFirst(t('common.messages.go_to_person'))
          : upperFirst(t('common.messages.go_to_media')),
        disabled: media?.url ? pathname.startsWith(media.url) : false
      },
      ...(((media?.media_type === 'movie' || media?.media_type === 'tv_series') && media.main_credit && media.main_credit.length > 0) ? [
        media.main_credit.length > 1 ? {
          icon: Icons.Users,
          onPress: () => BottomSheetMainCreditsRef.current?.present(),
          label: upperFirst(t(
            media.media_type === 'movie' ? 'common.messages.show_director' : 'common.messages.show_creator',
            {
              gender: 'male',
              count: media.main_credit.length,
            }
          )),
          closeOnPress: false,
        } : {
          icon: Icons.User,
          onPress: () => router.push(media.main_credit![0].url as LinkProps['href']),
          label: upperFirst(t(
            media.media_type === 'movie' ? 'common.messages.go_to_director' : 'common.messages.go_to_creator',
            {
              gender: media.main_credit![0].extra_data.gender === 1 ? 'female' : 'male',
              count: 1,
            }
          ))
        },
      ] : []),
      ...(session ? [
        {
          icon: Icons.AddPlaylist,
          onPress: () => media?.media_id && router.push({
            pathname: '/playlist/add/media/[media_id]',
            params: {
              media_id: media?.media_id,
              media_title: media?.title,
            }
          }),
          label: upperFirst(t('common.messages.add_to_playlist')),
        },
        {
          icon: Icons.Reco,
          onPress: () => media?.media_id && router.push({
            pathname: '/media/[media_id]/reco/send',
            params: {
              media_id: media?.media_id,
              media_title: media?.title,
            }
          }),
          label: upperFirst(t('common.messages.send_to_friend')),
        }
      ] : []),
    ],
    [
      ...additionalItemsBottom,
    ],
  ]), [media, additionalItemsTop, additionalItemsBottom, openSheet, router, t, pathname, activity, session]);
  
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
      contentContainerStyle={{ paddingBottom: inset.bottom }}
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
            alt={media?.title ?? ''}
            source={{ uri: media?.avatar_url ?? '' }}
            style={[
              { aspectRatio: 2 / 3, height: 'fit-content' },
              tw.style('rounded-md w-12'),
            ]}
            type={media?.media_type}
            />
            <View style={tw`shrink`}>
              <Text numberOfLines={2} style={tw`shrink`}>{media?.title}</Text>
              {media?.main_credit && media?.main_credit?.length > 0 && <Text numberOfLines={1} style={[{ color: colors.mutedForeground }, tw`shrink`]}>
                {(media?.media_type === 'movie' || media?.media_type === 'tv_series') ? (
                  media?.main_credit?.map((director) => director.title).join(', ')
                ) : media?.media_type === 'person' ? (
                  media.extra_data.known_for_department
                ) : null}
              </Text>}
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
      <BottomSheetDefaultView
      ref={BottomSheetMainCreditsRef}
      id={`${id}-credits`}
      content={
        <View>
          <Text>ok</Text>
        </View>
      }
      />
    </ThemedTrueSheet>
  );
});
BottomSheetMedia.displayName = 'BottomSheetMedia';

export default BottomSheetMedia;