import { useAuth } from "@/providers/AuthProvider"
import {
useUserReviewMovieLikeInsertMutation,
useUserReviewMovieLikeDeleteMutation,
} from "@/api/users/userMutations"
import * as Haptics from 'expo-haptics'
import { useCallback, useMemo } from "react"
import { useUserReviewMovieLikeQuery } from "../userQueries"

export const useUserReviewMovieLike = ({ reviewId }: { reviewId?: number }) => {
	const { session } = useAuth()

	const { data: isLiked, isLoading } = useUserReviewMovieLikeQuery({
		userId: session?.user.id,
		reviewId,
	});

	const { mutate: insertLike, isPending: isInserting } = useUserReviewMovieLikeInsertMutation()
	const { mutate: deleteLike, isPending: isDeleting } = useUserReviewMovieLikeDeleteMutation()
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