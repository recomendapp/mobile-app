import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native"
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { LegendList } from "@legendapp/list";
import { CardMovie } from "@/components/cards/CardMovie";
import tw from "@/lib/tw";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "@/components/ui/text";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useMediaPersonDetailsQuery, useMediaPersonFilmsQuery } from "@/api/medias/mediaQueries";

interface sortBy {
	label: string;
	value: 'release_date' | 'vote_average';
}

const PersonFilmsScreen = () => {
	const t = useTranslations();
	const { width: SCREEN_WIDTH } = useWindowDimensions();
	const { person_id } = useLocalSearchParams<{ person_id: string }>();
	const { id: personId } = getIdFromSlug(person_id);
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions = useMemo((): sortBy[] => [
		{ label: upperFirst(t('common.messages.release_date')), value: 'release_date' },
		{ label: upperFirst(t('common.messages.vote_average')), value: 'vote_average' },
	], [t]);
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	// Queries
	const { data: person } = useMediaPersonDetailsQuery({ personId });
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaPersonFilmsQuery({
		personId: personId,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = useMemo(() => data === undefined || isLoading, [data, isLoading]);
	const movies = useMemo(() => data?.pages.flat() || [], [data]);
	// Handlers
	const handleSortBy = useCallback(() => {
		const sortByOptionsWithCancel = [
			...sortByOptions,
			{ label: upperFirst(t('common.messages.cancel')), value: 'cancel' },
		];
		const cancelIndex = sortByOptionsWithCancel.length - 1;
		showActionSheetWithOptions({
			options: sortByOptionsWithCancel.map((option) => option.label),
			disabledButtonIndices: sortByOptions ? [sortByOptionsWithCancel.findIndex(option => option.value === sortBy.value)] : [],
			cancelButtonIndex: cancelIndex,
		}, (selectedIndex) => {
			if (selectedIndex === undefined || selectedIndex === cancelIndex) return;
			setSortBy(sortByOptionsWithCancel[selectedIndex] as sortBy);
		});
	}, [sortByOptions, showActionSheetWithOptions, sortBy.value, t]);
	return (
	<>
		<Stack.Screen
		options={{
			title: person?.name || '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.film', { count: 2 }))}</HeaderTitle>,
		}}
		/>
		<LegendList
		data={movies}
		renderItem={useCallback(({ item } : { item: typeof movies[number] }) => (
			<CardMovie
			variant="poster"
			movie={item.media_movie}
			style={tw`w-full`}
			/>
		), [])}
		ListHeaderComponent={
			<View style={tw`flex flex-row justify-end items-center gap-2 py-2`}>
				<Button
				icon={sortOrder === 'desc' ? Icons.ArrowDown : Icons.ArrowUp}
				variant="muted"
				size='icon'
				onPress={() => setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc')}
				/>
				<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>
					{sortBy.label}
				</Button>
			</View>
		}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: (
				<View style={tw`flex-1 items-center justify-center p-4`}>
					<Text style={[tw`text-center`, { color: colors.mutedForeground }]}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			) 
		}
		numColumns={
			SCREEN_WIDTH < 360 ? 2 :
			SCREEN_WIDTH < 414 ? 3 :
			SCREEN_WIDTH < 600 ? 4 :
			SCREEN_WIDTH < 768 ? 5 : 6
		}
		onEndReached={useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage])}
		onEndReachedThreshold={0.5}
		contentContainerStyle={{
			gap: GAP,
			paddingHorizontal: PADDING_HORIZONTAL,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={useCallback((item: typeof movies[number]) => item.media_movie.id.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default PersonFilmsScreen;