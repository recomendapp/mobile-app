import { CardNotificationRecoSent } from "@/components/cards/notifications/CardNotificationRecoSent";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useNotificationsInfiniteQuery } from "@/features/utils/utilsQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import { GAP, PADDING_HORIZONTAL } from "@/theme/globals";
import { LegendList } from "@legendapp/list";
import { Database } from "@recomendapp/types";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

type NotificationType = Database['public']['Functions']['get_notifications']['Returns'][number];

const NotificationsScreen = () => {
	const router = useRouter();
	const { colors } = useTheme();
	const viewOptions = ['all', 'unread', 'archived'] as const;
	const [view, setView] = useState<'all' | 'unread' | 'archived'>(viewOptions[0]);
	const {
		notifications,
		isLoading,
		fetchMore,
		hasMore,
		refetch,
		error
	} = useNotificationsInfiniteQuery({
		archived: view === 'archived' ? true : undefined,
		read: view === 'unread' ? false : undefined,
	});

	const renderItem = useCallback(({ item }: { item: NotificationType }) => {
		switch (item.type) {
			case 'reco_sent_movie':
				return <CardNotificationRecoSent sender={item.content.sender!} movie={item.content.movie!} />;
			case 'follower_accepted':
				return <View style={[{ backgroundColor: colors.muted}, tw`p-4 rounded-md`]}><Text textColor="muted" style={tw`text-center`}>Follower accepted {item.content.followee.username}</Text></View>;
			default:
				return <View style={[{ backgroundColor: colors.muted}, tw`p-4 rounded-md`]}><Text textColor="muted" style={tw`text-center`}>Unsupported notification type</Text></View>;
		}
	}, []);
	const keyExtractor = useCallback((item: NotificationType) => item.notification_id.toString(), []);
	const onEndReached = useCallback(() => {
		if (hasMore) {
			fetchMore();
		}
	}, [hasMore, fetchMore]);

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
			{ paddingHorizontal: PADDING_HORIZONTAL, gap: GAP }
		]}
		/>
	</>
	)
};

export default NotificationsScreen;