import tw from "@/lib/tw";
import { StyleProp, TextStyle, useWindowDimensions, View, ViewStyle } from "react-native";
import { LegendList } from "@legendapp/list";
import { upperFirst } from "lodash";
import { Href, Link } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useMediaPersonFilmsInfiniteQuery, useMediaPlaylistsMovieInfiniteQuery } from "@/features/media/mediaQueries";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { CardMovie } from "@/components/cards/CardMovie";
import { MediaMovie } from "@recomendapp/types";
import { MultiRowHorizontalList } from "@/components/ui/MultiRowHorizontalList";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";

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
	const { width } = useWindowDimensions();
	const {
		data: movies,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = useMediaPersonFilmsInfiniteQuery({
		personId,
	});
	const loading = movies === undefined || isLoading;
	return (
	<View style={[tw`gap-1`, style]}>
		<Link href={url} style={{ paddingHorizontal: PADDING_HORIZONTAL }}>
			<View style={tw`flex-row items-center`}>
				<ThemedText style={tw`font-medium text-lg`} numberOfLines={1}>
					{upperFirst(t('common.messages.film', { count: 2 }))}
				</ThemedText>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList<{ movie: MediaMovie }>
		key={loading ? 'loading' : 'movie'}
		data={loading ? new Array(3).fill(null) : movies?.pages.flat()}
		renderItem={(item) => (
			!loading ? (
				<CardMovie variant="list" movie={item.movie} />
			) : (
				<CardMovie variant="list" skeleton />
			)
		)}
		ListEmptyComponent={
			<Text style={[tw``, { color: colors.mutedForeground }]}>
				{upperFirst(t('common.messages.no_films'))}
			</Text>
		}
		keyExtractor={(item, index) => loading ? index.toString() : item.movie.id.toString()}
		contentContainerStyle={{
			paddingHorizontal: PADDING_HORIZONTAL,
			gap: GAP,
		}}
		columnStyle={{
			width: width - ((PADDING_HORIZONTAL * 2) + GAP * 2),
			gap: GAP,
		}}
		snapToInterval={(width - ((PADDING_HORIZONTAL * 2) + GAP * 2)) + GAP}
		decelerationRate={"fast"}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.5}
		/>
	</View>
	);
};

export default PersonWidgetFilms;
