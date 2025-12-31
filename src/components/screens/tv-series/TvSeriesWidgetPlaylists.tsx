import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { Playlist } from "@recomendapp/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMediaTvSeriesPlaylistsQuery } from "@/api/medias/mediaQueries";

interface TvSeriesWidgetPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
	tvSeriesId: number;
	url: Href;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const TvSeriesWidgetPlaylists = ({
	tvSeriesId,
	url,
	style,
	labelStyle,
	containerStyle,
} : TvSeriesWidgetPlaylistsProps) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const urlPlaylists = `${url}/playlists` as Href;
	const {
		data: playlists,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = useMediaTvSeriesPlaylistsQuery({
		tvSeriesId,
		filters: {
			sortBy: 'updated_at',
			sortOrder: 'desc',
		}
	});
	const loading = playlists === undefined || isLoading;

	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={urlPlaylists} style={labelStyle}>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.playlist', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<LegendList<Playlist>
		key={loading ? 'loading' : 'playlists'}
		data={loading ? new Array(3).fill(null) : playlists?.pages.flat()}
		renderItem={({ item }) => (
			!loading ? (
				<CardPlaylist playlist={item} style={tw`w-36`} />
			) : (
				<CardPlaylist skeleton style={tw`w-36`} />
			)
		)}
		ListEmptyComponent={
			<Text style={[tw``, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_playlists'))}
			</Text>
		}
		snapToInterval={152}
		decelerationRate="fast"
		keyExtractor={(item, index) => loading ? index.toString() : item.id.toString()}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw`w-2`} />}
		contentContainerStyle={containerStyle}
		nestedScrollEnabled
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		/>
	</View>
	);
};

export default TvSeriesWidgetPlaylists;
