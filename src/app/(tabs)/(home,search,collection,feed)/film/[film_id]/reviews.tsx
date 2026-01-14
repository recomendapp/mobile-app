import { ActivityIndicator, Text, View } from "react-native";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { LegendList } from "@legendapp/list";
import { useCallback, useMemo, useState } from "react";
import { CardReviewMovie } from "@/components/cards/reviews/CardReviewMovie";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import { UserReviewMovie } from "@recomendapp/types";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaMovieDetailsQuery, useMediaMovieReviewsQuery } from "@/api/medias/mediaQueries";
import { useUserActivityMovieQuery } from "@/api/users/userQueries";

interface sortBy {
	label: string;
	value: 'updated_at' | 'created_at' | 'likes_count';
}

const FilmReviews = () => {
	const t = useTranslations();
	const router = useRouter();
	const { session } = useAuth();
	const { film_id } = useLocalSearchParams<{ film_id: string }>();
	const { id: movieId } = getIdFromSlug(film_id);
	const { colors, bottomOffset, tabBarHeight } = useTheme();
	const { showActionSheetWithOptions } = useActionSheet();
	// States
	const sortByOptions = useMemo((): sortBy[] => [
		{ label: upperFirst(t('common.messages.date_updated')), value: 'updated_at' },
		{ label: upperFirst(t('common.messages.date_created')), value: 'created_at' },
		{ label: upperFirst(t('common.messages.number_of_likes')), value: 'likes_count' },
	], [t]);
	const [sortBy, setSortBy] = useState<sortBy>(sortByOptions[0]);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	// Requests
	const { data: movie } = useMediaMovieDetailsQuery({ movieId: movieId });
	const {
		data: activity,
	} = useUserActivityMovieQuery({
		userId: session?.user.id,
		movieId: movieId,
	});
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isRefetching,
		refetch,
	} = useMediaMovieReviewsQuery({
		movieId: movieId,
		filters: {
			sortBy: sortBy.value,
			sortOrder,
		}
	});
	const loading = data === undefined || isLoading;
	const reviews = useMemo(() => data?.pages.flat() || [], [data]);
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
	}, [sortByOptions, showActionSheetWithOptions]);
	const handleSortOrderToggle = useCallback(() => {
		setSortOrder((prev) => prev === 'asc' ? 'desc' : 'asc');
	}, []);
	return (
	<>
		<Stack.Screen
		options={{
			headerRight: activity !== undefined ? () => (
				<Button
				variant={"outline"}
				size="icon"
				style={tw`rounded-full`}
				icon={activity?.review ? Icons.Eye : Icons.Edit}
				onPress={() => {
					router.push(`/film/${movie?.slug || movieId}/review/${activity?.review ? activity.review.id : `create`}`);
				}}
				/>
			) : undefined,
			unstable_headerRightItems: session ? (props) => [
				...(activity !== undefined ? [
					{
						type: "button",
						label: activity?.review ? upperFirst(t('common.messages.my_review', { count: 1 })) : upperFirst(t('common.messages.add_review')),
						onPress: () => {
							router.push(`/film/${movie?.slug || movieId}/review/${activity?.review ? activity.review.id : `create`}`);
						},
						icon: {
							name: activity?.review ? "eye" : "pencil",
							type: "sfSymbol",
						},
					}
				] as const : [
					{
						type: "custom",
						element: (
							<ActivityIndicator size={36} />
						)
					}
				] as const),
			] : undefined,
		}}
		/>
		<LegendList
		data={reviews}
		renderItem={useCallback(({ item } : { item: UserReviewMovie }) => (
			<CardReviewMovie
			review={item}
			activity={item.activity!}
			author={item.activity!.user!}
			url={`/film/${movie?.slug || movie?.id}/review/${item.id}`}
			/>
		), [])}
		ListHeaderComponent={
			<View style={tw.style('flex flex-row justify-end items-center gap-2 py-2')}>
				<Button
				icon={sortOrder === 'desc' ? Icons.ArrowDown : Icons.ArrowUp}
				variant="muted"
				size='icon'
				onPress={handleSortOrderToggle}
				/>
				<Button icon={Icons.ChevronDown} variant="muted" onPress={handleSortBy}>{sortBy.label}</Button>
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
		onEndReached={useCallback(() => hasNextPage && fetchNextPage(), [hasNextPage, fetchNextPage])}
		onEndReachedThreshold={0.5}
		contentContainerStyle={{
				paddingHorizontal: PADDING_HORIZONTAL,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
				gap: GAP,
		}}
		maintainVisibleContentPosition={false}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		keyExtractor={useCallback((item: UserReviewMovie) => item.id.toString(), [])}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	</>
	);
};

export default FilmReviews;