import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

export const REVENUECAT_API_KEY = Platform.select({
	ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!,
	android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY!,
});

let revenueCatInitialized: Promise<void> | null = null;
export const initializeRevenueCat = () => {
	if (!revenueCatInitialized) {
		revenueCatInitialized = (async () => {
			if (!REVENUECAT_API_KEY) throw new Error("RevenueCat API key missing");
			if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
			await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
		})();
	}
	return revenueCatInitialized;
};
