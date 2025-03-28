
import FeaturedPlaylists from "@/components/screens/search/FeaturedPlaylists";
import { Input } from "@/components/ui/Input";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import useDebounce from "@/hooks/useDebounce";
import tw from "@/lib/tw";
import { useState } from "react";
import { TextInput, View } from "react-native";

const SearchScreen = () => {
	const { colors, inset } = useTheme();
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 500);
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
				tw`flex-row items-center gap-2 rounded-md`,
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
				<>
				</>
			) : (
				<>
				<FeaturedPlaylists />
				</>
			)}
		</ThemedView>
	)
};

export default SearchScreen;