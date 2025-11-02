import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { queryOptions } from '@tanstack/react-query'
import { Keys } from '../keys';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export const AuthUserOptions = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return queryOptions({
		queryKey: Keys.auth.user(),
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

export const AuthCustomerInfoOptions = ({
	initialData,
	enabled = true,
} : {
	initialData?: CustomerInfo;
	enabled?: boolean;
} = {}) => {
	return queryOptions({
		queryKey: Keys.auth.customerInfo(),
		queryFn: async () => {
			return await Purchases.getCustomerInfo();
		},
		retry: 3,
		retryOnMount: true,
		initialData,
		enabled,
	})
};