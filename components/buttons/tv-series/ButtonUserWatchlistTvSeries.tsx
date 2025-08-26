import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistTvSeriesItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistTvSeriesDeleteMutation, useUserWatchlistTvSeriesInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface ButtonUserWatchlistTvSeriesProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserWatchlistTvSeries = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserWatchlistTvSeriesProps
>(({ tvSeries, icon = Icons.Watchlist, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: watchlist,
		isLoading,
		isError,
	} = useUserWatchlistTvSeriesItemQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id,
	});

	const insertWatchlist = useUserWatchlistTvSeriesInsertMutation();
	const deleteWatchlist = useUserWatchlistTvSeriesDeleteMutation();

	const handleWatchlist = async () => {
		if (watchlist) return;
		if (!session || !tvSeries.id) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		}
		await insertWatchlist.mutateAsync({
			userId: session.user.id,
			tvSeriesId: tvSeries.id,
		}, {
		  onError: () => {
			Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		  }
		});
	};
	const handleUnwatchlist = async () => {
		if (!watchlist) return;
		if (!watchlist.id) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		}
		await deleteWatchlist.mutateAsync({
		  watchlistId: watchlist.id,
		}, {
		  onError: () => {
			Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		  }
		});
	};

	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
		onPress={() => {
			if (session) {
				watchlist ? handleUnwatchlist() : handleWatchlist();
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
			onPressProps?.();
		}}
		iconProps={{
			fill: watchlist ? colors.foreground : undefined,
			size: ICON_ACTION_SIZE,
			...iconProps
		}}
		{...props}
		/>
	)
});
ButtonUserWatchlistTvSeries.displayName = 'ButtonUserWatchlistTvSeries';

export default ButtonUserWatchlistTvSeries;
