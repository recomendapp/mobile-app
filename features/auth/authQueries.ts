import { useQuery } from "@tanstack/react-query"
import { authKeys } from "./authKeys"
import Purchases, { CustomerInfo } from "react-native-purchases"

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
}