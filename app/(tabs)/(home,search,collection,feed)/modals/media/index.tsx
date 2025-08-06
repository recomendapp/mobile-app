import { useMemo } from 'react';
import { Icons } from '@/constants/Icons';
import { Media, UserActivity } from '@/types/type.db';
import { LinkProps, useLocalSearchParams, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import { useTranslations } from 'use-intl';
import { View } from '@/components/ui/view';
import tw from '@/lib/tw';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/Button';
import { ScrollView } from 'react-native';

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
	closeOnPress?: boolean;
	disabled?: boolean;
}

type ModalMediaSearchParams = {
  media: string;
  activity?: string;
}

const ModalMedia = () => {
	const params = useLocalSearchParams<ModalMediaSearchParams>();
    const media: Media = JSON.parse(params.media);
	const activity: UserActivity | undefined = params.activity ? JSON.parse(params.activity) : undefined;
	const { colors, inset } = useTheme();
	const router = useRouter();
	const t = useTranslations();
	// States
	const items: Item[] = useMemo(() => ([
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
		},
		...(((media?.media_type === 'movie' || media?.media_type === 'tv_series') && media.main_credit && media.main_credit.length > 0) ? [
			media.main_credit.length > 1 ? {
			icon: Icons.Users,
			onPress: () => {
				// router.push({
				// 	pathname: '/modals/media/credits',
				// 	params: {
				// 		media: JSON.stringify(media),
				// 	}
				// })
			},
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
		{
			icon: Icons.AddPlaylist,
			onPress: () => {
				// router.push({
				// 	pathname: '/modals/media/add-to-playlist',
				// 	params: {
				// 		media: JSON.stringify(media),
				// 	}
				// });
			},
			label: upperFirst(t('common.messages.add_to_playlist')),
		},
		{
			icon: Icons.Reco,
			onPress: () => {
				// router.push({
				// 	pathname: '/modals/media/send-reco',
				// 	params: {
				// 		media: JSON.stringify(media),
				// 	}
				// });
			},
			label: upperFirst(t('common.messages.send_to_friend')),
		},
	]), [media, router, t]);
	return (
	<ScrollView
	style={{
		backgroundColor: colors.muted,
	}}
	bounces={false}
	contentContainerStyle={{ paddingBottom: inset.bottom }}
	stickyHeaderIndices={[0]}
	>
        <View
        style={[
          { borderColor: colors.mutedForeground },
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
		{items.map((item, i) => (
			<Button
			key={i}
			variant='ghost'
			icon={item.icon}
			iconProps={{
			color: colors.mutedForeground,
			}}
			disabled={item.disabled}
			style={tw`justify-start h-auto py-4`}
			onPress={() => {
				(item.closeOnPress || item.closeOnPress === undefined) && router.back();
				setTimeout(() => {
					item.onPress();
				});
			}}
			>
			{item.label}
			</Button>
		))}
	</ScrollView>
	)
};

export default ModalMedia;