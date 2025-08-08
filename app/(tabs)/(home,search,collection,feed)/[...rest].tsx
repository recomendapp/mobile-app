import { Redirect, RelativePathString, useLocalSearchParams } from "expo-router";
import NotFoundScreen from "./+not-found";
import { SupportedLocale, supportedLocales } from "@/translations/locales";

const RestScreen = () => {
  	const { rest, ...params } = useLocalSearchParams<{ rest: string[] }>();

	const shouldRedirect = (routes: string[]) => {
		const firstIsLocale = supportedLocales.includes(routes[0] as SupportedLocale);
		if (!firstIsLocale) return null;
		let lastLocaleIndex = -1;
		for (let i = 0; i < routes.length; i++) {
			if (supportedLocales.includes(routes[i] as SupportedLocale)) {
				lastLocaleIndex = i;
			} else {
				break;
			}
		}
		const newPath = routes.slice(lastLocaleIndex + 1).join('/');
		if (newPath === '') return '/';
		return `/${newPath}` as RelativePathString;
	};
	const redirect = shouldRedirect(rest);

	if (redirect) {
		return <Redirect href={{ pathname: redirect, params: params }} />;
	}
	
	return <NotFoundScreen />;
};

export default RestScreen;