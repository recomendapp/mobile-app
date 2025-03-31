
import FeaturedPlaylists from "@/components/screens/search/FeaturedPlaylists";
import Filters from "@/components/screens/search/Filters";
import ResultPlaylists from "@/components/screens/search/results/ResultPlaylists";
import { Input } from "@/components/ui/Input";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import useDebounce from "@/hooks/useDebounce";
import tw from "@/lib/tw";
import useSearchStore from "@/stores/useSearchStore";
import { useCallback } from "react";
import { TextInput, View } from "react-native";

const SearchScreen = () => {
	const { colors, inset } = useTheme();
	const { search, setSearch, filter } = useSearchStore(state => state);
	const debouncedSearch = useDebounce(search, 500);
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
					return <ThemedText>Search for users: {debouncedSearch}</ThemedText>
				default:
					return <ThemedText>Search for: {debouncedSearch}</ThemedText>
			}
		} else {
			return <FeaturedPlaylists />
		}
	}, [debouncedSearch, filter]);

	return (
		<ThemedView
		style={[
			{ paddingTop: inset.top },
			tw`flex-1 gap-2`
		]}
		>
			<View
			style={[
				{ backgroundColor: colors.muted },
				tw`flex-row items-center gap-2 rounded-md mx-2`,
			]}
			>
				<Icons.Search color={colors.foreground} size={20} style={tw`my-2 ml-2`} />
				<TextInput
				placeholder="Search for movies, tv shows, and people"
				placeholderTextColor={colors.mutedForeground}
				style={[
					{ color: colors.foreground },
					tw`flex-1 py-2 pr-2`,
				]}
				textAlignVertical="center"

				value={search}
				onChangeText={setSearch}
				/>
			</View>
			{debouncedSearch ? (
				<Filters />
			) : null}
			{renderSearch()}
		</ThemedView>
	)
};

export default SearchScreen;