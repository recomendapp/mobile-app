// import ReviewForm from "@/components/screens/review/ReviewForm";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaDetailsQuery } from "@/features/media/mediaQueries";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import tw from "@/lib/tw";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"

const ReviewCreateScreen = () => {
	const { user } = useAuth();
	const router = useRouter();
	const { media_id } = useLocalSearchParams();
	const { id: mediaId} = getIdFromSlug(media_id as string);
	const {
		data: media,
		isLoading: mediaLoading,
	} = useMediaDetailsQuery({
		id: mediaId,
	});
	const {
		data: activity,
		isLoading: activityLoading,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: mediaId,
	});
	const loading = mediaLoading || media === undefined || activityLoading || activity === undefined;

	if (media === null) return router.back();
	if (activity?.review) return router.replace(`/review/${activity?.review?.id}`);
	if (loading) {
		return (
			<View style={tw`flex-1 items-center justify-center`}>
				<Icons.Loader />
			</View>
		);
	};
	// return (
	// <ReviewForm
	// media={media}
	// />
	// )
};

export default ReviewCreateScreen;