import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistMovieDeleteMutation, useUserWatchlistMovieInsertMutation } from "@/api/users/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@recomendapp/types";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { BottomSheetWatchlistMovieComment } from "@/components/bottom-sheets/sheets/BottomSheetWatchlistMovieComment";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import tw from "@/lib/tw";
import { useUserWatchlistMovieItemQuery } from "@/api/users/userQueries";

interface ButtonUserWatchlistMovieProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

export const ButtonUserWatchlistMovie = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserWatchlistMovieProps
>(({ movie, icon = Icons.Watchlist, variant = "outline", size = "icon", style, onPress: onPressProps, onLongPress: onLongPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const toast = useToast();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const {
		data: watchlist,
	} = useUserWatchlistMovieItemQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});
	// Mutations
	const { mutateAsync: insertWatchlist } = useUserWatchlistMovieInsertMutation();
	const { mutateAsync: deleteWatchlist } = useUserWatchlistMovieDeleteMutation();

	const handleWatchlist = useCallback(async () => {
		if (watchlist) return;
		if (!session || !movie.id) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			return;
		}
		await insertWatchlist({
			userId: session.user.id,
			movieId: movie.id,
		}, {
		  onError: () => {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
		  }
		});
	}, [insertWatchlist, movie.id, session, toast, t, watchlist]);
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
	}, [deleteWatchlist, toast, t, watchlist]);

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
		watchlist?.id && openSheet(BottomSheetWatchlistMovieComment, {
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
ButtonUserWatchlistMovie.displayName = 'ButtonUserWatchlistMovie';

