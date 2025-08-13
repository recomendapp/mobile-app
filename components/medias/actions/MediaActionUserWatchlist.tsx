import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserWatchlistDeleteMutation, useUserWatchlistInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

const ICON_SIZE = 24;

interface MediaActionUserWatchlistProps
	extends React.ComponentProps<typeof Button> {
		media: Media;
	}

const MediaActionUserWatchlist = React.forwardRef<
	React.ComponentRef<typeof Button>,
	MediaActionUserWatchlistProps
>(({ media, icon = Icons.Watchlist, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: watchlist,
		isLoading,
		isError,
	} = useUserWatchlistItemQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});

	const insertWatchlist = useUserWatchlistInsertMutation({
		userId: user?.id,
	});
	const deleteWatchlist = useUserWatchlistDeleteMutation();

	const handleWatchlist = async () => {
		if (watchlist) return;
		if (!user || !media.media_id) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				preset: 'error',
				haptic: 'error',
			});
		}
		await insertWatchlist.mutateAsync({
		  	userId: user?.id,
			mediaId: media.media_id,
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
MediaActionUserWatchlist.displayName = 'MediaActionUserWatchlist';

export default MediaActionUserWatchlist;
