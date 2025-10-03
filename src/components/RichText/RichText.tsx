import { RichText as RNRichText } from "@10play/tentap-editor";
import { forwardRef, useCallback } from "react";
import { Linking } from "react-native";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import Constants from "expo-constants";
import { Href, useRouter } from "expo-router";

export const RichText = (props: React.ComponentProps<typeof RNRichText>) => {
	const router = useRouter();
	const appDomain = Constants.expoConfig?.extra?.webDomain;

	const handleNavigation = useCallback((request: ShouldStartLoadRequest): boolean => {
		const url = request.url;

		if (url === 'about:blank') return true;

		let linkDomain: string | null = null;
		
		try {
			const link = new URL(url);
			linkDomain = link.hostname.replace(/^www\./, '');
		} catch {}
		
		if (linkDomain && appDomain && linkDomain === appDomain) {
			const path = new URL(url).pathname;
			router.push(path as Href);
		} else {
			Linking.openURL(url);
		}
		
		return false;
	}, []);

	return (
		<RNRichText
		onShouldStartLoadWithRequest={handleNavigation}
		{...props}
		/>
	);
};