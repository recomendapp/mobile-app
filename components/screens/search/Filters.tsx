import { Button, ButtonText } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { useTheme } from "@/context/ThemeProvider";
import tw from "@/lib/tw";
import useSearchStore from "@/stores/useSearchStore";
import { upperFirst } from "lodash";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { FlatList, Pressable } from "react-native-gesture-handler";

interface FiltersProps {
	
}

const Filters = ({

} : FiltersProps) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { filter, setFilter } = useSearchStore(state => state);
	const filters: { label: string, value: typeof filter }[] = useMemo(() => (
		[
			{
				label: "Movies",
				value: "movies"
			},
			{
				label: "TV Series",
				value: "tv_series"
			},
			{
				label: "Playlists",
				value: "playlists"
			},
			{
				label: "Persons",
				value: "persons"
			},
			{
				label: "Users",
				value: "users"
			},
		]
	), [t]);
	return (
		<View>

			<FlatList
			data={filters}
			renderItem={({ item }) => (
				<Button
				variant={item.value === filter ? 'default' : 'outline'}
				style={{ borderRadius: 9999 }}
				onPress={() => setFilter(filter === item.value ? null : item.value)}
				>
					<ButtonText
					variant={item.value === filter ? 'default' : 'outline'}
					>
						{upperFirst(item.label)}
					</ButtonText>
				</Button>
			)}
			keyExtractor={(item) => item.value ?? ''}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={tw`px-2`}
			ItemSeparatorComponent={() => <View style={tw`w-2`} />}
			/>
		</View>

	)
};

export default Filters;