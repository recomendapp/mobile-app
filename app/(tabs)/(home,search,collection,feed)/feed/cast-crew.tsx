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
import { Href, Link, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { Pressable } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";
import { useHeaderHeight } from "@react-navigation/elements";

const CastCrewFeedScreen = () => {
	const t = useTranslations();
	const router = useRouter();
	const { bottomTabHeight, colors } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const { user } = useAuth();
	const {
		data: feed,
		isLoading,
		isRefetching,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useUserFeedCastCrewInfiniteQuery({
		userId: user?.id,
		enabled: !!user?.premium,
	});
	const loading = isLoading || feed === undefined;

	if (user === undefined) {
		return (
			<View style={[tw`flex-1 items-center justify-center`, { paddingTop: navigationHeaderHeight + PADDING_VERTICAL, paddingBottom: bottomTabHeight + PADDING_VERTICAL }]}>
				<Icons.Loader />
			</View>
		)
	}
	if (!user?.premium) {
		return (
			<View style={[tw`flex-1 items-center justify-center gap-2`, { paddingTop: navigationHeaderHeight + PADDING_VERTICAL, paddingBottom: bottomTabHeight + PADDING_VERTICAL }]}>
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
		data={feed?.pages.flat() || []}
		renderItem={({ item }) => (
			<CardFeedItem
			title={item.media?.title ?? ''}
			posterUrl={item.media?.avatar_url ?? ''}
			posterType={item.media?.media_type}
			onPosterPress={() => router.push(item.media?.url as Href)}
			description={item.media?.extra_data.overview ?? ''}
			content={
				<View style={tw`flex-row items-center gap-1`}>
					<Pressable onPress={() => router.push(item.person?.url as Href)}>
						<UserAvatar avatar_url={item.person?.avatar_url} full_name={item.person?.title ?? ''} style={tw`rounded-md`}/>
					</Pressable>
					<Text textColor="muted">
						{t.rich('pages.feed.cast_and_crew.label', {
							name: item?.person?.title!,
							roles: item?.jobs?.length ? item.jobs.join(', ').toLowerCase() : t('common.messages.unknown'),
							linkPerson: (chunk) => <Link href={item?.person?.url as Href} style={{ color: colors.foreground }}>{chunk}</Link>,
							important: (chunk) => <Text textColor="default">{chunk}</Text>
						})}
					</Text>
				</View>
			}
			onPress={() => router.push(item.media?.url as Href)}
			/>
		)}
		ListEmptyComponent={() => !loading ? (
			<View style={tw`flex-1 items-center justify-center`}>
				<Text textColor='muted'>{upperFirst(t('common.messages.no_results'))}</Text>
			</View>
		) : null}
		contentContainerStyle={[
			tw`px-4 gap-1`,
			{
				paddingTop: navigationHeaderHeight + PADDING_VERTICAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL
			}
		]}
		keyExtractor={(_, index) => index.toString()}
		estimatedItemSize={feed?.pages.flatMap((page) => page).length}
		showsVerticalScrollIndicator={false}
		refreshing={isRefetching}
		onEndReached={() => hasNextPage && fetchNextPage()}
		onEndReachedThreshold={0.3}
		nestedScrollEnabled
		onRefresh={refetch}
		/>
	</>
	);
};

export default CastCrewFeedScreen;