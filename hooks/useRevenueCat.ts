import { REVENUECAT_API_KEY } from "@/lib/revenue-cat";
import { useCallback, useEffect, useState } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

export const useRevenueCat = (userId?: string) => {
	const [isInitialized, setIsInitialized] = useState(false);

	const login = useCallback(async (userId: string) => {
		const { customerInfo, created } = await Purchases.logIn(userId);
	}, []);

	useEffect(() => {
		const setup = async () => {
			if (__DEV__) {
				Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
			}
			if (!REVENUECAT_API_KEY) {
				throw new Error("RevenueCat API key missing");
			}
			await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
			setIsInitialized(true);
		};

		setup();
	}, []);

	useEffect(() => {
		if (userId && isInitialized) {
			login(userId);
		}
	}, [userId, isInitialized]);
};
