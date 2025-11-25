import { LegendList, LegendListProps } from "@legendapp/list";
import { Provider as AuthProvider } from "@supabase/supabase-js";
import { Button } from "../ui/Button";
import { Text } from "../ui/text";
import { GAP } from "@/theme/globals";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { useToast } from "../Toast";
import { Icons } from "@/constants/Icons";
import { BrandIcon, BrandIconProps } from "@/lib/icons";
import { logger } from "@/logger";

type Provider = {
	name: AuthProvider;
	label: string;
	icon: { component: BrandIcon, variant?: BrandIconProps['variant'] };
};

interface OAuthProvidersProps extends Omit<LegendListProps<Provider>, 'data' | 'children'> {
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
			icon: { component: Icons.brands.google }
		},
		{
			name: 'apple',
			label: 'Apple',
			icon: { component: Icons.brands.apple, variant: mode }
		},
		{
			name: 'facebook',
			label: 'Facebook',
			icon: { component: Icons.brands.facebook }
		},
		{
			name: "github",
			label: "GitHub",
			icon: { component: Icons.brands.github, variant: mode }
		},
	]), [mode, data]);

	const handleProviderPress = useCallback(async (provider: AuthProvider) => {
		try {
			await loginWithOAuth(provider);
			logger.metric('account:loggedInWithOAuth', { logContext: 'LoginForm', provider });
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === 'cancelled') return;
			}
			toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			logger.error('oauth login error', { error, provider });
		}
	}, [loginWithOAuth, t, toast]);

	const renderItem = useCallback(({ item }: { item: Provider }) => (
		<Button variant='muted' onPress={() => handleProviderPress(item.name)}>
			<item.icon.component width={18} height={18} variant={item.icon.variant} />
			<Text style={{ color: colors.foreground }}>{item.label}</Text>
		</Button>
	), [handleProviderPress, colors.foreground]);

	return (
		<LegendList
		data={providers}
		renderItem={renderItem}
		keyExtractor={(item) => item.name}
		numColumns={numColumns}
		style={[{ overflow: 'visible' }, style]}
		contentContainerStyle={[{ gap: GAP }, contentContainerStyle]}
		{...props}
		/>
	);
};