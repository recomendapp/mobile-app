import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_VERTICAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useNotificationArchiveMutation, useNotificationReadMutation, useNotificationUnarchiveMutation, useNotificationUnreadMutation } from "@/api/notifications/notificationMutations";
import ReusableAppleStyleSwipeableRow from "@/components/ui/swippeable/ReusableAppleStyleSwipeableRow";
import { useUIStore } from "@/stores/useUIStore";
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
import { useToast } from "@/components/Toast";
import { useNotificationsQuery } from "@/api/notifications/notificationQueries";

const NotificationsScreen = () => {
	const router = useRouter();
	const t = useTranslations();
	const toast = useToast();
	const { colors, tabBarHeight, bottomOffset } = useTheme();
	const { notificationsView, setNotificationsView } = useUIStore((state) => state);
	const viewOptions = ['all', 'unread', 'archived'] as const;
	const {
		data,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useNotificationsQuery({
		view: notificationsView,
	});
	const loading = isLoading || data === undefined;
	const notifications = useMemo(() => data?.pages.flatMap(page => page.notifications) || [], [data]);

	// Mutations
	const { mutateAsync: archiveMutation} = useNotificationArchiveMutation();
	const { mutateAsync: unarchiveMutation} = useNotificationUnarchiveMutation();
	const { mutateAsync: readMutation} = useNotificationReadMutation();
	const { mutateAsync: unreadMutation} = useNotificationUnreadMutation();

	const handleArchive = useCallback(async (notification: typeof notifications[number]) => {
		await archiveMutation(notification, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.notification_archived', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [archiveMutation, toast, t]);
	const handleUnarchive = useCallback(async (notification: typeof notifications[number]) => {
		await unarchiveMutation(notification, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.notification_unarchived', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [unarchiveMutation, toast, t]);
	const handleRead = useCallback(async (notification: typeof notifications[number]) => {
		await readMutation(notification, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.notification_marked_as_read', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [readMutation, toast, t]);
	const handleUnread = useCallback(async (notification: typeof notifications[number]) => {
		await unreadMutation(notification, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.notification_marked_as_unread', { count: 1 })));
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [unreadMutation, toast, t]);
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
	}, [colors, handleRead]);
	const renderItem = useCallback(({ item }: { item: typeof notifications[number] }) => {
		if (!item.content) return null;
		const leftAction = (() => {
			switch (notificationsView) {
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
			switch (notificationsView) {
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
	}, [renderItemContent, notificationsView, colors, handleArchive, handleUnarchive, handleRead, handleUnread]);

	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
				<View style={[tw`flex-row items-center`]}>
					<Button
					variant="ghost"
					icon={Icons.UserPlus}
					size="icon"
					onPress={() => router.push("/follow-requests")}
					/>
					<Button
					variant="ghost"
					icon={Icons.ChevronDown}
					size="fit"
					iconProps={{ color: colors.mutedForeground }}
					textStyle={tw`text-base font-semibold`}
					onPress={() => setNotificationsView(viewOptions[(viewOptions.indexOf(notificationsView) + 1) % viewOptions.length])}
					>
						{notificationsView === 'all' ? 'All' : notificationsView === 'unread' ? 'Unread' : 'Archived'}
					</Button>
				</View>
			),
			unstable_headerRightItems: (props) => [
				{
					type: "button",
					label: upperFirst(t('common.messages.follow_requests')),
					onPress: () => router.push("/follow-requests"),
					tintColor: props.tintColor,
					icon: {
						name: "person.badge.plus",
						type: "sfSymbol",
					},
				},
				{
					type: "menu",
					variant: "plain",
					label: notificationsView === 'all' ? 'All' : notificationsView === 'unread' ? 'Unread' : 'Archived',
					menu: {
						items: [
							{
								type: 'action',
								label: 'All',
								onPress: () => setNotificationsView('all'),
								icon: {
									name: notificationsView === 'all' ? "checkmark" : "circle",
									type: "sfSymbol",
								},
							},
							{
								type: 'action',
								label: 'Unread',
								onPress: () => setNotificationsView('unread'),
								icon: {
									name: notificationsView === 'unread' ? "checkmark" : "circle",
									type: "sfSymbol",
								},
							},
							{
								type: 'action',
								label: 'Archived',
								onPress: () => setNotificationsView('archived'),
								icon: {
									name: notificationsView === 'archived' ? "checkmark" : "circle",
									type: "sfSymbol",
								},
							},
						]
					}
					
				}
			],
		}}
		/>
		<LegendList
		data={notifications}
		renderItem={renderItem}
		keyExtractor={(item) => item.id.toString()}
		onEndReached={() => hasNextPage && fetchNextPage()}
		contentContainerStyle={[
			{
				gap: GAP,
				paddingBottom: bottomOffset + PADDING_VERTICAL,
			}
		]}
		scrollIndicatorInsets={{ bottom: tabBarHeight }}
		ListEmptyComponent={
			loading ? <Icons.Loader />
			: <Text textColor="muted" style={tw`text-center p-4`}>{upperFirst(t('common.messages.no_notifications'))}</Text>
		}
		/>
	</>
	)
};

export default NotificationsScreen;