import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityTvSeriesQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { MediaTvSeries } from "@/types/type.db";
import tw from "@/lib/tw";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";
import { IconMediaRating } from "@/components/medias/IconMediaRating";
import BottomSheetRating from "@/components/bottom-sheets/sheets/BottomSheetRating";
import { useUserActivityTvSeriesInsertMutation, useUserActivityTvSeriesUpdateMutation } from "@/features/user/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import * as Burnt from "burnt";

interface ButtonUserActivityTvSeriesRatingProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserActivityTvSeriesRating = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityTvSeriesRatingProps
>(({ tvSeries, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	// Requests
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityTvSeriesQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id,
	});
	// Mutations
	const insertActivity = useUserActivityTvSeriesInsertMutation();
	const updateActivity = useUserActivityTvSeriesUpdateMutation();
	// Handlers
	const handleRate = async (rating: number) => {
		if (!session) return;
		if (activity) {
			await updateActivity.mutateAsync({
				activityId: activity.id,
				rating: rating,
			}, {
				onError: () => {
					Burnt.toast({
						title: upperFirst(t('common.messages.an_error_occurred')),
						preset: 'error',
						haptic: 'error',
					});
					throw new Error('Failed to rate movie');
				}
			});
		} else {
			await insertActivity.mutateAsync({
				userId: session.user.id,
				tvSeriesId: tvSeries.id,
				rating: rating,
			}, {
				onError: () => {
					Burnt.toast({
						title: upperFirst(t('common.messages.an_error_occurred')),
						preset: 'error',
						haptic: 'error',
					});
					throw new Error('Failed to rate movie');
				}
			});
		}
	};
	const handleUnrate = async () => {
		if (activity?.review) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.an_error_occurred')),
				message: 'You cannot unrate a media with a review.',
				duration: 3,
				preset: 'error',
				haptic: 'error',
			})
		}
		await updateActivity.mutateAsync({
			activityId: activity!.id!,
			rating: null,
		}, {
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
				throw new Error('Failed to unrate movie');
			}
		});
	};

	return (
		<Button
		ref={ref}
		variant={variant}
		iconProps={{
			size: ICON_ACTION_SIZE,
			...iconProps
		}}
		size={size}
		icon={!activity?.rating ? Icons.Star : undefined}
		onPress={() => {
			if (session) {
				openSheet(BottomSheetRating, {
					media: {
						title: tvSeries.name || '',
						imageUrl: tvSeries.poster_url || '',
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
			onPressProps?.();
		}}
		{...props}
		>
			{activity?.rating ? <IconMediaRating rating={activity.rating} style={tw`w-12`} /> : null}

		</Button>
	);
});
ButtonUserActivityTvSeriesRating.displayName = 'ButtonUserActivityTvSeriesRating';

export default ButtonUserActivityTvSeriesRating;
