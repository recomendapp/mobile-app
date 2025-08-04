import React from "react"
import { Pressable } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityInsertMutation, useUserActivityUpdateMutation } from "@/features/user/userMutations";
import { IconMediaRating } from "../IconMediaRating";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMediaRating from "@/components/bottom-sheets/sheets/BottomSheetMediaRating";
import { Media } from "@/types/type.db";
import tw from "@/lib/tw";
import { usePathname, useRouter } from "expo-router";

const ICON_SIZE = 24;

interface MediaActionUserActivityRatingProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserActivityRating = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserActivityRatingProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { session, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
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
		ref={ref}
		onPress={() =>{
			if (session) {
				openSheet(BottomSheetMediaRating, {
					media: media,
				});
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
		}}
		disabled={
			session ? (
				isLoading || isError || activity === undefined || insertActivity.isPending || updateActivity.isPending
			) : false
		}
		{...props}
		>
		{isError ? (
			<AlertCircleIcon size={ICON_SIZE} />
		) : activity?.rating ? (
			<IconMediaRating rating={activity.rating} style={tw`w-12`} />
		) : (
			<Icons.Star color={colors.foreground} size={ICON_SIZE} />
		)}
		</Pressable>
	);
});
MediaActionUserActivityRating.displayName = 'MediaActionUserActivityRating';

export default MediaActionUserActivityRating;
