import { Notification, useNovu } from "@novu/react-native";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { notificationKeys } from "./notificationKeys";
import { Database, NotificationPayload } from "@recomendapp/types";
import { SupabaseClient } from "@/lib/supabase/client";

export type NotificationWithContent = {
	notifications: (Notification & {
		content: Database['public']['Functions']['get_notifications']['Returns'][number] | null;
	})[];
	hasMore: boolean;
	filter: any;
}
export const notificationsOptions = ({
	supabase,
	novu,
	view,
} : {
	supabase: SupabaseClient;
	novu: ReturnType<typeof useNovu>;
	view: 'all' | 'unread' | 'archived';
}) => {
	const PER_PAGE = 20;
	return infiniteQueryOptions({
		queryKey: notificationKeys.list({
			view,
		}),
		queryFn: async ({ pageParam = 1 }): Promise<NotificationWithContent> => {
			// Novu
			const { data } = await novu.notifications.list({
				limit: PER_PAGE,
				offset: (pageParam - 1) * PER_PAGE,
				archived: view === 'archived' ? true : false,
				read: view === 'unread' ? false : undefined,
				useCache: false,
			});
			if (!data) throw new Error('No notifications found');

			const { data: content, error } = await supabase.rpc('get_notifications', {
				notif_list: data.notifications.map((n) => {
					const d = n.data as NotificationPayload;
					return {
						notification_id: n.id,
						id: d?.id,
						type: d?.type,
					};
				}).filter((n) => n.id && n.type),
			});
			if (error) throw error;

			const merged = data.notifications.map((n) => {
				const c = content.find((c) => c.notification_id === n.id);
				return Object.assign(n, { content: c });
			}).filter((n) => n.content);

			return {
				notifications: merged as NotificationWithContent['notifications'],
				hasMore: data.hasMore,
				filter: data.filter,
			};

		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.hasMore ? allPages.length + 1 : undefined;
		},
	});
};