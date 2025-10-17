import { useQuery } from "@tanstack/react-query"
import { authKeys } from "./authKeys"
import Purchases, { CustomerInfo } from "react-native-purchases"
import { useSupabaseClient } from "@/providers/SupabaseProvider";

export const useAuthUser = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery({
		queryKey: authKeys.user(),
		queryFn: async () => {
			if (!userId) return null;
			const { data, error } = await supabase
				.from('user')
				.select('*')
				.eq('id', userId)
				.single();
			if (error) throw error;
			return data;	
		},
		enabled: !!userId,
	});
};

export const useAuthCustomerInfo = ({
	initialData,
	enabled = true,
} : {
	initialData?: CustomerInfo;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: authKeys.customerInfo(),
		queryFn: async () => {
			return await Purchases.getCustomerInfo();
		},
		retry: 3,
		retryOnMount: true,
		initialData,
		enabled,
	})
};
