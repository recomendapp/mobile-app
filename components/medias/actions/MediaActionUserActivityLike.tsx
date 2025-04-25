import React from "react"
import { Pressable } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityInsertMutation, useUserActivityUpdateMutation } from "@/features/user/userMutations";
import { useTheme } from "@/context/ThemeProvider";
import { Media } from "@/types/type.db";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

const ICON_SIZE = 30;

interface MediaActionUserActivityLikeProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserActivityLike = React.forwardRef<
	React.ElementRef<typeof Pressable>,
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

	const handleLike = async () => {
		if (!user?.id) return;
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
					Burnt.toast({
						title: upperFirst(t('errors.an_error_occurred')),
						preset: 'error',
					})
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
					Burnt.toast({
						title: upperFirst(t('errors.an_error_occurred')),
						preset: 'error',
					})
				}
			});
		}
	};
	const handleUnlike = async () => {
		if (!activity) return;
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
				})
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
			activity?.is_liked ? handleUnlike() : handleLike();
		}}
		disabled={isLoading || isError || activity === undefined || insertActivity.isPending || updateActivity.isPending}
		style={[
			{ opacity: isLoading || activity === undefined ? 0.5 : 1 },
		]}
		{...props}
		>
		{isError ? (
			<AlertCircleIcon size={ICON_SIZE} />
		) : (
			<Icons.like color={colors.accentPink} fill={activity?.is_liked ? colors.accentPink : undefined} size={ICON_SIZE} />
		)}
		</Pressable>
	);
});
MediaActionUserActivityLike.displayName = 'MediaActionUserActivityLike';

export default MediaActionUserActivityLike;
