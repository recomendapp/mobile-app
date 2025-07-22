import tw from "@/lib/tw";
import { useTranslation } from "react-i18next";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaPlaylistsInfiniteQuery } from "@/features/media/mediaQueries";
import { MediaTvSeriesSeason } from "@/types/type.db";
import { ThemedText } from "@/components/ui/ThemedText";

interface TvSeriesWidgetSeasonsProps extends React.ComponentPropsWithoutRef<typeof View> {
	seasons: MediaTvSeriesSeason[];
	labelStyle?: StyleProp<TextStyle>;
	containerStyle?: StyleProp<ViewStyle>;
}

const TvSeriesWidgetSeasons = ({
	seasons,
	style,
	labelStyle,
	containerStyle,
} : TvSeriesWidgetSeasonsProps) => {
	const { colors } = useTheme();
	const { t } = useTranslation();

	if (!seasons.length) return null;

	return (
	<View style={[tw`gap-1`, style]}>
		<ThemedText style={[tw`font-medium text-lg`, labelStyle]}>
			{upperFirst(t('common.messages.season', { count: seasons.length }))}
			<ThemedText style={[{ color: colors.mutedForeground }, tw`font-medium text-sm`]}>
				{` ${seasons.length}`}
			</ThemedText>
		</ThemedText>
		<LegendList
		data={seasons}
		renderItem={({ item }) => (
			<View key={item.id}>
				<ThemedText>{item.title}</ThemedText>
			</View>
		// <CardPlaylist key={item.id} playlist={item} style={tw`w-36`} />
		)}
		snapToInterval={152}
		decelerationRate="fast"
		keyExtractor={(item) => item.id!.toString()}
		horizontal
		showsHorizontalScrollIndicator={false}
		ItemSeparatorComponent={() => <View style={tw`w-2`} />}
		contentContainerStyle={containerStyle}
		nestedScrollEnabled
		/>
	</View>
	);
};

export default TvSeriesWidgetSeasons;
