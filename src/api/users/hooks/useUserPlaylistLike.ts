import { useAuth } from "@/providers/AuthProvider"
import {
useUserPlaylistLikeInsertMutation,
useUserPlaylistLikeDeleteMutation,
} from "@/api/users/userMutations"
import * as Haptics from 'expo-haptics'
import { useCallback, useMemo } from "react"
import { useUserPlaylistLikeQuery } from "../userQueries"

export const useUserPlaylistLike = ({ playlistId }: { playlistId?: number }) => {
	const { session } = useAuth()

	const { data: isLiked, isLoading } = useUserPlaylistLikeQuery({
		userId: session?.user.id,
		playlistId,
	});

	const { mutate: insertLike, isPending: isInserting } = useUserPlaylistLikeInsertMutation()
	const { mutate: deleteLike, isPending: isDeleting } = useUserPlaylistLikeDeleteMutation()
	const isPending = useMemo(() => isInserting || isDeleting, [isInserting, isDeleting])

	const toggle = useCallback(() => {
		if (!session?.user.id || !playlistId) return
		if (isPending) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		if (isLiked) {
			deleteLike({
				userId: session.user.id,
				playlistId,
			})
		} else {
			insertLike({
				userId: session.user.id,
				playlistId,
			})
		}
	}, [isLiked, isPending, insertLike, deleteLike, playlistId, session?.user.id])

	return {
		isLiked,
		isLoading,
		toggle,
		isPending,
	}
}