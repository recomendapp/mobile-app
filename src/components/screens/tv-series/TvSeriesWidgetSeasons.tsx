import tw from "@/lib/tw";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeriesSeason } from "@recomendapp/types";
import { ThemedText } from "@/components/ui/ThemedText";
import { CardTvSeriesSeason } from "@/components/cards/CardTvSeriesSeason";
import { useTranslations } from "use-intl";

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
	const t = useTranslations();

	if (!seasons.length) return null;

	return (
	<View style={[tw`gap-1`, style]}>
		<ThemedText style={[tw`font-medium text-lg`, labelStyle]}>
			{upperFirst(t('common.messages.tv_season', { count: seasons.length }))}
			<ThemedText style={[{ color: colors.mutedForeground }, tw`font-medium text-sm`]}>
				{` ${seasons.length}`}
			</ThemedText>
		</ThemedText>
		<LegendList
		data={seasons}
		renderItem={({ item }) => (
			<CardTvSeriesSeason key={item.id} season={item} style={tw`w-32`} />
		)}
		snapToInterval={136}
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
