import { Button } from "@/components/ui/Button";
import tw from "@/lib/tw";
import useSearchStore from "@/stores/useSearchStore";
import { upperFirst } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const Filters = () => {
	const t = useTranslations();
	const { filter, setFilter } = useSearchStore(state => state);
	const ref = useRef<FlatList>(null);
	const filters: { label: string, value: typeof filter }[] = useMemo(() => (
		[
			{
				label: upperFirst(t('common.messages.film', { count: 2 })),
				value: "movies"
			},
			{
				label: upperFirst(t('common.messages.tv_series', { count: 2 })),
				value: "tv_series"
			},
			{
				label: upperFirst(t('common.messages.playlist', { count: 2 })),
				value: "playlists"
			},
			{
				label: upperFirst(t('common.messages.person', { count: 2 })),
				value: "persons"
			},
			{
				label: upperFirst(t('common.messages.user', { count: 2 })),
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