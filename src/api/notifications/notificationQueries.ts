import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useNovu } from "@novu/react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationsOptions } from "./notificationOptions";

export const useNotificationsQuery = ({
	view,
} : {
	view: 'all' | 'unread' | 'archived';
}) => {
	const novu = useNovu();
	const supabase = useSupabaseClient();
	return useInfiniteQuery(notificationsOptions({
		supabase,
		novu,
		view,
	}))
};