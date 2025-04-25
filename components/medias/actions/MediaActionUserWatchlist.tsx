import React from "react"
import { Pressable } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { useUserActivityQuery, useUserWatchlistItemQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserWatchlistDeleteMutation, useUserWatchlistInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/context/ThemeProvider";
import { Media } from "@/types/type.db";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

const ICON_SIZE = 30;

interface MediaActionUserWatchlistProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserWatchlist = React.forwardRef<
	React.ElementRef<typeof Pressable>,
	MediaActionUserWatchlistProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();
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
				title: upperFirst(t('common.errors.an_error_occurred')),
				preset: 'error',
			});
		}
		await insertWatchlist.mutateAsync({
		  	userId: user?.id,
			mediaId: media.media_id,
		}, {
		  onError: () => {
			Burnt.toast({
				title: upperFirst(t('common.errors.an_error_occurred')),
				preset: 'error',
			});
		  }
		});
	};
	const handleUnwatchlist = async () => {
		if (!watchlist) return;
		if (!watchlist.id) {
			return Burnt.toast({
				title: upperFirst(t('common.errors.an_error_occurred')),
				preset: 'error',
			});
		}
		await deleteWatchlist.mutateAsync({
		  watchlistId: watchlist.id,
		}, {
		  onError: () => {
			Burnt.toast({
				title: upperFirst(t('common.errors.an_error_occurred')),
				preset: 'error',
			});
		  }
		});
	};

	return (
		<Pressable
		ref={ref}
		onPress={() => {
			if (process.env.EXPO_OS === 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			watchlist ? handleUnwatchlist() : handleWatchlist();
		}}
		disabled={isLoading || isError || watchlist === undefined || insertWatchlist.isPending || deleteWatchlist.isPending}
		style={[
			{ opacity: isLoading || watchlist === undefined ? 0.5 : 1 },
		]}
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
