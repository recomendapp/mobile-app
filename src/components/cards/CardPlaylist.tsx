import { ImageWithFallback } from '../utils/ImageWithFallback';
import { Playlist, FixedOmit } from '@recomendapp/types';
import React from 'react';
import Animated from 'react-native-reanimated';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import tw from '@/lib/tw';
import { useTheme } from '@/providers/ThemeProvider';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import BottomSheetPlaylist from '../bottom-sheets/sheets/BottomSheetPlaylist';
import { useTranslations } from 'use-intl';
import { Skeleton } from '../ui/Skeleton';
import { Text } from '../ui/text';

interface CardPlaylistBaseProps
	extends React.ComponentPropsWithRef<typeof Animated.View> {
		variant?: "default" | "list";
		linked?: boolean;
		onPress?: () => void;
		onLongPress?: () => void;
		showPlaylistAuthor?: boolean;
		showItemsCount?: boolean;
	}

type CardPlaylistSkeletonProps = {
	skeleton: true;
	playlist?: never;
};

type CardPlaylistDataProps = {
	skeleton?: false;
	playlist: Playlist;
};

export type CardPlaylistProps = CardPlaylistBaseProps &
	(CardPlaylistSkeletonProps | CardPlaylistDataProps);

const CardPlaylistDefault = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardPlaylistProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, playlist, skeleton, showPlaylistAuthor = true, showItemsCount = false, children, ...props }, ref) => {
	const t = useTranslations();
	const { colors } = useTheme();
	const renderItemsCount = () => {
		if (!playlist) return null;
		switch (playlist.type) {
			case 'movie':
				return t('common.messages.film_count', { count: playlist.items_count ?? 0 });
			case 'tv_series':
				return t('common.messages.tv_series_count', { count: playlist.items_count ?? 0 });
			default:
				return t('common.messages.item_count', { count: playlist.items_count ?? 0 });
		}
	}
	return (
		<Animated.View
			ref={ref}
			style={[
				tw`gap-2`,
				style,
			]}
			{...props}
		>
			{!skeleton ? <ImageWithFallback
				source={{uri: playlist?.poster_url ?? ''}}
				alt={playlist?.title ?? ''}
				type="playlist"
				style={tw`aspect-square w-auto h-auto`}
			/> : <Skeleton style={tw`aspect-square w-auto h-auto`} />}
			<View style={skeleton ? tw`gap-1` : undefined}>
				{!skeleton ? <Text numberOfLines={2} style={tw`font-medium`}>{playlist?.title}</Text> : <Skeleton style={tw`w-24 h-5`} />}
				{showPlaylistAuthor && (
					!skeleton ? (
						<Text style={{ color: colors.mutedForeground }} numberOfLines={1} className="text-sm italic">
							{t('common.messages.by_name', { name: playlist?.user?.username! })}
						</Text>
					) : (
						<Skeleton style={tw`w-24 h-5`} />
					)
				)}
				{showItemsCount && (
					!skeleton ? (
						<Text style={{ color: colors.mutedForeground }} numberOfLines={1} className="text-sm italic">
							{renderItemsCount()}
						</Text>
					) : (
						<Skeleton style={tw`w-10 h-5`} />
					)
				)}
			</View>
		</Animated.View>
	);
});
CardPlaylistDefault.displayName = "CardPlaylistDefault";

const CardPlaylistList = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	FixedOmit<CardPlaylistProps, "variant" | "linked" | "onPress" | "onLongPress">
>(({ style, playlist, skeleton, showPlaylistAuthor = true, showItemsCount, children, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const renderItemsCount = () => {
		if (!playlist) return null;
		switch (playlist.type) {
			case 'movie':
				return t('common.messages.film_count', { count: playlist.items_count ?? 0 });
			case 'tv_series':
				return t('common.messages.tv_series_count', { count: playlist.items_count ?? 0 });
			default:
				return t('common.messages.item_count', { count: playlist.items_count ?? 0 });
		}
	}
	return (
		<Animated.View
		ref={ref}
		style={[
			tw`flex-row justify-between items-center p-1 h-20 gap-2`,
			style,
		]}
		{...props}
		>
			<View style={tw`flex-1 flex-row items-center gap-2`}>
				{!skeleton ? <ImageWithFallback
					source={{uri: playlist?.poster_url ?? ''}}
					alt={playlist?.title ?? ''}
					type="playlist"
					style={tw`aspect-square w-auto`}
				/> : <Skeleton style={tw`aspect-square w-auto h-auto`} />}
				<View style={skeleton ? tw`gap-1` : undefined}>
					{!skeleton ? <Text numberOfLines={2} style={tw`font-medium`}>{playlist?.title}</Text> : <Skeleton style={tw`w-24 h-5`} />}
					{showPlaylistAuthor && (
						skeleton ? <Skeleton style={tw`w-24 h-5`} /> : playlist.user && (
							<Text style={{ color: colors.mutedForeground }} numberOfLines={1} className="text-sm italic">
								{t('common.messages.by_name', { name: playlist?.user?.username! })}
							</Text>
						)
					)}
					{showItemsCount && (
						!skeleton ? (
							<Text style={{ color: colors.mutedForeground }} numberOfLines={1} className="text-sm italic">
								{renderItemsCount()}
							</Text>
						) : (
							<Skeleton style={tw`w-10 h-5`} />
						)
					)}
				</View>
			</View>
		</Animated.View>
	);
});
CardPlaylistList.displayName = "CardPlaylistList";

const CardPlaylist = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	CardPlaylistProps
>(({ variant = "default", linked = true, onPress, onLongPress, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	
	const content = (
		variant === "default" ? (
			<CardPlaylistDefault ref={ref} {...props} />
		) : variant === "list" ? (
			<CardPlaylistList ref={ref} {...props} />
		) : null
	);

	if (props.skeleton) return content;

	return (
		<Pressable
		onPress={() => {
			if (linked) router.push(`/playlist/${props.playlist.id}`);
			onPress?.();
		}}
		onLongPress={() => {
			openSheet(BottomSheetPlaylist, {
				playlist: props.playlist,
			});
			onLongPress?.();
		}}
		>
			{content}
		</Pressable>
	);
});
CardPlaylist.displayName = "CardPlaylist";

export {
	CardPlaylist,
	CardPlaylistDefault,
}