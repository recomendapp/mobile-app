import tw from "@/lib/tw";
import { useTranslation } from "react-i18next";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { upperFirst } from "lodash";
import { Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";

interface FilmWidgetPlaylistsProps extends React.ComponentPropsWithoutRef<typeof View> {
	mediaId: number;
	slug: string;
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const FilmWidgetPlaylists = ({
	mediaId,
	slug,
	style,
	labelStyle,
	containerStyle,
} : FilmWidgetPlaylistsProps) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const url = `/film/${slug}/playlists` as const;
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
		<View style={tw`flex-row items-center justify-between gap-2`}>
			<Link href={url} style={[tw`font-medium text-lg`, { color: colors.foreground }, labelStyle]}>
			{upperFirst(t('common.messages.playlist', { count: playlists.pages.flat().length }))}
			</Link>
			<Link href={url} style={[{ color: colors.mutedForeground }, tw`text-sm`]}>
				{upperFirst(t('common.messages.show_all'))}
			</Link>
		</View>
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

export default FilmWidgetPlaylists;
