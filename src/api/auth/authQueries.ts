import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { CustomerInfo } from 'react-native-purchases';
import { authCustomerInfoOptions, authUserOptions } from './authOptions';
import { useQuery } from '@tanstack/react-query';

export const useAuthUserQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(authUserOptions({
		supabase,
		userId,
	}))
};

export const useAuthCustomerInfoQuery = ({
	initialData,
	enabled = true,
} : {
	initialData?: CustomerInfo;
	enabled?: boolean;
} = {}) => {
	return useQuery(authCustomerInfoOptions({
		initialData,
		enabled,
	}))
};