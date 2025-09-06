import { Platform } from "react-native";

export const REVENUECAT_API_KEY = Platform.select({
	ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!,
	android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY!,
});