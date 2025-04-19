import ReviewForm from "@/components/screens/review/ReviewForm";
import { ThemedText } from "@/components/ui/ThemedText"
import { useAuth } from "@/context/AuthProvider";
import { useUserReviewQuery } from "@/features/user/userQueries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native"

const ReviewEditScreen = () => {
	const { user }	= useAuth();
	const router = useRouter();
	const { review_id } = useLocalSearchParams();
	const {
		data: review,
		isLoading: reviewLoading,
	} = useUserReviewQuery({
		reviewId: Number(review_id),
	});
	const loading = reviewLoading || review === undefined;

	if (loading) {
		return (
			<View>
				<ThemedText>Loading...</ThemedText>
			</View>
		);
	};
	if (!review) return router.replace('/+not-found');
	if (review?.activity?.user_id !== user?.id) return router.replace(`/review/${review?.id}`);
	return (
	<ReviewForm
	media={review?.activity?.media!}
	review={review}
	onSave={() => {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace(`/review/${review?.id}`);
		}
	}}
	/>
	)
};

export default ReviewEditScreen;