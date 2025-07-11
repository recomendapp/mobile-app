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
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";

const ICON_SIZE = 30;
const AnimatedLikeIcon = Animated.createAnimatedComponent(Icons.like);

interface MediaActionUserActivityLikeProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserActivityLike = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserActivityLikeProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();
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
						title: upperFirst(t('errors.an_error_occurred')),
						preset: 'error',
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
						title: upperFirst(t('errors.an_error_occurred')),
						preset: 'error',
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
					title: upperFirst(t('errors.an_error_occurred')),
					preset: 'error',
				});
				isLiked.value = 1;
			}
		});
	};

	const anim = useAnimatedProps(() => {
		const color = interpolateColor(
			isLiked.get(),
			[0, 1],
			[
				colors.foreground,
				colors.accentPink,
			]
		);
		const fill = interpolateColor(
			isLiked.get(),
			[0, 1],
			[
				'transparent',
				colors.accentPink,
			]
		);
		return {
			color,
			fill,
		}
	});

	React.useEffect(() => {
		isLiked.value = withTiming(activity?.is_liked ? 1 : 0)
	}, [activity?.is_liked]);

	return (
		<Pressable
		ref={ref}
		onPress={() => {
			if (process.env.EXPO_OS === 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			activity?.is_liked ? handleUnlike() : handleLike();
		}}
		disabled={isLoading || isError || activity === undefined || insertActivity.isPending || updateActivity.isPending}
		{...props}
		>
		{isError ? (
			<AlertCircleIcon size={ICON_SIZE} />
		) : (
			<Icons.like color={activity?.is_liked ? colors.accentPink : colors.foreground} fill={activity?.is_liked ? colors.accentPink : undefined} size={ICON_SIZE} />
			// <AnimatedLikeIcon
			// animatedProps={anim}
			// size={ICON_SIZE}
			// />
		)}
		</Pressable>
	);
});
MediaActionUserActivityLike.displayName = 'MediaActionUserActivityLike';

export default MediaActionUserActivityLike;
