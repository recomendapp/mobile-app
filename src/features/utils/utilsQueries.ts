import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { utilsKey } from "./utilsKey";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Notification, useNovu } from "@novu/react-native";
import { Database, NotificationPayload } from "@recomendapp/types";

export const useNovuSubscriberHash = (subscriberId?: string) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: utilsKey.novuSubscriberHash(subscriberId!),
		queryFn: async () => {
			if (!subscriberId) throw new Error('No subscriberId provided');
			const { data, error } = await supabase
				.functions.invoke('novu/subscriber/hash', {
					body: {
						subscriberId: subscriberId,
					}
				});
			if (error) throw error;
			return data?.hash as string;
		},
		enabled: !!subscriberId,
		staleTime: Infinity,
		gcTime: Infinity,
		retry: 3,
		retryOnMount: true,
	})
};


/* ------------------------------ NOTIFICATIONS ----------------------------- */
export type NotificationWithContent = {
	notifications: (Notification & {
		content: Database['public']['Functions']['get_notifications']['Returns'][number] | null;
	})[];
	hasMore: boolean;
	filter: any;
}
export const useNotificationsInfiniteQuery = ({
	view,
	filters,
} : {
	view: 'all' | 'unread' | 'archived';
	filters?: {
		perPage?: number;
	}
}) => {
	const novu = useNovu();
	const supabase = useSupabaseClient();

	const mergedFilters = {
		perPage: 20,
		...filters,
	}
	return useInfiniteQuery({
		queryKey: utilsKey.notifications({
			view,
			filters: mergedFilters,
		}),
		queryFn: async ({ pageParam = 1 }): Promise<NotificationWithContent> => {
			// Novu
			const { data } = await novu.notifications.list({
				limit: mergedFilters.perPage,
				offset: (pageParam - 1) * mergedFilters.perPage,
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

/* -------------------------------------------------------------------------- */


// export const useNotificationsInfiniteQuery = ({
//   archived,
//   read,
// }: {
//   archived?: boolean;
//   read?: boolean;
// }) => {
// 	const novu = useNovu();
// 	const ok = await novu.notifications.list({
// 		limit: 1,offset
// 	})

//   const { notifications, isLoading, ...others } = useNotifications({
//     archived,
//     read,
//   });
//   const supabase = useSupabaseClient();
//   const [notificationsWithContent, setNotificationsWithContent] =
//     useState<NotificationWithContent[]>([]);
//   const [loadingContent, setLoadingContent] = useState(false);

//   const fetchContentForNotifications = useCallback(
//     async (notifs: Notification[]) => {
//       const params = notifs
//         .map((n) => {
//           const data = n.data as NotificationPayload;
//           if (!data?.id || !data?.type) return null;
//           return { notification_id: n.id, id: data.id, type: data.type };
//         })
//         .filter(Boolean);

//       if (!params.length) return [];

//       const { data, error } = await supabase.rpc("get_notifications", {
//         notif_list: params,
//       });
//       if (error) throw error;

//       return data;
//     },
//     [supabase]
//   );

//   const syncNotifications = useCallback(async () => {
//     try {
//       setLoadingContent(true);
//       if (!notifications) return;

//       const newNotifs = notifications.filter(
//         (n) => !notificationsWithContent.find((nc) => nc.id === n.id)
//       );

//       const newNotifsWithContent = await fetchContentForNotifications(newNotifs);

//       const merged = [
//         ...notificationsWithContent,
//         ...newNotifsWithContent.map((nc) => {
//           const notif = notifications.find(
//             (n) => n.id === nc.notification_id
//           )!;
//           return Object.assign(notif, { content: nc });
//         }),
//       ]
//         .filter((nc) => notifications.some((n) => n.id === nc.id))
//         .sort(
//           (a, b) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         );

//       setNotificationsWithContent(merged);
//     } catch (error) {
//       console.error("Error syncing notifications:", error);
//     } finally {
//       setLoadingContent(false);
//     }
//   }, [fetchContentForNotifications, notifications, notificationsWithContent]);

//   useEffect(() => {
//     if (notifications) {
//       syncNotifications();
//     }
//   }, [notifications]);

//   return {
//     notifications: notificationsWithContent,
//     isLoading: loadingContent,
//     ...others,
//   };
// };