import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import useSearchStore from "@/stores/useSearchStore";
import { upperFirst } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

interface FiltersProps {
	
}

const Filters = ({

} : FiltersProps) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { filter, setFilter } = useSearchStore(state => state);
	const ref = useRef<FlatList>(null);
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

	const [ orderedFilters, setOrderedFilters ] = useState(filters);

	useEffect(() => {
		if (filter) {
			const ordered = filters.filter(f => f.value === filter).concat(filters.filter(f => f.value !== filter));
			setOrderedFilters(ordered);
		} else {
			setOrderedFilters(filters);
		}
	}, [filter, filters]);

	return (
		<View>

			<FlatList
			ref={ref}
			data={orderedFilters}
			renderItem={({ item }) => (
				<Button
				variant={item.value === filter ? 'default' : 'outline'}
				style={{ borderRadius: 9999 }}
				onPress={() => {
					setFilter(filter === item.value ? null : item.value)
					if (ref.current) {
						ref.current.scrollToIndex({
							index: 0,
							animated: true,
						});
					}
				}}
				>
					{upperFirst(item.label)}
				</Button>
			)}
			keyExtractor={(item) => item.value ?? ''}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={tw`px-4`}
			ItemSeparatorComponent={() => <View style={tw`w-2`} />}
			/>
		</View>

	)
};

export default Filters;