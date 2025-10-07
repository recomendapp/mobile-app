import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistTvSeriesItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistTvSeriesDeleteMutation, useUserWatchlistTvSeriesInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { BottomSheetWatchlistTvSeriesComment } from "@/components/bottom-sheets/sheets/BottomSheetWatchlistTvSeriesComment";
import { useToast } from "@/components/Toast";

interface ButtonUserWatchlistTvSeriesProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

export const ButtonUserWatchlistTvSeries = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserWatchlistTvSeriesProps
>(({ tvSeries, icon = Icons.Watchlist, variant = "ghost", size = "fit", onPress: onPressProps, onLongPress: onLongPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const toast = useToast();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
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
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await insertWatchlist.mutateAsync({
			userId: session.user.id,
			tvSeriesId: tvSeries.id,
		}, {
		  onError: () => {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
		  }
		});
	};
	const handleUnwatchlist = async () => {
		if (!watchlist) return;
		if (!watchlist.id) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await deleteWatchlist.mutateAsync({
		  watchlistId: watchlist.id,
		}, {
		  onError: () => {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
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
		onLongPress={(e) => {
			watchlist?.id && openSheet(BottomSheetWatchlistTvSeriesComment, {
				watchlistItem: watchlist
			});
			onLongPressProps?.(e);
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
