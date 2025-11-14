import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityMovieQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { MediaMovie } from "@recomendapp/types";
import tw from "@/lib/tw";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";
import { IconMediaRating } from "@/components/medias/IconMediaRating";
import BottomSheetRating from "@/components/bottom-sheets/sheets/BottomSheetRating";
import { useUserActivityMovieInsertMutation, useUserActivityMovieUpdateMutation } from "@/features/user/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { forwardRef } from "react";

interface ButtonUserActivityMovieRatingProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

const ButtonUserActivityMovieRating = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityMovieRatingProps
>(({ movie, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { session } = useAuth();
	const toast = useToast();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	// Requests
	const {
		data: activity,
	} = useUserActivityMovieQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});
	// Mutations
	const { mutateAsync: insertActivity } = useUserActivityMovieInsertMutation();
	const { mutateAsync: updateActivity } = useUserActivityMovieUpdateMutation();
	// Handlers
	const handleRate = async (rating: number) => {
		if (!session) return;
		if (activity) {
			await updateActivity({
				activityId: activity.id,
				rating: rating,
			}, {
				onError: () => {
					toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		} else {
			await insertActivity({
				userId: session.user.id,
				movieId: movie.id,
				rating: rating,
			}, {
				onError: () => {
					toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		}
	};
	const handleUnrate = async () => {
		if (activity?.review) {
			toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: 'You cannot unrate a media with a review.' });
			return;
		}
		await updateActivity({
			activityId: activity!.id!,
			rating: null,
		}, {
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
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
		onPress={(e) => {
			if (session) {
				openSheet(BottomSheetRating, {
					media: {
						title: movie.title || '',
						imageUrl: movie.poster_url || '',
						type: 'movie',
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
		{...props}
		>
			{activity?.rating ? <IconMediaRating rating={activity.rating} style={tw`w-12`} /> : null}

		</Button>
	);
});
ButtonUserActivityMovieRating.displayName = 'ButtonUserActivityMovieRating';

export default ButtonUserActivityMovieRating;
