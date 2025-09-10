import { Notification, useNovu } from "@novu/react-native";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { utilsKey } from "./utilsKey";
import { NotificationWithContent } from "./utilsQueries";


/* ------------------------------ NOTIFICATIONS ----------------------------- */
export const useNotificationArchiveMutation = () => {
	const queryClient = useQueryClient();
	const novu = useNovu();
	return useMutation({
		mutationFn: async (notification: NotificationWithContent['notifications'][number]) => {
			const { data, error } = await novu.notifications.archive({
				notificationId: notification.id,
			});
			if (error) throw error;
			return data;
		},
		onMutate: async (notification: NotificationWithContent['notifications'][number]) => {
			await queryClient.cancelQueries({ queryKey: utilsKey.notifications() });
			const previousData = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				queryKey: utilsKey.notifications(),
			});

			previousData.forEach(([key, oldData]) => {
				if (!oldData) return;
				const view = (key[1] as 'all' | 'unread' | 'archived' | undefined) || 'all';

				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;
					const newPages = currentData.pages.map((page) => {
						if (view === 'all' || view === 'unread') {
							return { ...page, notifications: page.notifications.filter(n => n.id !== notification.id) };
						}
						if (view === 'archived') {
							const notifs = page.notifications.filter(n => n.id !== notification.id);
							notifs.push(Object.assign(notification, { isRead: true, isArchived: true }));
							notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
							return { ...page, notifications: notifs };
						}
						return page;
					});
					return { ...currentData, pages: newPages };
				});
			});

			return { previousData };
		},
		onError: (err, variables, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([key, oldData]) => {
					queryClient.setQueryData(key, oldData);
				});
			}
		},
	});
};
export const useNotificationUnarchiveMutation = () => {
	const queryClient = useQueryClient();
	const novu = useNovu();
	return useMutation({
		mutationFn: async (notification: NotificationWithContent['notifications'][number]) => {
			const { data, error } = await novu.notifications.unarchive({
				notificationId: notification.id,
			});
			if (error) throw error;
			return data;
		},
		onMutate: async (notification: NotificationWithContent['notifications'][number]) => {
			await queryClient.cancelQueries({ queryKey: utilsKey.notifications() });
			const previousData = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				queryKey: utilsKey.notifications(),
			});

			previousData.forEach(([key, oldData]) => {
				if (!oldData) return;
				const view = (key[1] as 'all' | 'unread' | 'archived' | undefined) || 'all';

				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;
					const newPages = currentData.pages.map((page) => {
						if (view === 'all' || view === 'unread') {
							const notifs = page.notifications.filter(n => n.id !== notification.id);
							notifs.push(Object.assign(notification, { isArchived: false }));
							notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
							return { ...page, notifications: notifs };
						}
						if (view === 'archived') {
							return { ...page, notifications: page.notifications.filter(n => n.id !== notification.id) };
						}
						return page;
					});
					return { ...currentData, pages: newPages };
				});
			});

			return { previousData };
		},
		onError: (err, variables, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([key, oldData]) => {
					queryClient.setQueryData(key, oldData);
				});
			}
		},
	});
};
export const useNotificationReadMutation = () => {
	const queryClient = useQueryClient();
	const novu = useNovu();
	return useMutation({
		mutationFn: async (notificationId: string) => {
			const { data, error } = await novu.notifications.read({
				notificationId: notificationId,
			});
			if (error) throw error;
			return data;
		},
		onSuccess: (_, notificationId) => {
			// Optimistic update
			const baseKey = utilsKey.notifications();
			const notificationsQueries = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				predicate: (query) => {
					const key = query.queryKey;
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				},
			});
			notificationsQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;
					const newPages = currentData.pages.map((page) => {
						const newNotifications = page.notifications.map((n) => {
							if (n.id === notificationId) {
								return { ...n, isRead: true };
							}
							return n;
						});
						return { ...page, notifications: newNotifications };
					});
					return { ...currentData, pages: newPages };
				});
			});
		},
	});
};
export const useNotificationUnreadMutation = () => {
	const queryClient = useQueryClient();
	const novu = useNovu();
	return useMutation({
		mutationFn: async (notificationId: string) => {
			const { data, error } = await novu.notifications.unread({
				notificationId: notificationId,
			});
			if (error) throw error;
			return data;
		},
		onSuccess: (_, notificationId) => {
			// Optimistic update
			const baseKey = utilsKey.notifications();
			const notificationsQueries = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				predicate: (query) => {
					const key = query.queryKey;
					return Array.isArray(key) && baseKey.every((v, i) => v === key[i]);
				},
			});
			notificationsQueries.forEach(([key, oldData]) => {
				if (!oldData) return;
				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;
					const newPages = currentData.pages.map((page) => {
						const newNotifications = page.notifications.map((n) => {
							if (n.id === notificationId) {
								return { ...n, isRead: false };
							}
							return n;
						});
						return { ...page, notifications: newNotifications };
					});
					return { ...currentData, pages: newPages };
				});
			});
		},
	});
};
/* -------------------------------------------------------------------------- */