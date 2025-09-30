import { authKeys } from "@/features/auth/authKeys";
import { REVENUECAT_API_KEY } from "@/lib/revenue-cat";
import { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import Purchases, { CustomerInfo, LOG_LEVEL } from "react-native-purchases";

export const useRevenueCat = (session: Session | null | undefined) => {
  const queryClient = useQueryClient();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>(undefined);
	const [isInitialized, setIsInitialized] = useState(false);
  
  const init = useCallback(async (userId: string) => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }
    if (!REVENUECAT_API_KEY) {
      throw new Error("RevenueCat API key missing");
    }
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });
    setIsInitialized(true);
  }, []);
	const login = useCallback(async (userId: string) => {
		const { customerInfo, created } = await Purchases.logIn(userId);
		setCustomerInfo(customerInfo);
	}, []);

  useEffect(() => {
    if (!isInitialized && session?.user.id) {
      init(session?.user.id).catch(console.error);
      return;
    }
    if (session?.user.id) {
      login(session.user.id);
      queryClient.invalidateQueries({
        queryKey: authKeys.customerInfo(),
      });
    } else {
      queryClient.setQueryData(authKeys.customerInfo(), null);
      setCustomerInfo(undefined);
    }
  }, [session, isInitialized]);

  return { customerInfo, isInitialized, login };
};
