import { LegendList, LegendListProps } from "@legendapp/list";
import { Provider as AuthProvider } from "@supabase/supabase-js";
import { Button } from "../ui/Button";
import { Image } from "expo-image";
import { Text } from "../ui/text";
import { GAP } from "@/theme/globals";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "../Toast";
import { Assets } from "@/constants/Assets";

type Provider = {
	name: AuthProvider;
	label: string;
	img: any;
};

interface OAuthProvidersProps extends Omit<LegendListProps<Provider>, 'data'> {
	data?: Provider[];
}

export const OAuthProviders = ({
	data,
	numColumns = 2,
	style,
	contentContainerStyle,
	...props 
}: OAuthProvidersProps) => {
	const toast = useToast();
	const { loginWithOAuth } = useAuth();
	const { colors, mode } = useTheme();
	const t = useTranslations();

	const providers = useMemo((): Provider[] => data || ([
		{
			name: "google",
			label: "Google",
			img: Assets.brands.google.colored,
		},
		{
			name: 'apple',
			label: 'Apple',
			img: mode === 'dark' ? Assets.brands.apple.dark : Assets.brands.apple.light,
		},
		{
			name: 'facebook',
			label: 'Facebook',
			img: Assets.brands.facebook.colored,
		},
		{
			name: "github",
			label: "GitHub",
			img: mode === 'dark' ? Assets.brands.github.dark : Assets.brands.github.light,
		},
	]), [mode]);

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
		data={providers}
		renderItem={({ item }) => (
			<Button variant='muted' onPress={() => handleProviderPress(item.name)}>
				<Image source={{ uri: item.img }} style={{ width: 18, aspectRatio: 1 }} contentFit="contain" />
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