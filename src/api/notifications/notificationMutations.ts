import { useNovu } from "@novu/react-native";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationWithContent } from "./notificationOptions";
import { notificationKeys } from "./notificationKeys";

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
			await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
			const previousData = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				queryKey: notificationKeys.list(),
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
			await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
			const previousData = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				queryKey: notificationKeys.list(),
			});

			previousData.forEach(([key, oldData]) => {
				if (!oldData) return;
				const view = (key[1] as 'all' | 'unread' | 'archived' | undefined) || 'all';

				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;
					const newPages = currentData.pages.map((page) => {
						if (view === 'all') {
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
		mutationFn: async (notification: NotificationWithContent['notifications'][number]) => {
			const { data, error } = await novu.notifications.read({
				notificationId: notification.id,
			});
			if (error) throw error;
			return data;
		},
		onMutate: async (notification: NotificationWithContent['notifications'][number]) => {
			await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
			const previousData = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				queryKey: notificationKeys.list(),
			});

			previousData.forEach(([key, oldData]) => {
				if (!oldData) return;
				const view = (key[1] as 'all' | 'unread' | 'archived' | undefined) || 'all';

				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;

					const newPages = currentData.pages.map((page) => {
						let notifs = page.notifications.map((n) =>
							n.id === notification.id ? { ...n, isRead: true } : n
						);

						if (view === 'unread') {
							notifs = notifs.filter((n) => n.id !== notification.id);
						}

						return { ...page, notifications: notifs };
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
export const useNotificationUnreadMutation = () => {
	const queryClient = useQueryClient();
	const novu = useNovu();
	return useMutation({
		mutationFn: async (notification: NotificationWithContent['notifications'][number]) => {
			const { data, error } = await novu.notifications.unread({
				notificationId: notification.id,
			});
			if (error) throw error;
			return data;
		},
		onMutate: async (notification: NotificationWithContent['notifications'][number]) => {
			await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
			const previousData = queryClient.getQueriesData<InfiniteData<NotificationWithContent>>({
				queryKey: notificationKeys.list(),
			});

			previousData.forEach(([key, oldData]) => {
				if (!oldData) return;
				const view = (key[1] as 'all' | 'unread' | 'archived' | undefined) || 'all';

				queryClient.setQueryData(key, (currentData: InfiniteData<NotificationWithContent> | undefined) => {
					if (!currentData) return currentData;

					const newPages = currentData.pages.map((page) => {
						let notifs = page.notifications.map((n) =>
							n.id === notification.id ? { ...n, isRead: false } : n
						);

						if (view === 'unread') {
							const exists = notifs.find(n => n.id === notification.id);
							if (!exists) {
								notifs.push(Object.assign(notification, { isRead: false }));
								notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
							}
						}
						return { ...page, notifications: notifs };
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