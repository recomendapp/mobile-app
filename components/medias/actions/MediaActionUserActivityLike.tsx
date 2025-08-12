import React from "react"
import { Pressable } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityInsertMutation, useUserActivityUpdateMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import * as Haptics from "expo-haptics";
import { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface MediaActionUserActivityLikeProps
	extends React.ComponentProps<typeof Button> {
		media: Media;
	}

const MediaActionUserActivityLike = React.forwardRef<
	React.ComponentRef<typeof Button>,
	MediaActionUserActivityLikeProps
>(({ media, icon = Icons.like, variant = "ghost", size = "icon", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const queryClient = useQueryClient();
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});
	const insertActivity = useUserActivityInsertMutation();
	const updateActivity = useUserActivityUpdateMutation();
	const isLiked = useSharedValue(activity?.is_liked ? 1 : 0);

	const handleLike = async () => {
		if (!user?.id) return;
		isLiked.value = 1;
		if (activity) {
			await updateActivity.mutateAsync({
				activityId: activity.id,
				isLiked: true,
			}, {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: userKeys.likes({ userId: user?.id as string })
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
				userId: user?.id,
				mediaId: media.media_id!,
				isLiked: true,
			}, {
				onSuccess: (data) => {
					queryClient.invalidateQueries({
						queryKey: userKeys.likes({ userId: user?.id as string })
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
		if (!activity) return;
		isLiked.value = 0;
		await updateActivity.mutateAsync({
			activityId: activity.id,
			isLiked: false,
		}, {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: userKeys.likes({ userId: user?.id as string })
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
MediaActionUserActivityLike.displayName = 'MediaActionUserActivityLike';

export default MediaActionUserActivityLike;
