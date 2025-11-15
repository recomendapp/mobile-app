import { useMemo } from "react";
import CollectionIcon from "./CollectionIcon";
import { Icons } from "@/constants/Icons";
import { capitalize } from "lodash";
import { LinkProps } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslations } from "use-intl";

interface CollectionStaticRoute {
	type: 'static';
	icon: React.ReactNode;
	label: string;
	href: LinkProps['href'];
}

const useCollectionStaticRoutes = () => {
	const t = useTranslations();
	const { colors } = useTheme();
	const routes = useMemo((): CollectionStaticRoute[] => [
		{
			type: 'static',
			icon: (
				<CollectionIcon from="#FBE773" to="#F18E43">
					<Icons.Reco color={colors.white} fill={colors.white} className="w-2/5 h-2/5" />
				</CollectionIcon>
			),
			label: capitalize(t('common.messages.my_recos')),
			href: '/collection/my-recos',
		},
		{
			type: 'static',
			icon: (
				<CollectionIcon from="#39BAED" to="#32509e">
					<Icons.Watchlist color={colors.white} fill={colors.white}  className="w-2/5 h-2/5" />
				</CollectionIcon>
			),
			label: capitalize(t('common.messages.watchlist')),
			href: '/collection/watchlist',
		},
		{
			type: 'static',
			icon: (
				<CollectionIcon from="#e6619b" to="#e84749">
					<Icons.like color={colors.white} fill={colors.white}  className="w-2/5 h-2/5" />
				</CollectionIcon>
			),
			label: capitalize(t('common.messages.heart_pick', { count: 2 })),
			href: '/collection/heart-picks',
		},
	], [t, colors]);
	return routes;
};

export default useCollectionStaticRoutes;
export type {
	CollectionStaticRoute
}