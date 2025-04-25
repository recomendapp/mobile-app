import React from "react"
import { Pressable } from "react-native";
import { useAuth } from "@/context/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityInsertMutation, useUserActivityUpdateMutation } from "@/features/user/userMutations";
import { IconMediaRating } from "../IconMediaRating";
import { useTheme } from "@/context/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
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

	return (
		<Pressable
		onPress={() => openSheet(BottomSheetMediaRating, {
			media: media,
		})}
		disabled={isLoading || isError || activity === undefined || insertActivity.isPending || updateActivity.isPending}
		style={[
			{ opacity: isLoading || activity === undefined ? 0.5 : 1 },
		]}
		{...props}
		>
		{isError ? (
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
