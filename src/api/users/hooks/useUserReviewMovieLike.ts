import { useAuth } from "@/providers/AuthProvider"
import { useQuery } from "@tanstack/react-query"
import {
	useUserReviewMovieLikeOptions,
} from "@/api/users/usersOptions"
import {
useUserReviewMovieLikeInsertMutation,
useUserReviewMovieLikeDeleteMutation,
} from "@/api/users/usersMutations"
import * as Haptics from 'expo-haptics'
import { useCallback, useMemo } from "react"

export const useUserReviewMovieLike = ({ reviewId }: { reviewId?: number }) => {
	const { session } = useAuth()

	const { data: isLiked, isLoading } = useQuery(useUserReviewMovieLikeOptions({
		userId: session?.user.id,
		reviewId,
	}))

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