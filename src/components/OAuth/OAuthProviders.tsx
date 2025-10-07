import { LegendList, LegendListProps } from "@legendapp/list";
import { Provider as AuthProvider } from "@supabase/supabase-js";
import { Button } from "../ui/Button";
import { Image } from "expo-image";
import { Text } from "../ui/text";
import { GAP } from "@/theme/globals";
import { useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "../Toast";

type Provider = {
	name: AuthProvider;
	label: string;
	img: any;
};


const providers: Provider[] = [
	{
		name: "google",
		label: "Google",
		img: require("@/assets/images/providers/google.png")
	},
	{
		name: 'apple',
		label: 'Apple',
		img: require('@/assets/images/providers/apple.png'),
	},
	{
		name: 'facebook',
		label: 'Facebook',
		img: require('@/assets/images/providers/facebook.png'),
	},
	{
		name: "github",
		label: "GitHub",
		img: require("@/assets/images/providers/github.png"),
	},
]

interface OAuthProvidersProps extends Omit<LegendListProps<Provider>, 'data'> {
	data?: Provider[];
}

export const OAuthProviders = ({
	data = providers,
	numColumns = 2,
	style,
	contentContainerStyle,
	...props 
}: OAuthProvidersProps) => {
	const toast = useToast();
	const { loginWithOAuth } = useAuth();
	const { colors } = useTheme();
	const t = useTranslations();
	const handleProviderPress = useCallback(async (provider: AuthProvider) => {
		try {
			await loginWithOAuth(provider);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === 'cancelled') return;
			}
			toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
		}
	}, [loginWithOAuth, t, toast]);
	return (
		<LegendList
		data={data}
		renderItem={({ item }) => (
			<Button variant='muted' onPress={() => handleProviderPress(item.name)}>
				<Image source={item.img} style={{ width: 18, aspectRatio: 1 }} contentFit="contain" />
				<Text style={{ color: colors.foreground }}>{item.label}</Text>
			</Button>
		)}
		keyExtractor={(item) => item.name}
		numColumns={numColumns}
		style={[{ overflow: 'visible' }, style]}
		contentContainerStyle={[{ gap: GAP }, contentContainerStyle]}
		{...props}
		/>
	);
};