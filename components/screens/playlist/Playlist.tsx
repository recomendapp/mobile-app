import PlaylistHeader from "@/components/screens/playlist/PlaylistHeader";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { Button, ButtonText } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { usePlaylistItems } from "@/features/playlist/playlistQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { type Playlist as TPlaylist } from "@/types/type.db";
import { capitalize, upperFirst } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated, { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import PlaylistItem from "./PlaylistItem";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { Icons } from "@/constants/Icons";
import { BetterInput } from "@/components/ui/BetterInput";
import useDebounce from "@/hooks/useDebounce";

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
	const [search, setSearch] = React.useState('');
	// Handlers
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
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
				<BetterInput
				value={search}
				onChangeText={setSearch}
				placeholder="Search in this playlist"
				leftIcon="search"
				containerStyle={tw`mx-2`}
				/>
			)}
		</>
	}
	ListHeaderComponentStyle={tw`mb-2`}
	data={playlistItems || []}
	renderItem={({ item }) => (
		<PlaylistItem key={item.id} item={item} style={tw`py-1 px-2`}/>
	)}
	keyExtractor={(item) => item.id.toString()}
	ListEmptyComponent={
		loading ? <Icons.Loader />
		: (
			<View style={tw`flex-1 items-center justify-center gap-2`}>
				<Text style={{ color: colors.mutedForeground }}>{capitalize(t('common.messages.no_results'))}</Text>
				<Button style={tw`rounded-full`}>
					<ButtonText>{upperFirst(t('common.messages.add_to_this_playlist'))}</ButtonText>
				</Button>
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