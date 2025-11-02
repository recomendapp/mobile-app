import tw from '@/lib/tw';
import { Icons } from '@/constants/Icons';
import { Playlist } from '@recomendapp/types';
import { usePathname, useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { upperFirst } from 'lodash';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { Alert, FlatList } from 'react-native';
import { ImageWithFallback } from '@/components/utils/ImageWithFallback';
import { useAuth } from '@/providers/AuthProvider';
import { usePlaylistDeleteMutation } from '@/features/playlist/playlistMutations';
import { useUserPlaylistSavedQuery } from '@/features/user/userQueries';
import { useUserPlaylistSavedDeleteMutation, useUserPlaylistSavedInsertMutation } from '@/features/user/userMutations';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/text';
import richTextToPlainString from '@/utils/richTextToPlainString';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import BottomSheetSharePlaylist from './share/BottomSheetSharePlaylist';
import { GAP, GAP_XS } from '@/theme/globals';
import { View } from '@/components/ui/view';
import ButtonActionPlaylistLike from '@/components/buttons/ButtonActionPlaylistLike';
import ButtonActionPlaylistSaved from '@/components/buttons/ButtonActionPlaylistSaved';
import { forwardRef, useRef } from 'react';

interface BottomSheetPlaylistProps extends BottomSheetProps {
	playlist: Playlist,
	additionalItemsTop?: Item[];
};

interface Item {
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	submenu?: Item[];
	closeSheet?: boolean;
	disabled?: boolean;
}

const BottomSheetPlaylist = forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetPlaylistProps
>(({ id, playlist, additionalItemsTop = [], ...props }, ref) => {
	const { session } = useAuth();
	const toast = useToast();
	const { closeSheet, openSheet } = useBottomSheetStore((state) => state);
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	// REFs
	const scrollRef = useRef<FlatList>(null);
	const {
		data: saved,
		isLoading: isLoadingSaved,
	} = useUserPlaylistSavedQuery({
		userId: session?.user.id,
		playlistId: playlist.id,
	});
	const insertPlaylistSaved = useUserPlaylistSavedInsertMutation();
	const deletePlaylistSaved = useUserPlaylistSavedDeleteMutation();

	const playlistDeleteMutation = usePlaylistDeleteMutation();

	const items: Item[] = [
		...additionalItemsTop,
		{
			icon: Icons.Share,
			onPress: () => openSheet(BottomSheetSharePlaylist, {
				playlist: playlist,
			}),
			label: upperFirst(t('common.messages.share')),
		},
		...(session?.user.id && playlist.user?.id !== session.user.id ? [
			{
				icon: saved
					? Icons.Check
					: Icons.Add,
				onPress: async () => {
					if (saved) {
						await deletePlaylistSaved.mutateAsync({
							savedId: saved.id,
						}, {
							onError: () => {
								toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
							}
						});
					} else {
						await insertPlaylistSaved.mutateAsync({
							userId: session.user.id,
							playlistId: playlist.id,
						}, {
							onError: () => {
								toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
							}
						});

					}
				},
				label: saved ? upperFirst(t('common.messages.remove_from_library')) : upperFirst(t('common.messages.save_to_library')),
				closeSheet: false,
				disabled: isLoadingSaved,
			}
		] : []),
		{
			icon: Icons.Playlist,
			onPress: () => router.push(`/playlist/${playlist.id}`),
			label: upperFirst(t('common.messages.go_to_playlist')),
			disabled: pathname.startsWith(`/playlist/${playlist.id}`),
		},
		...(playlist.user ? [
			{
				icon: Icons.User,
				onPress: () => router.push(`/user/${playlist.user?.username}`),
				label: upperFirst(t('common.messages.go_to_user')),
			}
		] : []),
		...(session?.user.id === playlist.user_id ? [
			{
				icon: Icons.Users,
				onPress: () => router.push(`/playlist/${playlist.id}/edit/guests`),
				label: upperFirst(t('common.messages.manage_guests', { gender: 'male', count: 2 })),
			},
			{
				icon: Icons.settings,
				onPress: () => router.push(`/playlist/${playlist.id}/edit`),
				label: upperFirst(t('common.messages.edit_playlist')),
			},
			{
				icon: Icons.Delete,
				onPress: async () => {
					Alert.alert(
						upperFirst(t('common.messages.are_u_sure')),
						upperFirst(richTextToPlainString(t.rich('pages.playlist.actions.delete.description', { title: playlist.title, important: (chunk) => `"${chunk}"` }))),
						[
							{
								text: upperFirst(t('common.messages.cancel')),
								style: 'cancel',
							},
							{
								text: upperFirst(t('common.messages.delete')),
								onPress: async () => {
									await playlistDeleteMutation.mutateAsync(
										{ playlistId: playlist.id, userId: session.user.id },
										{
											onSuccess: () => {
												toast.success(upperFirst(t('common.messages.deleted')));
												if (pathname.startsWith(`/playlist/${playlist.id}`)) {
													router.replace('/collection');
												}
												closeSheet(id);
											},
											onError: () => {
												toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
											},
										}
									);
								},
								style: 'destructive',
							}
						]
					)
				},
				label: upperFirst(t('common.messages.delete')),
				closeSheet: false,
			}
		] : []),
	];

	return (
	<ThemedTrueSheet
	ref={ref}
	scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
	contentContainerStyle={tw`p-0`}
	{...props}
	>
		<FlatList
		ref={scrollRef}
		data={items}
		renderItem={({ item }) => (
			<Button
			variant='ghost'
			icon={item.icon}
			iconProps={{
				color: colors.mutedForeground,
			}}
			disabled={item.disabled}
			style={tw`justify-start h-auto py-4`}
			onPress={() => {
				(item.closeSheet === undefined || item.closeSheet === true) && closeSheet(id);
				item.onPress();
			}}
			>
				{item.label}
			</Button>
		)}
		ListHeaderComponent={
			<View
			style={[
				{ backgroundColor: colors.muted, borderColor: colors.mutedForeground, gap: GAP },
				tw`flex-row items-center justify-between border-b p-4`,
			]}
			>
				<View style={[tw`flex-row items-center`, { gap: GAP }]}>
					<ImageWithFallback
					alt={playlist.title ?? ''}
					source={{ uri: playlist.poster_url ?? '' }}
					style={[
						{ aspectRatio: 1 / 1 },
						tw.style('rounded-md w-12'),
					]}
					type={"playlist"}
					/>
					<View>
						<Text numberOfLines={2}>{playlist.title}</Text>
						{playlist.user && <Text textColor='muted' numberOfLines={1}>
							{t('common.messages.by_name', { name: playlist.user?.username! })}
						</Text>}
					</View>
				</View>
				<View style={tw`flex-row items-center`}>
					<ButtonActionPlaylistLike playlist={playlist} />
					<ButtonActionPlaylistSaved playlist={playlist} />
				</View>
			</View>
		}
		stickyHeaderIndices={[0]}
		keyExtractor={(_, index) => index.toString()}
		nestedScrollEnabled
		bounces={false}
		contentContainerStyle={{ paddingBottom: insets.bottom }}
		/>
	</ThemedTrueSheet>
	);
});
BottomSheetPlaylist.displayName = 'BottomSheetPlaylist';

export default BottomSheetPlaylist;