import PlaylistHeader from "@/components/screens/playlist/PlaylistHeader";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { Button } from "@/components/ui/button";
import { usePlaylistItems } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { type Playlist as TPlaylist } from "@/types/type.db";
import { capitalize, upperFirst } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import PlaylistItem from "./PlaylistItem";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { Icons } from "@/constants/Icons";
import useDebounce from "@/hooks/useDebounce";
import Fuse from "fuse.js";
import { SearchBar } from "@/components/ui/searchbar";

interface PlaylistProps {
	playlist?: TPlaylist | null;
	loading: boolean;
	isRefetching: boolean;
	refetch: () => void;
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
}

const Playlist = ({
	playlist,
	loading,
	isRefetching,
	refetch,
	scrollY,
	headerHeight,
	headerOverlayHeight,
} : PlaylistProps) => {
	const { colors, inset } = useTheme();
	const { t } = useTranslation();
	const tabBarHeight = useBottomTabOverflow();
	// States
	const {
		data: playlistItems
	} = usePlaylistItems(playlist?.id);
	const backdrops = React.useMemo(() => {
		return playlistItems?.map((item) => item.media?.backdrop_url) || [];
	}, [playlistItems]);
	const [renderItems, setRenderItems] = React.useState<typeof playlistItems>([]);
	// Search and filters
	const [search, setSearch] = React.useState('');
	const debouncedSearch = useDebounce(search, 100);
	const fuse = React.useMemo(() => {
		return new Fuse(playlistItems || [], {
			keys: ['media.title'],
			threshold: 0.5,
		});
	}, [playlistItems]);
	const [sortBy, setSortBy] = React.useState<'rank' | 'title'>('rank');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	// Handlers
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	const handleSearch = React.useCallback((query: string) => {
		if (query.length > 0) {
			const results = fuse.search(query).map(({ item }) => item);
			setRenderItems(results);
		} else {
			setRenderItems(playlistItems || []);
		}
	}, [fuse, playlistItems]);
	// Effects
	React.useEffect(() => {
		if (playlistItems) {
			setRenderItems(playlistItems);
		}
	}, [playlistItems]);
	React.useEffect(() => {
		if (sortBy === 'rank') {
			setRenderItems((prev) => prev?.sort((a, b) => {
				if (sortOrder === 'asc') {
					return (a.rank || 0) - (b.rank || 0);
				}
				return (b.rank || 0) - (a.rank || 0);
			}));
		} else if (sortBy === 'title') {
			setRenderItems((prev) => prev?.sort((a, b) => {
				if (sortOrder === 'asc') {
					return a.media?.title!.localeCompare(b.media?.title!);
				}
				return b.media?.title!.localeCompare(a.media?.title!);
			}));
		}
	}, [sortBy]);
	return (
	<AnimatedLegendList
	onScroll={scrollHandler}
	ListHeaderComponent={
		<>
			<PlaylistHeader
			playlist={playlist}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			loading={loading}
			backdrops={backdrops}
			/>
			{!loading && (
				<SearchBar
				value={search}
				onChangeText={setSearch}
				onSearch={handleSearch}
				debounceMs={200}
				placeholder={upperFirst(t('common.playlist.search.placeholder'))}
				containerStyle={tw`mx-4`}
				/>
			)}
		</>
	}
	ListHeaderComponentStyle={tw`mb-2`}
	data={renderItems || []}
	renderItem={({ item }) => (
		<PlaylistItem key={item.id} item={item} style={tw`py-1 px-4`}/>
	)}
	keyExtractor={(item) => item.id.toString()}
	ListEmptyComponent={
		loading ? <Icons.Loader />
		: (
			<View style={tw`flex-1 items-center justify-center gap-2`}>
				<Text style={{ color: colors.mutedForeground }}>{capitalize(t('common.messages.no_results'))}</Text>
				{playlistItems?.length === 0 && (
					<Button style={tw`rounded-full`}>{upperFirst(t('common.messages.add_to_this_playlist'))}</Button>
				)}
			</View>
		)
	}
	showsVerticalScrollIndicator={false}
	refreshing={isRefetching}
	onRefresh={refetch}
	contentContainerStyle={{
		paddingBottom: tabBarHeight + inset.bottom,
	}}
	/>
	);
};

export default Playlist;