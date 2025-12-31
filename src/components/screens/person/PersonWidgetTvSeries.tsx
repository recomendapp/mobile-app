import tw from "@/lib/tw";
import { useWindowDimensions, View } from "react-native";
import { clamp, upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { Database } from "@recomendapp/types";
import { MultiRowHorizontalList } from "@/components/ui/MultiRowHorizontalList";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import { useMemo } from "react";
import { useMediaPersonTvSeriesQuery } from "@/api/medias/mediaQueries";

interface PersonWidgetTvSeriesProps extends React.ComponentPropsWithoutRef<typeof View> {
	personId: number;
	url: Href;
}

const PersonWidgetTvSeries = ({
	personId,
	url,
	style,
} : PersonWidgetTvSeriesProps) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width: screenWidth } = useWindowDimensions();
	const width = useMemo(() => clamp(screenWidth - ((PADDING_HORIZONTAL * 2) + GAP * 2), 400), [screenWidth]);
	const {
		data: tvSeries,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = useMediaPersonTvSeriesQuery({
		personId,
		filters: {
			sortBy: 'last_appearance_date',
			sortOrder: 'desc',
		}
	});
	const loading = tvSeries === undefined || isLoading;
	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={url} style={{ paddingHorizontal: PADDING_HORIZONTAL }}>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.tv_series', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList<{ media_tv_series: Database['public']['Views']['media_tv_series']['Row'] }>
		key={loading ? 'loading' : 'tv_series'}
		data={loading ? new Array(3).fill(null) : tvSeries?.pages.flat()}
		renderItem={(item) => (
			!loading ? (
				<CardTvSeries variant="list" tvSeries={item.media_tv_series} />
			) : (
				<CardTvSeries variant="list" skeleton />
			)
		)}
		ListEmptyComponent={
			<Text style={[tw``, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_tv_series'))}
			</Text>
		}
		keyExtractor={(item, index) => loading ? index.toString() : item.media_tv_series.id.toString()}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			gap: GAP,
		}}
		columnStyle={{
			width: width,
			gap: GAP,
		}}
		snapToInterval={width + GAP}
		decelerationRate={"fast"}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		/>
	</View>
	);
};

export default PersonWidgetTvSeries;
