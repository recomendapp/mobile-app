import { CardFeedItem } from "@/components/cards/CardFeedItem";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import UserAvatar from "@/components/user/UserAvatar";
import app from "@/constants/app";
import { Icons } from "@/constants/Icons";
import { useUserFeedCastCrewInfiniteQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { Database } from "@recomendapp/types";
import { Href, Link, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import { Pressable } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";

const CastCrewFeedScreen = () => {
	const t = useTranslations();
	const router = useRouter();
	const { bottomTabHeight, colors } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const { session, customerInfo } = useAuth();
	const {
		data,
		isLoading,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useUserFeedCastCrewInfiniteQuery({
		userId: !!customerInfo?.entitlements.active['premium'] ? session?.user.id : undefined,
	});
	const loading = isLoading || data === undefined;
	const feed = useMemo(() => data?.pages.flat() || [], [data]);

	// Render
	const renderItem = ({ item } : { item: Database['public']['Functions']['get_feed_cast_crew']['Returns'][number], index: number }) => {
		return (
			<View>
				<Text>{item?.person.name}</Text>
			</View>
		);
	};
	const listEmptyComponent = useCallback(() => {
		if (loading) return null;
		return (
			<Text style={tw`text-center`} textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
		)
	}, [loading, t]);
	const keyExtractor = useCallback((item: Database['public']['Functions']['get_feed_cast_crew']['Returns'][number], index: number) => (
		`${item.media.id}:${item.media_type}-${item.person.id}`
	), []);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);

	if (session === undefined || customerInfo === undefined) {
		return (
			<View style={[tw`flex-1 items-center justify-center`, { paddingTop: PADDING_VERTICAL, paddingBottom: bottomTabHeight + PADDING_VERTICAL }]}>
				<Icons.Loader />
			</View>
		)
	}
	if (!customerInfo?.entitlements.active['premium']) {
		return (
			<View style={[tw`flex-1 items-center justify-center gap-2`, { paddingTop: PADDING_VERTICAL, paddingBottom: bottomTabHeight + PADDING_VERTICAL }]}>
				<Button
				onPress={() => router.push({
					pathname: '/upgrade',
					params: {
						feature: app.features.feed_cast_crew,
					}
				})}
				>
					{upperFirst(t('common.messages.upgrade_to_plan', { plan: 'Premium' }))}
				</Button>
			</View>
		)
	}
	return (
	<>
		<LegendList
		data={feed}
		renderItem={renderItem}
		// renderItem={({ item }) => (
		// 	<CardFeedItem
		// 	title={item.media?.title ?? ''}
		// 	posterUrl={item.media?.avatar_url ?? ''}
		// 	posterType={item.media?.media_type}
		// 	onPosterPress={() => router.push(item.media?.url as Href)}
		// 	description={item.media?.extra_data.overview ?? ''}
		// 	content={
		// 		<View style={tw`flex-row items-center gap-1`}>
		// 			<Pressable onPress={() => router.push(item.person?.url as Href)}>
		// 				<UserAvatar avatar_url={item.person?.avatar_url} full_name={item.person?.title ?? ''} style={tw`rounded-md`}/>
		// 			</Pressable>
		// 			<Text textColor="muted">
		// 				{t.rich('pages.feed.cast_and_crew.label', {
		// 					name: item?.person?.title!,
		// 					roles: item?.jobs?.length ? item.jobs.join(', ').toLowerCase() : t('common.messages.unknown'),
		// 					linkPerson: (chunk) => <Link href={item?.person?.url as Href} style={{ color: colors.foreground }}>{chunk}</Link>,
		// 					important: (chunk) => <Text textColor="default">{chunk}</Text>
		// 				})}
		// 			</Text>
		// 		</View>
		// 	}
		// 	onPress={() => router.push(item.media?.url as Href)}
		// 	/>
		// )}
		ListEmptyComponent={listEmptyComponent}
		contentContainerStyle={[
			tw`px-4 gap-1`,
			{
				paddingTop: PADDING_VERTICAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		keyExtractor={keyExtractor}
		showsVerticalScrollIndicator={false}
		refreshing={isRefetching}
		onEndReached={onEndReached}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		onRefresh={refetch}
		/>
	</>
	);
};

export default CastCrewFeedScreen;