import React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { IconMediaRating } from "../IconMediaRating";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMediaRating from "@/components/bottom-sheets/sheets/BottomSheetMediaRating";
import { Media } from "@/types/type.db";
import tw from "@/lib/tw";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface MediaActionUserActivityRatingProps
	extends React.ComponentProps<typeof Button> {
		media: Media;
	}

const MediaActionUserActivityRating = React.forwardRef<
	React.ComponentRef<typeof Button>,
	MediaActionUserActivityRatingProps
>(({ media, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { session, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});

	return (
		<Button
		ref={ref}
		variant={variant}
		iconProps={{
			size: ICON_ACTION_SIZE,
			...iconProps
		}}
		size={size}
		icon={!activity?.rating ? Icons.Star : undefined}
		onPress={() => {
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
			onPressProps?.();
		}}
		{...props}
		>
			{activity?.rating ? <IconMediaRating rating={activity.rating} style={tw`w-12`} /> : null}

		</Button>
	);
});
MediaActionUserActivityRating.displayName = 'MediaActionUserActivityRating';

export default MediaActionUserActivityRating;
