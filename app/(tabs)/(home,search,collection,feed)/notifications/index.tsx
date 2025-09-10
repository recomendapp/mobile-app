import { CardNotificationRecoSentMovie } from "@/components/cards/notifications/CardNotificationRecoSentMovie";
import { CardNotificationRecoSentTvSeries } from "@/components/cards/notifications/CardNotificationRecoSentTvSeries";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useNotificationsInfiniteQuery } from "@/features/utils/utilsQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Notification } from "@novu/react-native";
import { useNotificationArchiveMutation, useNotificationReadMutation, useNotificationUnarchiveMutation, useNotificationUnreadMutation } from "@/features/utils/utilsMutations";
import ReusableAppleStyleSwipeableRow from "@/components/ui/swippeable/ReusableAppleStyleSwipeableRow";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useUIStore } from "@/stores/useUIStore";


const NotificationsScreen = () => {
	const router = useRouter();
	const { colors } = useTheme();
	const view = useUIStore(state => state.notificationsView);
	const setView = useUIStore(state => state.setNotificationsView);
	const viewOptions = ['all', 'unread', 'archived'] as const;
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useNotificationsInfiniteQuery({
		view: view,
	});
	const loading = isLoading || data === undefined;
	const notifications = useMemo(() => data?.pages.flatMap(page => page.notifications) || [], [data]);

	// Mutations
	const archiveMutation = useNotificationArchiveMutation();
	const unarchiveMutation = useNotificationUnarchiveMutation();
	const readMutation = useNotificationReadMutation();
	const unreadMutation = useNotificationUnreadMutation();

	const handleArchive = useCallback(async (notification: typeof notifications[number]) => {
		await archiveMutation.mutateAsync(notification);
	}, [archiveMutation]);
	const handleUnarchive = useCallback(async (notification: typeof notifications[number]) => {
		await unarchiveMutation.mutateAsync(notification);
	}, [unarchiveMutation]);
	const handleRead = useCallback(async (id: string) => {
		await readMutation.mutateAsync(id);
	}, [readMutation]);
	const handleUnread = useCallback(async (id: string) => {
		await unreadMutation.mutateAsync(id);
	}, [unreadMutation]);
	const renderItemContent = useCallback(({ item }: { item: typeof notifications[number] }) => {
		const notif = item.content;
		if (!notif) return null;
		switch (notif.type) {
			case 'reco_sent_movie':
				return <CardNotificationRecoSentMovie sender={notif.content.sender!} movie={notif.content.movie!} onPress={!item.isRead ? () => handleRead(item.id) : undefined} />;
			case 'reco_sent_tv_series':
				return <CardNotificationRecoSentTvSeries sender={notif.content.sender!} tvSeries={notif.content.tv_series!} onPress={!item.isRead ? () => handleRead(item.id) : undefined} />;
			case 'follower_accepted':
				return <View style={[{ backgroundColor: colors.muted}, tw`p-4 rounded-md`]}><Text textColor="muted" style={tw`text-center`}>Follower accepted {notif.content.followee.username}</Text></View>;
			default:
				return <View style={[{ backgroundColor: colors.muted}, tw`p-4 rounded-md`]}><Text textColor="muted" style={tw`text-center`}>Unsupported notification type</Text></View>;
		}
	}, []);
	const renderItem = useCallback(({ item }: { item: typeof notifications[number] }) => {
		if (!item.content) return null;
		const leftAction = (() => {
			switch (view) {
				case 'all':
				case 'unread':
					return {
						label: <Icons.Archive color={colors.accentGreenForeground} />,
						backgroundColor: colors.accentGreen,
						onPress: async () => {
							await handleArchive(item);
						}
					};
				case 'archived':
					return {
						label: <Icons.Unarchive color={colors.accentBlueForeground} />,
						backgroundColor: colors.accentBlue,
						onPress: async () => {
							await handleUnarchive(item);
						}
					};
			}
		})();
		const rightActions = (() => {
			switch (view) {
				case 'all':
				case 'unread':
					return [
						{
							label: item.isRead ? <Icons.EyeOff color={colors.accentBlueForeground} /> : <Icons.Eye color={colors.accentBlueForeground} />,
							backgroundColor: colors.accentBlue,
							onPress: async () => {
								if (item.isRead) {
									await handleUnread(item.id);
								} else {
									await handleRead(item.id);
								}
							}
						}
					];
				case 'archived':
					return undefined;
			}
		})();
		return (
			<ReusableAppleStyleSwipeableRow
			leftAction={leftAction}
			rightActions={rightActions}
			onSwipeableOpen={async (direction) => {
				if (direction === 'right') {
					leftAction?.onPress?.();
				}
			}}
			>
				<GestureDetector gesture={Gesture.Tap().maxDuration(250)}>
					{renderItemContent({ item })}
				</GestureDetector>
				{!item.isRead && <View style={[tw`bg-red-500 rounded-2 w-2 aspect-square left-2`,{ position: 'absolute', top: '50%', transform: [{ translateY: "-50%" }] }]}/>}
			</ReusableAppleStyleSwipeableRow>
		)
	}, [renderItemContent, view, colors, handleArchive, handleUnarchive, handleRead, handleUnread]);
	const keyExtractor = useCallback((item: Notification) => item.id.toString(), []);
	const onEndReached = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, fetchNextPage]);
	const listEmptyComponent = useCallback(() => (
		loading ? <Icons.Loader />
		: <Text textColor="muted" style={tw`text-center p-4`}>No notifications</Text>
	), [loading]);

	return (
	<>
		<Stack.Screen
		options={useMemo(() => ({
			headerRight: () => (
				<Button
				variant="ghost"
				icon={Icons.ChevronDown}
				size="fit"
				iconProps={{ color: colors.mutedForeground }}
				textStyle={tw`text-base font-semibold`}
				onPress={() => setView(viewOptions[(viewOptions.indexOf(view) + 1) % viewOptions.length])}
				>
					{view === 'all' ? 'All' : view === 'unread' ? 'Unread' : 'Archived'}
				</Button>
			),
			// headerRight: () => (
			// 	<Button
			// 	variant="ghost"
			// 	icon={Icons.UserPlus}
			// 	size="icon"
			// 	onPress={() => router.push("/notifications/follow-requests")}
			// 	/>
			// )
		}), [router, view])}
		/>
		<LegendList
		data={notifications}
		renderItem={renderItem}
		keyExtractor={keyExtractor}
		onEndReached={onEndReached}
		contentContainerStyle={[
			{ gap: GAP }
		]}
		ListEmptyComponent={listEmptyComponent}
		/>
	</>
	)
};

export default NotificationsScreen;