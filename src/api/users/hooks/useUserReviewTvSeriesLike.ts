import { useAuth } from "@/providers/AuthProvider"
import {
useUserReviewTvSeriesLikeInsertMutation,
useUserReviewTvSeriesLikeDeleteMutation,
} from "@/api/users/userMutations"
import * as Haptics from 'expo-haptics'
import { useCallback, useMemo } from "react"
import { useUserReviewTvSeriesLikeQuery } from "../userQueries"

export const useUserReviewTvSeriesLike = ({
	reviewId,
}: {
	reviewId?: number
}) => {
	const { session } = useAuth()

	const { data: isLiked, isLoading } = useUserReviewTvSeriesLikeQuery({
		userId: session?.user.id,
		reviewId,
	});

	const { mutate: insertLike, isPending: isInserting } = useUserReviewTvSeriesLikeInsertMutation()
	const { mutate: deleteLike, isPending: isDeleting } = useUserReviewTvSeriesLikeDeleteMutation()
	const isPending = useMemo(() => isInserting || isDeleting, [isInserting, isDeleting])

	const toggle = useCallback(() => {
		if (!session?.user.id || !reviewId) return
		if (isPending) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		if (isLiked) {
			deleteLike({
				userId: session.user.id,
				reviewId,
			})
		} else {
			insertLike({
				userId: session.user.id,
				reviewId,
			})
		}
	}, [isLiked, isPending, insertLike, deleteLike, reviewId, session?.user.id])

	return {
		isLiked,
		isLoading,
		toggle,
		isPending,
	}
}