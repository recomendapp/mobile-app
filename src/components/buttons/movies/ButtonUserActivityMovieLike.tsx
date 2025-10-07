import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityMovieQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserActivityMovieInsertMutation, useUserActivityMovieUpdateMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@recomendapp/types";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import { upperFirst } from "lodash";
import { useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";
import { useToast } from "@/components/Toast";

interface ButtonUserActivityMovieLikeProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

const ButtonUserActivityMovieLike = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityMovieLikeProps
>(({ movie, icon = Icons.like, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const toast = useToast();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const queryClient = useQueryClient();
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityMovieQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});
	const insertActivity = useUserActivityMovieInsertMutation();
	const updateActivity = useUserActivityMovieUpdateMutation();
	const isLiked = useSharedValue(activity?.is_liked ? 1 : 0);

	const handleLike = async () => {
		if (!session) return;
		isLiked.value = 1;
		if (activity) {
			await updateActivity.mutateAsync({
				activityId: activity.id,
				isLiked: true,
			}, {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'movie' })
					});
				},
				onError: () => {
					isLiked.value = 0;
					toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		} else {
			await insertActivity.mutateAsync({
				userId: session?.user.id,
				movieId: movie.id,
				isLiked: true,
			}, {
				onSuccess: (data) => {
					queryClient.invalidateQueries({
						queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'movie' })
					});
				},
				onError: () => {
					isLiked.value = 0;
					toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		}
	};
	const handleUnlike = async () => {
		if (!session) return;
		if (!activity) return;
		isLiked.value = 0;
		await updateActivity.mutateAsync({
			activityId: activity.id,
			isLiked: false,
		}, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'movie' })
				});
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				isLiked.value = 1;
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
				activity?.is_liked ? handleUnlike() : handleLike();
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
			color: activity?.is_liked ? colors.accentPink : colors.foreground,
			fill: activity?.is_liked ? colors.accentPink : undefined,
			size: ICON_ACTION_SIZE,
			...iconProps,
		}}
		{...props}
		/>
	);
});
ButtonUserActivityMovieLike.displayName = 'ButtonUserActivityMovieLike';

export default ButtonUserActivityMovieLike;
