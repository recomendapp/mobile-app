import { queryOptions } from '@tanstack/react-query'
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { authKeys } from './authKeys';
import { SupabaseClient } from '@/lib/supabase/client';

export const authUserOptions = ({
	supabase,
	userId,
} : {
	supabase: SupabaseClient;
	userId?: string;
}) => {
	return queryOptions({
		queryKey: authKeys.user(),
		queryFn: async () => {
			if (!userId) throw new Error('userId is required');
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

export const authCustomerInfoOptions = ({
	initialData,
	enabled = true,
} : {
	initialData?: CustomerInfo;
	enabled?: boolean;
} = {}) => {
	return queryOptions({
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