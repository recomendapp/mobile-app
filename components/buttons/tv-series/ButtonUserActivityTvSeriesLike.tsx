import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityTvSeriesQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserActivityTvSeriesInsertMutation, useUserActivityTvSeriesUpdateMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface ButtonUserActivityTvSeriesLikeProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserActivityTvSeriesLike = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityTvSeriesLikeProps
>(({ tvSeries, icon = Icons.like, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const queryClient = useQueryClient();
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityTvSeriesQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id,
	});
	const insertActivity = useUserActivityTvSeriesInsertMutation();
	const updateActivity = useUserActivityTvSeriesUpdateMutation();
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
						queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'tv_series' })
					});
				},
				onError: () => {
					isLiked.value = 0;
					Burnt.toast({
						title: upperFirst(t('common.messages.an_error_occurred')),
						preset: 'error',
						haptic: 'error',
					});
				}
			});
		} else {
			await insertActivity.mutateAsync({
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
					Burnt.toast({
						title: upperFirst(t('common.messages.an_error_occurred')),
						preset: 'error',
						haptic: 'error',
					});
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
					queryKey: userKeys.heartPicks({ userId: session.user.id, type: 'tv_series' })
				});
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
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
ButtonUserActivityTvSeriesLike.displayName = 'ButtonUserActivityTvSeriesLike';

export default ButtonUserActivityTvSeriesLike;
