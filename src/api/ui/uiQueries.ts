import { useQuery } from "@tanstack/react-query";
import { uiBackgroundsOptions } from "./uiOptions";
import { useSupabaseClient } from "@/providers/SupabaseProvider";

export const useUIBackgroundsQuery = () => {
	const supabase = useSupabaseClient();
	return useQuery(uiBackgroundsOptions({
		supabase,
	}))
};