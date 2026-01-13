import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { MediaTvSeries } from "@recomendapp/types";
import tw from "@/lib/tw";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import BottomSheetRating from "@/components/bottom-sheets/sheets/BottomSheetRating";
import { useUserActivityTvSeriesInsertMutation, useUserActivityTvSeriesUpdateMutation } from "@/api/users/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserActivityTvSeriesQuery } from "@/api/users/userQueries";

interface ButtonUserActivityTvSeriesRatingProps
	extends Omit<React.ComponentProps<typeof Button>, 'icon'> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserActivityTvSeriesRating = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityTvSeriesRatingProps
>(({ tvSeries, variant = "outline", style, onPress: onPressProps, iconProps, ...props }, ref) => {
	const { session } = useAuth();
	const { colors } = useTheme();
	const toast = useToast();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	// Requests
	const {
		data: activity,
	} = useUserActivityTvSeriesQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id,
	});
	// Mutations
	const { mutateAsync: insertActivity } = useUserActivityTvSeriesInsertMutation();
	const { mutateAsync: updateActivity } = useUserActivityTvSeriesUpdateMutation();
	// Handlers
	const handleRate = useCallback(async (rating: number) => {
		if (!session) return;
		if (activity) {
			await updateActivity({
				activityId: activity.id,
				rating: rating,
			}, {
				onError: () => {
					toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		} else {
			await insertActivity({
				userId: session.user.id,
				tvSeriesId: tvSeries.id,
				rating: rating,
			}, {
				onError: () => {
					toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		}
	}, [activity, insertActivity, tvSeries.id, session, toast, t, updateActivity]);
	const handleUnrate = useCallback(async () => {
		if (activity?.review) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: 'You cannot unrate a media with a review.' });
			return;
		}
		await updateActivity({
			activityId: activity!.id!,
			rating: null,
		}, {
			onError: () => {
				toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [activity, toast, t, updateActivity]);

	return (
		<Button
		ref={ref}
		variant={variant}
		iconProps={iconProps}
		size={activity?.rating ? 'default' : 'icon'}
		icon={!activity?.rating ? Icons.Star : undefined}
		onPress={(e) => {
			if (session) {
				openSheet(BottomSheetRating, {
					media: {
						title: tvSeries.name || '',
						imageUrl: getTmdbImage({ path: tvSeries?.poster_path, size: 'w342' }) || '',
						type: 'tv_series',
					},
					onRatingChange: async (rating) => {
						if (rating === null) {
							await handleUnrate();
						} else {
							await handleRate(rating);
						}
					},
					rating: activity?.rating || null,
				});
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
		style={{
			...(!activity?.rating ? tw`rounded-full` : { backgroundColor: colors.accentYellowForeground, borderColor: colors.accentYellow }),
			...style,
		}}
		{...props}
		>
			{activity?.rating ? (
				<Text style={[tw`font-bold`, { color: colors.accentYellow }]}>{activity.rating}</Text>
			) : null}
		</Button>
	);
});
ButtonUserActivityTvSeriesRating.displayName = 'ButtonUserActivityTvSeriesRating';

export default ButtonUserActivityTvSeriesRating;
