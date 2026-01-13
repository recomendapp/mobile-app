import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistTvSeriesDeleteMutation, useUserWatchlistTvSeriesInsertMutation } from "@/api/users/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { BottomSheetWatchlistTvSeriesComment } from "@/components/bottom-sheets/sheets/BottomSheetWatchlistTvSeriesComment";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import tw from "@/lib/tw";
import { useUserWatchlistTvSeriesItemQuery } from "@/api/users/userQueries";

interface ButtonUserWatchlistTvSeriesProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

export const ButtonUserWatchlistTvSeries = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserWatchlistTvSeriesProps
>(({ tvSeries, icon = Icons.Watchlist, variant = "outline", size = "icon", style, onPress: onPressProps, onLongPress: onLongPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const toast = useToast();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const {
		data: watchlist,
	} = useUserWatchlistTvSeriesItemQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id,
	});

	const { mutateAsync: insertWatchlist } = useUserWatchlistTvSeriesInsertMutation();
	const { mutateAsync: deleteWatchlist } = useUserWatchlistTvSeriesDeleteMutation();

	const handleWatchlist = useCallback(async () => {
		if (watchlist) return;
		if (!session || !tvSeries.id) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await insertWatchlist({
			userId: session.user.id,
			tvSeriesId: tvSeries.id,
		}, {
		  onError: () => {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
		  }
		});
	}, [insertWatchlist, tvSeries.id, session, toast, t, watchlist]);
	const handleUnwatchlist = useCallback(async () => {
		if (!watchlist) return;
		if (!watchlist.id) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await deleteWatchlist({
		  watchlistId: watchlist.id,
		}, {
		  onError: () => {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
		  }
		});
	}, [deleteWatchlist, watchlist, toast, t]);

	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
		onPress={async (e) => {
			if (session) {
				if (watchlist) {
					await handleUnwatchlist()
				} else {
					await handleWatchlist()
				}
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
			onPressProps?.(e);
		}}
		onLongPress={(e) => {
			watchlist?.id && openSheet(BottomSheetWatchlistTvSeriesComment, {
				watchlistItem: watchlist
			});
			onLongPressProps?.(e);
		}}
		iconProps={{
			fill: watchlist ? colors.foreground : 'transparent',
			...iconProps
		}}
		style={{
			...tw`rounded-full`,
			...style,
		}}
		{...props}
		/>
	)
});
ButtonUserWatchlistTvSeries.displayName = 'ButtonUserWatchlistTvSeries';
