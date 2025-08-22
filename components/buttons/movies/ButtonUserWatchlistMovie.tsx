import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistMovieItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistMovieDeleteMutation, useUserWatchlistMovieInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@/types/type.db";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface ButtonUserWatchlistMovieProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

const ButtonUserWatchlistMovie = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserWatchlistMovieProps
>(({ movie, icon = Icons.Watchlist, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: watchlist,
		isLoading,
		isError,
	} = useUserWatchlistMovieItemQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});

	const insertWatchlist = useUserWatchlistMovieInsertMutation();
	const deleteWatchlist = useUserWatchlistMovieDeleteMutation();

	const handleWatchlist = async () => {
		if (watchlist) return;
		if (!session || !movie.id) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		}
		await insertWatchlist.mutateAsync({
			userId: session.user.id,
			movieId: movie.id,
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
ButtonUserWatchlistMovie.displayName = 'ButtonUserWatchlistMovie';

export default ButtonUserWatchlistMovie;
