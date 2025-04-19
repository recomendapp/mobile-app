import React from "react"
import { upperFirst } from "lodash";
import { Pressable, View } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { useTranslation } from "react-i18next";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityInsertMutation, useUserActivityUpdateMutation } from "@/features/user/userMutations";
import * as Burnt from "burnt";
import { IconMediaRating } from "../IconMediaRating";
import { useTheme } from "@/context/ThemeProvider";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import tw from "@/lib/tw";
import { Button, ButtonText } from "@/components/ui/Button";
import BottomSheetMediaRating from "@/components/bottom-sheets/sheets/BottomSheetMediaRating";
import { Media } from "@/types/type.db";

interface MediaActionUserActivityRatingProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
		stopPropagation?: boolean;
	}

const MediaActionUserActivityRating = React.forwardRef<
	React.ElementRef<typeof Pressable>,
	MediaActionUserActivityRatingProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { user } = useAuth();
	const { openSheet } = useBottomSheetStore();
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

	const handleRate = async (rating: number) => {
		if (!user?.id) return;
		if (activity) {
			await updateActivity.mutateAsync({
				activityId: activity.id,
				rating: rating,
			}, {
				onError: () => {
					Burnt.toast({
						title: upperFirst(t('common.errors.an_error_occurred')),
						preset: 'error',
					});
				}
			});
		} else {
			await insertActivity.mutateAsync({
				userId: user?.id,
				mediaId: media.media_id!,
				rating: rating,
			}, {
				onError: () => {
					Burnt.toast({
						title: upperFirst(t('common.errors.an_error_occurred')),
						preset: 'error',
					});
				}
			});
		}
	};
	const handleUnrate = async () => {
		if (activity?.review) {
			Burnt.toast({
				title: upperFirst(t('common.errors.an_error_occurred')),
				preset: 'error',
			});
		}
		await updateActivity.mutateAsync({
		  activityId: activity!.id!,
		  rating: null,
		}, {
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.errors.an_error_occurred')),
					preset: 'error',
				});
			}
		});
	};

	return (
		<Pressable
		onPress={() => openSheet(BottomSheetMediaRating, {
			media: media,
			initialRating: activity?.rating,
			onRatingChange: async (rating) => {
				if (rating) {
					await handleRate(rating);
				} else {
					await handleUnrate();
				}
			}
		})}
		disabled={isLoading || isError || activity === undefined || insertActivity.isPending || updateActivity.isPending}
		// variant={activity?.rating ? 'rating-enabled' : 'rating'}
		>
		{(isLoading || activity === undefined) ? (
			<Icons.spinner color={colors.foreground} />
		) : isError ? (
			<AlertCircleIcon />
		) : activity?.rating ? (
			<IconMediaRating rating={activity.rating} />
		) : (
			<Icons.Star color={colors.accentYellow} />
		)}
		</Pressable>
	);
});
MediaActionUserActivityRating.displayName = 'MediaActionUserActivityRating';

export default MediaActionUserActivityRating;
