import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { utilsKey } from "./utilsKey";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { Notification, useNotifications } from "@novu/react-native";
import { Database, NotificationPayload } from "@recomendapp/types";
import { useCallback, useEffect, useState } from "react";

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

export const useNotificationsInfiniteQuery = ({
	archived,
	read
} : {
	archived?: boolean;
	read?: boolean;
}) => {
	const { notifications, isLoading, ...others } = useNotifications({
		archived,
		read,
	});
	const supabase = useSupabaseClient();
	const [notificationsWithContent, setNotificationsWithContent] = useState<Database['public']['Functions']['get_notifications']['Returns']>([]);
	const [loadingContent, setLoadingContent] = useState(false);

	const fetchContentForNotifications = useCallback(async (notifs: Notification[]) => {
		const params = notifs.map((n) => {
			const data = n.data as NotificationPayload;
			if (!data?.id || !data?.type) return null;
			return { notification_id: n.id, id: data.id, type: data.type };
		})
		.filter(Boolean);

		if (!params.length) return [];

		const { data, error } = await supabase.rpc("get_notifications", {
			notif_list: params,
		});
		if (error) throw error;

		return data;
    }, [supabase]);

	const syncNotifications = useCallback(async () => {
		try {
			setLoadingContent(true);
			if (!notifications) return;
			const newNotifs = notifications.filter(n => !notificationsWithContent.find(nc => nc.notification_id === n.id));
			const extraNotifs = notificationsWithContent.filter(nc => !notifications.find(n => n.id === nc.notification_id));
			const newNotifsWithContent = await fetchContentForNotifications(newNotifs);
			setNotificationsWithContent([...notificationsWithContent, ...newNotifsWithContent].filter(nc => !extraNotifs.find(e => e.notification_id === nc.notification_id)));
		} catch (error) {
			console.error("Error syncing notifications:", error);
		} finally {
			setLoadingContent(false);
		}
	}, [fetchContentForNotifications, notifications, notificationsWithContent]);

	useEffect(() => {
		if (notifications) {
			syncNotifications();
		}
	}, [notifications]);

	return {
		notifications: notificationsWithContent,
		isLoading: loadingContent,
		...others,
	}
};