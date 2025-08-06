import React from "react"
import { Pressable } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery, useUserWatchlistItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserWatchlistDeleteMutation, useUserWatchlistInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import * as Haptics from "expo-haptics";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";

const ICON_SIZE = 24;

interface MediaActionUserWatchlistProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserWatchlist = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserWatchlistProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { session, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: activity,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});
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
		<Pressable
		ref={ref}
		onPress={() => {
			if (session) {
				if (process.env.EXPO_OS === 'ios') {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				}
				watchlist ? handleUnwatchlist() : handleWatchlist();
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
		}}
		disabled={
			session ? (
				isLoading || isError || watchlist === undefined || insertWatchlist.isPending || deleteWatchlist.isPending
			) : false
		}

		{...props}
		>
		{isError ? (
			<AlertCircleIcon color={colors.destructive} size={ICON_SIZE} />
		) : (
			<Icons.Watchlist color={colors.foreground} fill={watchlist ? colors.foreground : undefined} size={ICON_SIZE} />
		)}
		</Pressable>
	);
});
MediaActionUserWatchlist.displayName = 'MediaActionUserWatchlist';

export default MediaActionUserWatchlist;
