
import FeaturedPlaylists from "@/components/screens/search/FeaturedPlaylists";
import Filters from "@/components/screens/search/Filters";
import ResultPlaylists from "@/components/screens/search/results/ResultPlaylists";
import ResultUsers from "@/components/screens/search/results/ResultUsers";
import { Input } from "@/components/ui/Input";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import useDebounce from "@/hooks/useDebounce";
import tw from "@/lib/tw";
import useSearchStore from "@/stores/useSearchStore";
import { useCallback } from "react";
import { BetterInput } from "@/components/ui/BetterInput";

const SearchScreen = () => {
	const { colors, inset } = useTheme();
	const { search, setSearch, filter } = useSearchStore(state => state);
	const debouncedSearch = useDebounce(search, 350);
	const renderSearch = useCallback(() => {
		if (debouncedSearch) {
			switch (filter) {
				case "movies":
					return <ThemedText>Search for movies: {debouncedSearch}</ThemedText>
				case "tv_series":
					return <ThemedText>Search for tv series: {debouncedSearch}</ThemedText>
				case "persons":
					return <ThemedText>Search for persons: {debouncedSearch}</ThemedText>
				case "playlists":
					return <ResultPlaylists search={debouncedSearch} />
				case "users":
					return <ResultUsers search={debouncedSearch} />
				default:
					return <ThemedText>Search for: {debouncedSearch}</ThemedText>
			}
		} else {
			return <FeaturedPlaylists contentContainerStyle={tw`px-2`}/>
		}
	}, [debouncedSearch, filter]);

	return (
		<ThemedView
		style={[
			{ paddingTop: inset.top },
			tw`flex-1 gap-2`
		]}
		>
			<BetterInput
			value={search}
			onChangeText={setSearch}
			placeholder="Search for movies, tv shows, and people"
			leftIcon="search"
			containerStyle={tw`mx-2`}
			/>
			{debouncedSearch ? (
				<Filters />
			) : null}
			{renderSearch()}
		</ThemedView>
	)
};

export default SearchScreen;