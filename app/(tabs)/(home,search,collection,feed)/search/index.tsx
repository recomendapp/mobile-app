
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
import { BestResultsSearchResponse, MediaMovie, MediaPerson, MediaTvSeries, Playlist, Profile } from "@recomendapp/types";
import { Link } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useRef, memo, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const SearchScreen = () => {
	const debouncedSearch = useSearchStore(state => state.debouncedSearch);
	
	const content = useMemo(() => {
		if (debouncedSearch) {
			return <SearchResults search={debouncedSearch} />
		} else {
			return <FeaturedPlaylists contentContainerStyle={tw`px-4`} />
		}
	}, [debouncedSearch]);

	return content;
};
SearchScreen.displayName = 'SearchScreen';

interface SearchResultsProps extends React.ComponentPropsWithoutRef<typeof ScrollView> {
	search: string;
};

export const SearchResults = memo<SearchResultsProps>(({ search, ...props }) => {
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
	const scrollRef = useRef<ScrollView>(null);
	
	useScrollToTop(scrollRef);
	
	if (loading) return null;
	
	return (
		<ScrollView
			ref={scrollRef}
			contentContainerStyle={{ gap: GAP, paddingBottom: tabBarHeight + inset.bottom + PADDING_VERTICAL }}
			keyboardShouldPersistTaps='handled'
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
				<SearchResultsUsers users={data.users.data} search={search} />
			)}
		</ScrollView>
	);
});
SearchResults.displayName = 'SearchResults';
/* --------------------------------- WIDGETS -------------------------------- */
const SearchBestResult = memo(({
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
				return <CardUser variant="list" user={best.data as Profile} />;
			default:
				return null;
		}
	}, [best]);

	return (
		<View style={{ marginHorizontal: PADDING_HORIZONTAL, gap: GAP }}>
			<Text style={tw`font-semibold text-xl`}>
				{upperFirst(t('common.messages.top_result'))}
			</Text>
			{renderBestResult()}
		</View>
	);
});
SearchBestResult.displayName = 'SearchBestResult';

const SearchResultSection = <T,>({
	title,
	data,
	search,
	pathname,
	renderItem,
	keyExtractor
}: {
	title: string;
	data: T[];
	search: string;
	pathname: string;
	renderItem: (item: T) => React.ReactElement;
	keyExtractor: (item: T) => string;
}) => {
	const { colors } = useTheme();
	const { width } = useWindowDimensions();

	return (
		<View style={{ gap: GAP }}>
			<Link
				href={{
					pathname: pathname as any,
					params: { query: search },
				}}
				style={{ paddingHorizontal: PADDING_HORIZONTAL  }}
			>
				<View style={tw`flex-row items-center`}>
					<Text style={tw`font-semibold text-xl`} numberOfLines={1}>
						{title}
					</Text>
					<Icons.ChevronRight color={colors.mutedForeground} />
				</View>
			</Link>
			<MultiRowHorizontalList
				data={data}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={{
					paddingHorizontal: PADDING_HORIZONTAL,
					gap: GAP,
				}}
				columnStyle={{ width: width - ((PADDING_HORIZONTAL * 2) + GAP * 2), gap: GAP }}
				snapToInterval={(width - ((PADDING_HORIZONTAL * 2) + GAP * 2)) + GAP}
				decelerationRate="fast"
			/>
		</View>
	);
};

const SearchResultsMovies = memo(({
	movies,
	search,
} : {
	movies: MediaMovie[];
	search: string;
}) => {
	const t = useTranslations();
	
	const renderItem = useCallback((item: MediaMovie) => (
		<CardMovie movie={item} variant="list" />
	), []);
	
	const keyExtractor = useCallback((item: MediaMovie) => 
		item.id.toString(), []
	);

	return (
		<SearchResultSection<MediaMovie>
			title={upperFirst(t('common.messages.film', { count: 2 }))}
			data={movies}
			search={search}
			pathname="/search/films"
			renderItem={renderItem}
			keyExtractor={keyExtractor}
		/>
	);
});
SearchResultsMovies.displayName = 'SearchResultsMovies';

const SearchResultsTvSeries = memo(({
	tvSeries,
	search,
} : {
	tvSeries: MediaTvSeries[];
	search: string;
}) => {
	const t = useTranslations();
	
	const renderItem = useCallback((item: MediaTvSeries) => (
		<CardTvSeries tvSeries={item} variant="list" />
	), []);
	
	const keyExtractor = useCallback((item: MediaTvSeries) => 
		item.id.toString(), []
	);

	return (
		<SearchResultSection<MediaTvSeries>
			title={upperFirst(t('common.messages.tv_series', { count: 2 }))}
			data={tvSeries}
			search={search}
			pathname="/search/tv-series"
			renderItem={renderItem}
			keyExtractor={keyExtractor}
		/>
	);
});
SearchResultsTvSeries.displayName = 'SearchResultsTvSeries';

const SearchResultsPersons = memo(({
	persons,
	search,
} : {
	persons: MediaPerson[];
	search: string;
}) => {
	const t = useTranslations();
	
	const renderItem = useCallback((item: MediaPerson) => (
		<CardPerson person={item} variant="list" />
	), []);
	
	const keyExtractor = useCallback((item: MediaPerson) => 
		item.id.toString(), []
	);

	return (
		<SearchResultSection<MediaPerson>
			title={upperFirst(t('common.messages.person', { count: 2 }))}
			data={persons}
			search={search}
			pathname="/search/persons"
			renderItem={renderItem}
			keyExtractor={keyExtractor}
		/>
	);
});
SearchResultsPersons.displayName = 'SearchResultsPersons';

const SearchResultsPlaylists = memo(({
	playlists,
	search,
} : {
	playlists: Playlist[];
	search: string;
}) => {
	const t = useTranslations();
	
	const renderItem = useCallback((item: Playlist) => (
		<CardPlaylist playlist={item} variant="list" />
	), []);
	
	const keyExtractor = useCallback((item: Playlist) => 
		item.id.toString(), []
	);

	return (
		<SearchResultSection<Playlist>
			title={upperFirst(t('common.messages.playlist', { count: 2 }))}
			data={playlists}
			search={search}
			pathname="/search/playlists"
			renderItem={renderItem}
			keyExtractor={keyExtractor}
		/>
	);
});
SearchResultsPlaylists.displayName = 'SearchResultsPlaylists';

const SearchResultsUsers = memo(({
	users,
	search,
} : {
	users: Profile[];
	search: string;
}) => {
	const t = useTranslations();
	
	const renderItem = useCallback((item: Profile) => (
		<CardUser user={item} variant="list" />
	), []);
	
	const keyExtractor = useCallback((item: Profile) => 
		item.id!.toString(), []
	);

	return (
		<SearchResultSection<Profile>
			title={upperFirst(t('common.messages.user', { count: 2 }))}
			data={users}
			search={search}
			pathname="/search/users"
			renderItem={renderItem}
			keyExtractor={keyExtractor}
		/>
	);
});
SearchResultsUsers.displayName = 'SearchResultsUsers';
/* -------------------------------------------------------------------------- */

export default SearchScreen;