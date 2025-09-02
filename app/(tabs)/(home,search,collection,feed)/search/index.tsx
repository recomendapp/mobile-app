
import { CardMovie } from "@/components/cards/CardMovie";
import { CardPerson } from "@/components/cards/CardPerson";
import { CardPlaylist } from "@/components/cards/CardPlaylist";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import { CardUser } from "@/components/cards/CardUser";
import FeaturedPlaylists from "@/components/screens/search/FeaturedPlaylists";
import { MultiRowHorizontalList } from "@/components/ui/MultiRowHorizontalList";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useSearchMultiQuery } from "@/features/search/searchQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useScrollToTop } from "@react-navigation/native";
import { BestResultsSearchResponse, MediaMovie, MediaPerson, MediaTvSeries, Playlist, User } from "@recomendapp/types";
import { Link } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useRef } from "react";
import { useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const SearchScreen = () => {
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	const renderSearch = useCallback(() => {
		if (debouncedSearch) {
			return <SearchResults search={debouncedSearch} />
		} else {
			return <FeaturedPlaylists contentContainerStyle={tw`px-4`}/>
		}
	}, [debouncedSearch]);

	return renderSearch();
};

interface SearchResultsProps extends React.ComponentPropsWithoutRef<typeof ScrollView> {
	search: string;
};

export const SearchResults = ({ search, ...props } : SearchResultsProps) => {
	const { inset, tabBarHeight } = useTheme();
	const {
		data,
		isLoading,
		isError,
		error,
	} = useSearchMultiQuery({
		query: search,
	});
	const loading = data === undefined || isLoading;
	// REFs
	const scrollRef = useRef<ScrollView>(null);
	useScrollToTop(scrollRef);
	if (loading) return null;
	return (
		<ScrollView
		ref={scrollRef}
		contentContainerStyle={{
			gap: GAP,
			paddingBottom: tabBarHeight + inset.bottom + PADDING_VERTICAL,
		}}
		{...props}
		>
			{data.bestResult && (
				<SearchBestResult best={data.bestResult} />
			)}
			{data.movies.data.length > 0 && (
				<SearchResultsMovies movies={data.movies.data as MediaMovie[]} search={search} />
			)}
			{data.tv_series.data.length > 0 && (
				<SearchResultsTvSeries tvSeries={data.tv_series.data as MediaTvSeries[]} search={search} />
			)}
			{data.persons.data.length > 0 && (
				<SearchResultsPersons persons={data.persons.data as MediaPerson[]} search={search} />
			)}
			{data.playlists.data.length > 0 && (
				<SearchResultsPlaylists playlists={data.playlists.data as Playlist[]} search={search} />
			)}
			{data.users.data.length > 0 && (
				<SearchResultsUsers users={data.users.data as User[]} search={search} />
			)}
		</ScrollView>
	)
};
/* --------------------------------- WIDGETS -------------------------------- */
const SearchBestResult = ({
	best,
} : {
	best: BestResultsSearchResponse['bestResult']
}) => {
	const t = useTranslations();
	const renderBestResult = useCallback(() => {
		if (!best) return null;
		switch (best?.type) {
			case 'movie':
				return <CardMovie variant="list" movie={best.data as MediaMovie} />;
			case 'tv_series':
				return <CardTvSeries variant="list" tvSeries={best.data as MediaTvSeries} />;
			case 'person':
				return <CardPerson variant="list" person={best.data as MediaPerson} />;
			case 'playlist':
				return <CardPlaylist variant="list" playlist={best.data as Playlist} />;
			case 'user':
				return <CardUser variant="list" user={best.data as User} />;
			default:
				return null;
		}
	}, [best]);
	return (
	<View style={{ marginHorizontal: PADDING_HORIZONTAL, gap: GAP }}>
		<Text style={tw`font-semibold text-xl`}>{upperFirst(t('common.messages.top_result'))}</Text>
		{renderBestResult()}
	</View>
	)
};

const SearchResultsMovies = ({
	movies,
	search,
} : {
	movies: MediaMovie[];
	search: string;
}) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width } = useWindowDimensions();
	return (
	<View style={{ gap: GAP }}>
		<Link
		href={{
			pathname: `/search/films`,
			params: {
				query: search,
			},
		}}
		style={{ paddingHorizontal: PADDING_HORIZONTAL }}
		>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.film', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList
		data={movies}
		renderItem={(item) => (
			<CardMovie
			movie={item}
			variant='list'
			/>
		)}
		keyExtractor={(item) => item.id.toString()}
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
		/>
	</View>
	)
};

const SearchResultsTvSeries = ({
	tvSeries,
	search,
} : {
	tvSeries: MediaTvSeries[];
	search: string;
}) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width } = useWindowDimensions();
	return (
	<View style={{ gap: GAP }}>
		<Link
		href={{
			pathname: `/search/tv-series`,
			params: {
				query: search,
			},
		}}
		style={{ paddingHorizontal: PADDING_HORIZONTAL }}
		>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.tv_series', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList
		data={tvSeries}
		renderItem={(item) => (
			<CardTvSeries
			tvSeries={item}
			variant='list'
			/>
		)}
		keyExtractor={(item) => item.id.toString()}
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
		/>
	</View>
	)
};

const SearchResultsPersons = ({
	persons,
	search,
} : {
	persons: MediaPerson[];
	search: string;
}) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width } = useWindowDimensions();
	return (
	<View style={{ gap: GAP }}>
		<Link
		href={{
			pathname: `/search/persons`,
			params: {
				query: search,
			},
		}}
		style={{ paddingHorizontal: PADDING_HORIZONTAL }}
		>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.person', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList
		data={persons}
		renderItem={(item) => (
			<CardPerson
			person={item}
			variant='list'
			/>
		)}
		keyExtractor={(item) => item.id.toString()}
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
		/>
	</View>
	)
};

const SearchResultsPlaylists = ({
	playlists,
	search,
} : {
	playlists: Playlist[];
	search: string;
}) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width } = useWindowDimensions();
	return (
	<View style={{ gap: GAP }}>
		<Link
		href={{
			pathname: `/search/playlists`,
			params: {
				query: search,
			},
		}}
		style={{ paddingHorizontal: PADDING_HORIZONTAL }}
		>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.playlist', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList
		data={playlists}
		renderItem={(item) => (
			<CardPlaylist
			playlist={item}
			variant='list'
			/>
		)}
		keyExtractor={(item) => item.id.toString()}
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
		/>
	</View>
	)
};

const SearchResultsUsers = ({
	users,
	search,
} : {
	users: User[];
	search: string;
}) => {
	const { colors } = useTheme();
	const t = useTranslations();
	const { width } = useWindowDimensions();
	return (
	<View style={{ gap: GAP }}>
		<Link
		href={{
			pathname: `/search/users`,
			params: {
				query: search,
			},
		}}
		style={{ paddingHorizontal: PADDING_HORIZONTAL }}
		>
			<View style={tw`flex-row items-center`}>
				<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
				{upperFirst(t('common.messages.user', { count: 2 }))}
				</Text>
				<Icons.ChevronRight color={colors.mutedForeground} />
			</View>
		</Link>
		<MultiRowHorizontalList
		data={users}
		renderItem={(item) => (
			<CardUser
			user={item}
			variant='list'
			/>
		)}
		keyExtractor={(item) => item.id.toString()}
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
		/>
	</View>
	)
};
/* -------------------------------------------------------------------------- */

export default SearchScreen;