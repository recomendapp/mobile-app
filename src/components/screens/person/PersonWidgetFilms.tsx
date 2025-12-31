import tw from "@/lib/tw";
import { useWindowDimensions, View } from "react-native";
import { clamp, upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { CardMovie } from "@/components/cards/CardMovie";
import { Database } from "@recomendapp/types";
import { MultiRowHorizontalList } from "@/components/ui/MultiRowHorizontalList";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";
import { useMemo } from "react";
import { useMediaPersonFilmsQuery } from "@/api/medias/mediaQueries";

interface PersonWidgetFilmsProps extends React.ComponentPropsWithoutRef<typeof View> {
	personId: number;
	url: Href;
}

const PersonWidgetFilms = ({
	personId,
	url,
	style,
} : PersonWidgetFilmsProps) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width: screenWidth } = useWindowDimensions();
	const width = useMemo(() => clamp(screenWidth - ((PADDING_HORIZONTAL * 2) + GAP * 2), 400), [screenWidth]);
	const {
		data: movies,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = useMediaPersonFilmsQuery({
		personId,
		filters: {
			sortBy: 'release_date',
			sortOrder: 'desc',
		}
	});
	const loading = movies === undefined || isLoading;
	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={url} style={{ paddingHorizontal: PADDING_HORIZONTAL }}>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.film', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList<{ media_movie: Database['public']['Views']['media_movie']['Row'] }>
		key={loading ? 'loading' : 'movie'}
		data={loading ? new Array(3).fill(null) : movies?.pages.flat()}
		renderItem={(item) => (
			!loading ? (
				<CardMovie variant="list" movie={item.media_movie} />
			) : (
				<CardMovie variant="list" skeleton />
			)
		)}
		ListEmptyComponent={
			<Text style={[tw``, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_films'))}
			</Text>
		}
		keyExtractor={(item, index) => loading ? index.toString() : item.media_movie.id.toString()}
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

export default PersonWidgetFilms;
