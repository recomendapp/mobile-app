
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
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useSearchStore from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useScrollToTop } from "@react-navigation/native";
import { MediaMovie, MediaPerson, MediaTvSeries, Playlist, Profile } from "@recomendapp/types";
import { Link } from "expo-router";
import { clamp, upperFirst } from "lodash";
import { useRef } from "react";
import { useWindowDimensions, ScrollView, RefreshControl } from "react-native";
import { KeyboardAwareScrollView } from '@/components/ui/KeyboardAwareScrollView';
import { useTranslations } from "use-intl";
import { BestResultItem } from "@recomendapp/api-js";
import ErrorMessage from "@/components/ErrorMessage";
import { KeyboardAwareScrollViewRef, useKeyboardState } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearchMultiQuery } from "@/api/search/searchQueries";

const SearchScreen = () => {
	const search = useSearchStore(state => state.search);

	if (search && search.length > 0) {
		return <SearchResults search={search} />
	}

	return <FeaturedPlaylists contentContainerStyle={tw`px-4`} />
};

interface SearchResultsProps extends React.ComponentPropsWithoutRef<typeof ScrollView> {
	search: string;
};

export const SearchResults = ({ search, ...props } : SearchResultsProps) => {
	const insets = useSafeAreaInsets();
	const { bottomOffset, tabBarHeight } = useTheme();
	const t = useTranslations();
	const {
		isVisible: keyboardVisible,
		height: keyboardHeight,
	} = useKeyboardState((state) => state);


	const {
		data,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useSearchMultiQuery({
		query: search,
	});
	
	const loading = data === undefined || isLoading;
	const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
	
	useScrollToTop(scrollRef);
	
	return (
	<KeyboardAwareScrollView
	ref={scrollRef}
	contentContainerStyle={{
		gap: GAP,
		paddingBottom: bottomOffset + PADDING_VERTICAL,
	}}
	keyboardShouldPersistTaps='handled'
	scrollIndicatorInsets={{
		bottom: keyboardVisible ? (keyboardHeight - insets.bottom) : tabBarHeight,
	}}
	refreshControl={
		<RefreshControl
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	}
	{...props}
	>
		{isError ? (
			<ErrorMessage />
		) : loading ? (
			<Icons.Loader />
		) : (
			<>
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
			{(data.movies.data.length === 0 && data.tv_series.data.length === 0 &&
			data.persons.data.length === 0 && data.playlists.data.length === 0 &&
			data.users.data.length === 0) && (
				isLoading ? <Icons.Loader />
				: search ? (
					<View style={tw`flex-1 items-center justify-center`}>
						<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
					</View>
				) : null
			)}
			</>
		)}
	</KeyboardAwareScrollView>
	);
};

/* --------------------------------- WIDGETS -------------------------------- */
const SearchBestResult = ({
	best,
} : {
	best: BestResultItem;
}) => {
	const t = useTranslations();
	return (
		<View style={{ marginHorizontal: PADDING_HORIZONTAL, gap: GAP }}>
			<Text style={tw`font-semibold text-xl`}>
				{upperFirst(t('common.messages.top_result'))}
			</Text>
			{
				best?.type === 'movie'
					? <CardMovie variant="list" movie={best.data as MediaMovie} />
				: best?.type === 'tv_series'
					? <CardTvSeries variant="list" tvSeries={best.data as MediaTvSeries} />
				: best?.type === 'person'
					? <CardPerson variant="list" person={best.data as MediaPerson} />
				: best?.type === 'playlist'
					? <CardPlaylist variant="list" playlist={best.data as Playlist} />
				: best?.type === 'user'
					? <CardUser variant="list" user={best.data as Profile} />
				: null
			}
		</View>
	);
};

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
	const { width: screenWidth } = useWindowDimensions();
	const width = clamp(screenWidth - ((PADDING_HORIZONTAL * 2) + GAP * 2), 400);

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
				keyboardShouldPersistTaps='handled'
				columnStyle={{ width: width, gap: GAP }}
				snapToInterval={width + GAP}
				decelerationRate="fast"
			/>
		</View>
	);
};

const SearchResultsMovies = ({
	movies,
	search,
} : {
	movies: MediaMovie[];
	search: string;
}) => {
	const t = useTranslations();
	return (
		<SearchResultSection<MediaMovie>
			title={upperFirst(t('common.messages.film', { count: 2 }))}
			data={movies}
			search={search}
			pathname="/search/films"
			renderItem={(item) => <CardMovie movie={item} variant="list" /> }
			keyExtractor={(item) => item.id.toString()}
		/>
	);
};

const SearchResultsTvSeries = ({
	tvSeries,
	search,
} : {
	tvSeries: MediaTvSeries[];
	search: string;
}) => {
	const t = useTranslations();
	return (
		<SearchResultSection<MediaTvSeries>
			title={upperFirst(t('common.messages.tv_series', { count: 2 }))}
			data={tvSeries}
			search={search}
			pathname="/search/tv-series"
			renderItem={(item) => <CardTvSeries tvSeries={item} variant="list" /> }
			keyExtractor={(item) => item.id.toString()}
		/>
	);
};

const SearchResultsPersons = ({
	persons,
	search,
} : {
	persons: MediaPerson[];
	search: string;
}) => {
	const t = useTranslations();
	return (
		<SearchResultSection<MediaPerson>
			title={upperFirst(t('common.messages.person', { count: 2 }))}
			data={persons}
			search={search}
			pathname="/search/persons"
			renderItem={(item) => <CardPerson person={item} variant="list" /> }
			keyExtractor={(item) => item.id.toString()}
		/>
	);
};

const SearchResultsPlaylists = ({
	playlists,
	search,
} : {
	playlists: Playlist[];
	search: string;
}) => {
	const t = useTranslations();
	return (
		<SearchResultSection<Playlist>
			title={upperFirst(t('common.messages.playlist', { count: 2 }))}
			data={playlists}
			search={search}
			pathname="/search/playlists"
			renderItem={(item) => <CardPlaylist playlist={item} variant="list" /> }
			keyExtractor={(item) => item.id.toString()}
		/>
	);
};

const SearchResultsUsers = ({
	users,
	search,
} : {
	users: Profile[];
	search: string;
}) => {
	const t = useTranslations();
	return (
		<SearchResultSection<Profile>
			title={upperFirst(t('common.messages.user', { count: 2 }))}
			data={users}
			search={search}
			pathname="/search/users"
			renderItem={(item) => <CardUser user={item} variant="list" /> }
			keyExtractor={(item) => item.id!.toString()}
		/>
	);
};
/* -------------------------------------------------------------------------- */

export default SearchScreen;