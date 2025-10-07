import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistMovieItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistMovieDeleteMutation, useUserWatchlistMovieInsertMutation, useUserWatchlistMovieUpdateMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { BottomSheetWatchlistMovieComment } from "@/components/bottom-sheets/sheets/BottomSheetWatchlistMovieComment";
import { useToast } from "@/components/Toast";
interface ButtonUserWatchlistMovieProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

export const ButtonUserWatchlistMovie = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserWatchlistMovieProps
>(({ movie, icon = Icons.Watchlist, variant = "ghost", size = "fit", onPress: onPressProps, onLongPress: onLongPressProps, iconProps, ...props }, ref) => {
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
	} = useUserWatchlistMovieItemQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});
	// Mutations
	const insertWatchlist = useUserWatchlistMovieInsertMutation();
	const deleteWatchlist = useUserWatchlistMovieDeleteMutation();

	const handleWatchlist = async () => {
		if (watchlist) return;
		if (!session || !movie.id) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await insertWatchlist.mutateAsync({
			userId: session.user.id,
			movieId: movie.id,
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
		watchlist?.id && openSheet(BottomSheetWatchlistMovieComment, {
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
ButtonUserWatchlistMovie.displayName = 'ButtonUserWatchlistMovie';

