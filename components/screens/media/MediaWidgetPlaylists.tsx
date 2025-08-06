import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";

interface MediaWidgetPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
	mediaId: number;
	url: Href;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const MediaWidgetPlaylists = ({
	mediaId,
	url,
	style,
	labelStyle,
	containerStyle,
} : MediaWidgetPlaylistsProps) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const urlPlaylists = `${url}/playlists` as Href;
	const {
		data: playlists,
		isLoading,
	} = useMediaPlaylistsInfiniteQuery({
		id: mediaId,
	});
	const loading = playlists === undefined || isLoading;

	if (!playlists || !playlists.pages[0].length) return null;

	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={urlPlaylists} style={labelStyle}>
			<View style={tw`flex-row items-center`}>
				<ThemedText style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.playlist', { count: 2 }))}
				</ThemedText>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<LegendList
		data={playlists.pages.flat()}
		renderItem={({ item }) => (
		<CardPlaylist key={item.id} playlist={item} style={tw`w-36`} />
		)}
		snapToInterval={152}
		decelerationRate="fast"
		keyExtractor={(item) => item.id.toString()}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw`w-2`} />}
		contentContainerStyle={containerStyle}
		nestedScrollEnabled
		/>
	</View>
	);
};

export default MediaWidgetPlaylists;
