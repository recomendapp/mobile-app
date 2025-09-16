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
import { useUIStore } from "@/stores/useUIStore";
import * as Burnt from "burnt";
import { useTranslations } from "use-intl";
import { upperFirst } from "lodash";
import { CardNotificationRecoSentMovie } from "@/components/cards/notifications/CardNotificationRecoSentMovie";
import { CardNotificationRecoSentTvSeries } from "@/components/cards/notifications/CardNotificationRecoSentTvSeries";
import { CardNotificationRecoCompletedMovie } from "@/components/cards/notifications/CardNotificationRecoCompletedMovie";
import { CardNotificationRecoCompletedTvSeries } from "@/components/cards/notifications/CardNotificationRecoCompletedTvSeries";
import { CardNotificationFollowerAccepted } from "@/components/cards/notifications/CardNotificationFollowerAccepted";
import { CardNotificationFollowerCreated } from "@/components/cards/notifications/CardNotificationFollowerCreated";
import { CardNotificationFriendCreated } from "@/components/cards/notifications/CardNotificationFriendCreated";
import { CardNotificationFollowerRequest } from "@/components/cards/notifications/CardNotificationFollowerRequest";

const NotificationsScreen = () => {
	const router = useRouter();
	const t = useTranslations();
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
		await archiveMutation.mutateAsync(notification, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.notification_archived', { count: 1 })),
					preset: 'done',
					haptic: 'success',
				});
			}
		});
	}, [archiveMutation]);
	const handleUnarchive = useCallback(async (notification: typeof notifications[number]) => {
		await unarchiveMutation.mutateAsync(notification, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.notification_unarchived', { count: 1 })),
					preset: 'done',
					haptic: 'success',
				});
			}
		});
	}, [unarchiveMutation]);
	const handleRead = useCallback(async (notification: typeof notifications[number]) => {
		await readMutation.mutateAsync(notification, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.notification_marked_as_read', { count: 1 })),
					preset: 'done',
					haptic: 'success',
				});
			}
		});
	}, [readMutation]);
	const handleUnread = useCallback(async (notification: typeof notifications[number]) => {
		await unreadMutation.mutateAsync(notification, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.notification_marked_as_unread', { count: 1 })),
					preset: 'done',
					haptic: 'success',
				});
			}
		});
	}, [unreadMutation]);
	const renderItemContent = useCallback(({ item }: { item: typeof notifications[number] }) => {
		const notif = item.content;
		const onPress = () => {
			if (!item.isRead) {
				handleRead(item);
			}
		};
		if (!notif || !notif.content) return null;
		switch (notif.type) {
			case 'reco_sent_movie':
				return <CardNotificationRecoSentMovie sender={notif.content.sender!} movie={notif.content.movie!} onPress={onPress} />;
			case 'reco_sent_tv_series':
				return <CardNotificationRecoSentTvSeries sender={notif.content.sender!} tvSeries={notif.content.tv_series!} onPress={onPress} />;
			case 'reco_completed_movie':
				return <CardNotificationRecoCompletedMovie receiver={notif.content.receiver!} movie={notif.content.movie!} onPress={onPress} />;
			case 'reco_completed_tv_series':
				return <CardNotificationRecoCompletedTvSeries receiver={notif.content.receiver!} tvSeries={notif.content.tv_series!} onPress={onPress} />;
			case 'follower_created':
				return <CardNotificationFollowerCreated follower={notif.content.user!} onPress={onPress} />;
			case 'follower_accepted':
				return <CardNotificationFollowerAccepted followee={notif.content.followee!} onPress={onPress} />;
			case 'friend_created':
				return <CardNotificationFriendCreated friend={notif.content.friend!} onPress={onPress} />;
			case 'follower_request':
				return <CardNotificationFollowerRequest notification={notif} follower={notif.content.user!} onPress={onPress} />;
			default:
				return <View style={[{ backgroundColor: colors.muted}, tw`p-4 mx-4`]}><Text textColor="muted" style={tw`text-center`}>Unsupported notification type</Text></View>;
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
									await handleUnread(item);
								} else {
									await handleRead(item);
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
				{renderItemContent({ item })}
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
		: <Text textColor="muted" style={tw`text-center p-4`}>{upperFirst(t('common.messages.no_notifications'))}</Text>
	), [loading]);

	return (
	<>
		<Stack.Screen
		options={useMemo(() => ({
			headerRight: () => (
				<View style={[tw`flex-row items-center`]}>
					<Button
					variant="ghost"
					icon={Icons.UserPlus}
					size="icon"
					onPress={() => router.push("/notifications/follow-requests")}
					/>
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
				</View>
			),
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