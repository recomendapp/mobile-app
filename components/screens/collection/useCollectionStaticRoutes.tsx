import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import CollectionIcon from "./CollectionIcon";
import { Icons } from "@/constants/Icons";
import { capitalize } from "lodash";
import { LinkProps } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

interface CollectionStaticRoute {
	type: 'static';
	icon: React.ReactNode;
	label: string;
	href: LinkProps['href'];
}

const useCollectionStaticRoutes = () => {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const routes: CollectionStaticRoute[] = useMemo(() => [
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
			label: capitalize(t('common.library.collection.watchlist.label')),
			href: '/collection/watchlist',
		},
		{
			type: 'static',
			icon: (
				<CollectionIcon from="#e6619b" to="#e84749">
					<Icons.like color={colors.white} fill={colors.white}  className="w-2/5 h-2/5" />
				</CollectionIcon>
			),
			label: capitalize(t('common.library.collection.likes.label')),
			href: '/collection/likes',
		},
	], [t]);
	return routes;
};

export default useCollectionStaticRoutes;
export type {
	CollectionStaticRoute
}