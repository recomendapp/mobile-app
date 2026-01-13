import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { userActivitiesMovieOptions, userActivitiesOptions, userActivitiesTvSeriesOptions, userActivityMovieOptions, userActivityTvSeriesOptions, userDeleteRequestOptions, userFolloweesOptions, userFollowersOptions, userFollowersRequestsOptions, userFollowPersonOptions, userFollowProfileOptions, userHeartPicksMovieOptions, userHeartPicksTvSeriesOptions, userMyFeedCastCrewOptions, userMyFeedOptions, userPlaylistLikeOptions, userPlaylistSavedOptions, userPlaylistsFriendOptions, userPlaylistsSavedOptions, userProfileOptions, userRecosMovieOptions, userRecosMovieSendOptions, userRecosOptions, userRecosTvSeriesOptions, userRecosTvSeriesSendOptions, userReviewMovieLikeOptions, userReviewMovieOptions, userReviewTvSeriesLikeOptions, userReviewTvSeriesOptions, userWatchlistMovieItemOptions, userWatchlistMoviesOptions, userWatchlistOptions, userWatchlistTvSeriesItemOptions, userWatchlistTvSeriesOptions, userPlaylistsOptions } from "./userOptions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";

/* --------------------------------- PROFILE -------------------------------- */
export const useUserProfileQuery = ({
	username,
} : {
	username?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userProfileOptions({
		supabase,
		username,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- FOLLOWS -------------------------------- */
export const useUserFollowersQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userFollowersOptions({
		supabase,
		userId,
	}));
};

export const useUserFolloweesQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userFolloweesOptions({
		supabase,
		userId,
	}));
};

export const useUserFollowersRequestsQuery = () => {
	const supabase = useSupabaseClient();
	const { session } = useAuth();
	return useInfiniteQuery(userFollowersRequestsOptions({
		supabase,
		userId: session?.user.id,
	}));
};

export const useUserFollowProfileQuery = ({
	userId,
	profileId
} : {
	userId?: string;
	profileId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userFollowProfileOptions({
		supabase,
		userId,
		profileId,
	}));
};

export const useUserFollowPersonQuery = ({
	userId,
	personId
} : {
	userId?: string;
	personId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userFollowPersonOptions({
		supabase,
		userId,
		personId,
	}));
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- FEED ---------------------------------- */
export const useUserMyFeedQuery = ({
	filters,
} : {
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userMyFeedOptions({
		supabase,
		filters,
	}));
};

export const useUserFeedCastCrewQuery = () => {
	const supabase = useSupabaseClient();
	const { session, customerInfo } = useAuth();
	return useInfiniteQuery(userMyFeedCastCrewOptions({
		supabase,
		enabled: !!customerInfo?.entitlements.active['premium'] && !!session?.user.id,
	}))
};
/* -------------------------------------------------------------------------- */

/* ------------------------------- Activities ------------------------------- */
export const useUserActivitiesQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'watched_date' | 'rating';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userActivitiesOptions({
		supabase,
		userId,
		filters,
	}));
};
export const useUserActivitiesMovieQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'watched_date' | 'rating';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userActivitiesMovieOptions({
		supabase,
		userId,
		filters,
	}));
};
export const useUserActivitiesTvSeriesQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'watched_date' | 'rating';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userActivitiesTvSeriesOptions({
		supabase,
		userId,
		filters,
	}));
};

