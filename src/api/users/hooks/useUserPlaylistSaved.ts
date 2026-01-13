import { useAuth } from "@/providers/AuthProvider"
import {
useUserPlaylistSavedInsertMutation,
useUserPlaylistSavedDeleteMutation,
} from "@/api/users/userMutations"
import * as Haptics from 'expo-haptics'
import { useCallback, useMemo } from "react"
import { useUserPlaylistSavedQuery } from "../userQueries"

export const useUserPlaylistSaved = ({ playlistId }: { playlistId?: number }) => {
	const { session } = useAuth()

	const { data: isSaved, isLoading } = useUserPlaylistSavedQuery({
		userId: session?.user.id,
		playlistId,
	});

	const { mutate: insertSaved, isPending: isInserting } = useUserPlaylistSavedInsertMutation()
	const { mutate: deleteSaved, isPending: isDeleting } = useUserPlaylistSavedDeleteMutation()
	const isPending = useMemo(() => isInserting || isDeleting, [isInserting, isDeleting])

	const toggle = useCallback(() => {
		if (!session?.user.id || !playlistId) return
		if (isPending) return
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		if (isSaved) {
			deleteSaved({
				userId: session.user.id,
				playlistId,
			})
		} else {
			insertSaved({
				userId: session.user.id,
				playlistId,
			})
		}
	}, [isSaved, isPending, insertSaved, deleteSaved, playlistId, session?.user.id])

	return {
		isSaved,
		isLoading,
		toggle,
		isPending,
	}
}