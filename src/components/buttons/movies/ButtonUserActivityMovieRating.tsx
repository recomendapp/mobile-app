import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { MediaMovie } from "@recomendapp/types";
import tw from "@/lib/tw";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import BottomSheetRating from "@/components/bottom-sheets/sheets/BottomSheetRating";
import { useUserActivityMovieInsertMutation, useUserActivityMovieUpdateMutation } from "@/api/users/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "@/components/ui/text";
import { useUserActivityMovieQuery } from "@/api/users/userQueries";

interface ButtonUserActivityMovieRatingProps
	extends Omit<React.ComponentProps<typeof Button>, 'size'> {
		movie: MediaMovie;
	}

const ButtonUserActivityMovieRating = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityMovieRatingProps
>(({ movie, variant = "outline", style, onPress: onPressProps, iconProps, ...props }, ref) => {
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
	} = useUserActivityMovieQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});
	// Mutations
	const { mutateAsync: insertActivity } = useUserActivityMovieInsertMutation();
	const { mutateAsync: updateActivity } = useUserActivityMovieUpdateMutation();
	// Handlers
	const handleRate = useCallback(async (rating: number) => {
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
	}, [activity, insertActivity, movie.id, session, toast, t, updateActivity]);
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
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
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
						title: movie.title || '',
						imageUrl: getTmdbImage({ path: movie?.poster_path, size: 'w342' }) || '',
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
ButtonUserActivityMovieRating.displayName = 'ButtonUserActivityMovieRating';

export default ButtonUserActivityMovieRating;
