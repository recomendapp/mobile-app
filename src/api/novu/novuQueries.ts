import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useQuery } from "@tanstack/react-query";
import { novuSubscriberHashOptions } from "./novuOptions";

export const useNovuSubscriberHashQuery = ({
	subscriberId,
}: {
	subscriberId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(novuSubscriberHashOptions({ supabase, subscriberId }));
};