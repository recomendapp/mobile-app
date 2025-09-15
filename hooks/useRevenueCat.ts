import { REVENUECAT_API_KEY } from "@/lib/revenue-cat";
import { useCallback, useEffect, useState } from "react";
import Purchases, { CustomerInfo, LOG_LEVEL } from "react-native-purchases";

export const useRevenueCat = (userId?: string) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>(undefined);
	const [isInitialized, setIsInitialized] = useState(false);
  
  const init = useCallback(async () => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }
    if (!REVENUECAT_API_KEY) {
      throw new Error("RevenueCat API key missing");
    }
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    setIsInitialized(true);
  }, []);
	const login = useCallback(async (userId: string) => {
		const { customerInfo, created } = await Purchases.logIn(userId);
		setCustomerInfo(customerInfo);
	}, []);

	useEffect(() => {
    init().catch(console.error);
	}, []);

	useEffect(() => {
		if (userId && isInitialized) {
			login(userId);
		}
	}, [userId, isInitialized]);

  return { customerInfo, isInitialized, login };
};
