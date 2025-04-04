import { ImageWithFallback } from '../utils/ImageWithFallback';
import { Playlist } from '@/types/type.db';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { ThemedText } from '../ui/ThemedText';
import { useRouter } from 'expo-router';
import tw from '@/lib/tw';
import { Text } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import BottomSheetPlaylist from '../bottom-sheets/sheets/BottomSheetPlaylist';

interface CardPlaylistProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default";
		playlist: Playlist;
		showPlaylistAuthor?: boolean;
		showItemsCount?: boolean;
	}

const CardPlaylistDefault = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardPlaylistProps, "variant">
>(({ style, playlist, showPlaylistAuthor = true, showItemsCount = false, children, ...props }, ref) => {
	const { t } = useTranslation();
	const { colors } = useTheme();
	return (
		<Animated.View
			ref={ref}
			style={[
				tw.style("gap-2"),
				style,
			]}
			{...props}
		>
			<View style={tw.style("relative aspect-square rounded-sm overflow-hidden w-full")}>
				<ImageWithFallback
					source={{uri: playlist.poster_url ?? ''}}
					alt={playlist?.title ?? ''}
					type="playlist"
					
				/>
			</View>
			<View>
				<ThemedText numberOfLines={2} style={tw.style("font-medium")}>{playlist?.title}</ThemedText>
				{showPlaylistAuthor ? <Text style={{ color: colors.mutedForeground }} numberOfLines={1} className="text-sm italic">
					{t('common.messages.by_name', { name: playlist.user?.username })}
				</Text> : null}
				{showItemsCount ? <Text style={{ color: colors.mutedForeground }} numberOfLines={1} className="text-sm italic">
					{t('common.messages.item_count', { count: playlist.items_count })}
				</Text> : null}
			</View>
		</Animated.View>
	);
});
CardPlaylistDefault.displayName = "CardPlaylistDefault";

const CardPlaylist = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	CardPlaylistProps
>(({ playlist, variant = "default", ...props }, ref) => {
	const router = useRouter();
	const { openSheet } = useBottomSheetStore();
	const onPress = () => {
		router.push(`/playlist/${playlist?.id}`);
	};
	const onLongPress = () => {
		openSheet(BottomSheetPlaylist, {
			playlist: playlist,
		})
	}
	return (
		<Pressable
		onPress={onPress}
		onLongPress={onLongPress}
		>
			{variant === "default" ? (
				<CardPlaylistDefault ref={ref}  playlist={playlist} {...props} />
			) : null}
		</Pressable>
	);
});
CardPlaylist.displayName = "CardPlaylist";

export {
	type CardPlaylistProps,
	CardPlaylist,
	CardPlaylistDefault,
}