export const useUserActivityMovieQuery = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userActivityMovieOptions({
		supabase,
		userId,
		movieId,
	}));
};
export const useUserActivityTvSeriesQuery = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userActivityTvSeriesOptions({
		supabase,
		userId,
		tvSeriesId,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const useUserReviewMovieQuery = ({
	reviewId,
} : {
	reviewId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userReviewMovieOptions({
		supabase,
		reviewId,
	}));
};

export const useUserReviewMovieLikeQuery = ({
	userId,
	reviewId,
} : {
	userId?: string;
	reviewId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userReviewMovieLikeOptions({
		supabase,
		userId,
		reviewId,
	}));
};

export const useUserReviewTvSeriesQuery = ({
	reviewId,
} : {
	reviewId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userReviewTvSeriesOptions({
		supabase,
		reviewId,
	}));
};

export const useUserReviewTvSeriesLikeQuery = ({
	userId,
	reviewId,
} : {
	userId?: string;
	reviewId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userReviewTvSeriesLikeOptions({
		supabase,
		userId,
		reviewId,
	}));
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
export const useUserRecosQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc' | 'random';
		limit?: number;
	};
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userRecosOptions({
		supabase,
		userId,
		filters,
	}));
};

export const useUserRecosMovieQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userRecosMovieOptions({
		supabase,
		userId,
	}));
};

export const useUserRecosTvSeriesQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userRecosTvSeriesOptions({
		supabase,
		userId,
	}));
};

export const useUserRecosMovieSendQuery = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userRecosMovieSendOptions({
		supabase,
		userId,
		movieId,
	}));
};

export const useUserRecosTvSeriesSendQuery = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userRecosTvSeriesSendOptions({
		supabase,
		userId,
		tvSeriesId,
	}));
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- WATCHLIST ------------------------------- */
export const useUserWatchlistQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: 'created_at';
		sortOrder: 'asc' | 'desc' | 'random';
		limit: number;
	}
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userWatchlistOptions({
		supabase,
		userId,
		filters,
	}));
};

export const useUserWatchlistMovieQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userWatchlistMoviesOptions({
		supabase,
		userId,
	}));
};

export const useUserWatchlistTvSeriesQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userWatchlistTvSeriesOptions({
		supabase,
		userId,
	}));
};

export const useUserWatchlistMovieItemQuery = ({
	userId,
	movieId,
} : {
	userId?: string;
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userWatchlistMovieItemOptions({
		supabase,
		userId,
		movieId,
	}));
};

export const useUserWatchlistTvSeriesItemQuery = ({
	userId,
	tvSeriesId,
} : {
	userId?: string;
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userWatchlistTvSeriesItemOptions({
		supabase,
		userId,
		tvSeriesId,
	}));
};
/* -------------------------------------------------------------------------- */

/* ------------------------------- HEART PICKS ------------------------------ */
export const useUserHeartPicksMovieQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userHeartPicksMovieOptions({
		supabase,
		userId,
	}));
};

export const useUserHeartPicksTvSeriesQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userHeartPicksTvSeriesOptions({
		supabase,
		userId,
	}));
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLISTS ------------------------------- */
export const useUserPlaylistsQuery = ({
	userId,
	filters,
} : {
	userId?: string;
	filters: {
		sortBy: "created_at" | "updated_at" | "likes_count";
		sortOrder: "asc" | "desc";
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userPlaylistsOptions({
		supabase,
		userId,
		filters,
	}));
};

export const useUserPlaylistsSavedQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userPlaylistsSavedOptions({
		supabase,
		userId,
	}));
};

export const useUserPlaylistSavedQuery = ({
	userId,
	playlistId,
} : {
	userId?: string;
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userPlaylistSavedOptions({
		supabase,
		userId,
		playlistId,
	}));
};

export const useUserPlaylistLikeQuery = ({
	userId,
	playlistId,
} : {
	userId?: string;
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userPlaylistLikeOptions({
		supabase,
		userId,
		playlistId,
	}));
};

export const useUserPlaylistsFriendQuery = ({
	filters,
} : {
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	}
}) => {
	const { session } = useAuth();
	const supabase = useSupabaseClient();
	return useInfiniteQuery(userPlaylistsFriendOptions({
		supabase,
		userId: session?.user.id,
		filters,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- ACCOUNT -------------------------------- */
export const useUserDeleteRequestQuery = ({
	userId,
} : {
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(userDeleteRequestOptions({
		supabase,
		userId,
	}));
};
/* -------------------------------------------------------------------------- */