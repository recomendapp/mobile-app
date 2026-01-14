import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import { useUserActivityTvSeriesInsertMutation, useUserActivityTvSeriesUpdateMutation } from "@/api/users/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { useQueryClient } from "@tanstack/react-query";
import { upperFirst } from "lodash";
import { useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import tw from "@/lib/tw";
import { useUserActivityTvSeriesQuery } from "@/api/users/userQueries";
import { userKeys } from "@/api/users/userKeys";

interface ButtonUserActivityTvSeriesLikeProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserActivityTvSeriesLike = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityTvSeriesLikeProps
>(({ tvSeries, icon = Icons.like, variant = "outline", size = "icon", style, onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const toast = useToast();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const queryClient = useQueryClient();
	const {
		data: activity,
	} = useUserActivityTvSeriesQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id,
	});
	const { mutateAsync: insertActivity } = useUserActivityTvSeriesInsertMutation();
	const { mutateAsync: updateActivity } = useUserActivityTvSeriesUpdateMutation();
	const isLiked = useSharedValue(activity?.is_liked ? 1 : 0);

	const handleLike = useCallback(async () => {
		if (!session) return;
		isLiked.value = 1;
		if (activity) {
			await updateActivity({
				activityId: activity.id,
				isLiked: true,
			}, {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'tv_series' })
					});
				},
				onError: () => {
					isLiked.value = 0;
					toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		} else {
			await insertActivity({
				userId: session?.user.id,
				tvSeriesId: tvSeries.id,
				isLiked: true,
			}, {
				onSuccess: (data) => {
					queryClient.invalidateQueries({
						queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'tv_series' })
					});
				},
				onError: () => {
					isLiked.value = 0;
					toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				}
			});
		}
	}, [activity, insertActivity, tvSeries.id, queryClient, session, toast, t, updateActivity, isLiked]);
	const handleUnlike = useCallback(async () => {
		if (!session) return;
		if (!activity) return;
		isLiked.value = 0;
		await updateActivity({
			activityId: activity.id,
			isLiked: false,
		}, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'tv_series' })
				});
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.an_error_occurred')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				isLiked.value = 1;
			}
		});
	}, [activity, queryClient, session, toast, t, updateActivity, isLiked]);

	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
		onPress={async (e) => {
			if (session) {
				if (activity?.is_liked) {
					await handleUnlike()
				} else {
					await handleLike()
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
		iconProps={{
			fill: activity?.is_liked ? colors.foreground : 'transparent',
			...iconProps,
		}}
		style={{
			...(activity?.is_liked ? { backgroundColor: colors.accentPink } : undefined),
			...tw`rounded-full`,
			...style,
		}}
		{...props}
		/>
	);
});
ButtonUserActivityTvSeriesLike.displayName = 'ButtonUserActivityTvSeriesLike';

export default ButtonUserActivityTvSeriesLike;
