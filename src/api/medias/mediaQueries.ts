import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { mediaMovieCreditsOptions, mediaMovieDetailsOptions, mediaMoviePlaylistsOptions, mediaMovieReviewsOptions, mediaPersonDetailsOptions, mediaPersonFilmsOptions, mediaTvSeriesCreditsOptions, mediaTvSeriesDetailsOptions, mediaTvSeriesPlaylistsOptions, mediaTvSeriesReviewsOptions, mediaTvSeriesSeasonDetailsOptions, mediaPersonTvSeriesOptions, mediaMovieFollowersAverageRatingOptions, mediaTvSeriesFollowersAverageRatingOptions, mediaMoviePostersOptions, mediaTvSeriesPostersOptions, mediaMovieBackdropsOptions, mediaTvSeriesBackdropsOptions, mediaGenresOptions, mediaTvSeriesSeasonsOptions, mediaMovieCastOptions, mediaTvSeriesCastOptions, mediaMovieFollowersAverageRatingsOptions, mediaTvSeriesFollowersAverageRatingsOptions } from "./mediaOptions";

/* --------------------------------- DETAILS -------------------------------- */
export const useMediaMovieDetailsQuery = ({
	movieId,
} : {
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaMovieDetailsOptions({
		supabase,
		movieId,
	}))
};

export const useMediaTvSeriesDetailsQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesDetailsOptions({
		supabase,
		tvSeriesId,
	}));
};

export const useMediaPersonDetailsQuery = ({
	personId,
} : {
	personId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaPersonDetailsOptions({
		supabase,
		personId,
	}));
};

export const useMediaTvSeriesSeasonDetailsQuery = ({
	tvSeriesId,
	seasonNumber,
} : {
	tvSeriesId?: number;
	seasonNumber?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesSeasonDetailsOptions({
		supabase,
		tvSeriesId,
		seasonNumber,
	}))
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- CREDITS -------------------------------- */
export const useMediaMovieCreditsQuery = ({
	movieId,
} : {
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaMovieCreditsOptions({
		supabase,
		movieId,
	}))
};
export const useMediaMovieCastQuery = ({
	movieId,
} : {
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaMovieCastOptions({
		supabase,
		movieId,
	}))
};

export const useMediaTvSeriesCreditsQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesCreditsOptions({
		supabase,
		tvSeriesId,
	}))
};
export const useMediaTvSeriesCastQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesCastOptions({
		supabase,
		tvSeriesId,
	}))
}
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEWS -------------------------------- */
export const useMediaMovieReviewsQuery = ({
	movieId,
	filters,
} : {
	movieId?: number;
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaMovieReviewsOptions({
		supabase,
		movieId,
		filters,
	}))
};

export const useMediaTvSeriesReviewsQuery = ({
	tvSeriesId,
	filters,
} : {
	tvSeriesId?: number;
	filters: {
		sortBy: 'updated_at' | 'created_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaTvSeriesReviewsOptions({
		supabase,
		tvSeriesId,
		filters,
	}))
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLISTS ------------------------------- */
export const useMediaMoviePlaylistsQuery = ({
	movieId,
	filters,
} : {
	movieId?: number;
	filters: {
		sortBy: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaMoviePlaylistsOptions({
		supabase,
		movieId,
		filters,
	}));
};

export const useMediaTvSeriesPlaylistsQuery = ({
	tvSeriesId,
	filters,
} : {
	tvSeriesId?: number;
	filters: {
		sortBy: 'created_at' | 'updated_at' | 'likes_count';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaTvSeriesPlaylistsOptions({
		supabase,
		tvSeriesId,
		filters,
	}));
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- TV SERIES ------------------------------- */
export const useMediaTvSeriesSeasonsQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesSeasonsOptions({
		supabase,
		tvSeriesId,
	}));
}
/* -------------------------------------------------------------------------- */

/* --------------------------------- PERSONS -------------------------------- */
export const useMediaPersonFilmsQuery = ({
	personId,
	filters,
} : {
	personId: number;
	filters: {
		sortBy: 'release_date' | 'vote_average';
		sortOrder: 'asc' | 'desc';
		department?: string;
		job?: string;
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaPersonFilmsOptions({
		supabase,
		personId,
		filters,
	}));
};

export const useMediaPersonTvSeriesQuery = ({
	personId,
	filters,
} : {
	personId: number;
	filters: {
		sortBy: 'last_appearance_date' | 'first_air_date' | 'vote_average';
		sortOrder: 'asc' | 'desc';
		department?: string;
		job?: string;
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaPersonTvSeriesOptions({
		supabase,
		personId,
		filters,
	}));
};
/* -------------------------------------------------------------------------- */
		
/* -------------------------------- FOLLOWERS ------------------------------- */
export const useMediaMovieFollowersAverageRatingsQuery = ({
	movieId,
} : {
	movieId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaMovieFollowersAverageRatingsOptions({
		supabase,
		movieId,
	}));
};

export const useMediaTvSeriesFollowersAverageRatingsQuery = ({
	tvSeriesId,
} : {
	tvSeriesId: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesFollowersAverageRatingsOptions({
		supabase,
		tvSeriesId,
	}));
}

export const useMediaMovieFollowersAverageRatingQuery = ({
	movieId,
} : {
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaMovieFollowersAverageRatingOptions({
		supabase,
		movieId,
	}));
};

export const useMediaTvSeriesFollowersAverageRatingQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(mediaTvSeriesFollowersAverageRatingOptions({
		supabase,
		tvSeriesId,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- IMAGES --------------------------------- */
export const useMediaMoviePostersQuery = ({
	movieId,
} : {
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaMoviePostersOptions({
		supabase,
		movieId,
	}));
};

export const useMediaTvSeriesPostersQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaTvSeriesPostersOptions({
		supabase,
		tvSeriesId,
	}));
};

export const useMediaMovieBackdropsQuery = ({
	movieId,
} : {
	movieId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaMovieBackdropsOptions({
		supabase,
		movieId,
	}));
};

export const useMediaTvSeriesBackdropsQuery = ({
	tvSeriesId,
} : {
	tvSeriesId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(mediaTvSeriesBackdropsOptions({
		supabase,
		tvSeriesId,
	}));
};
/* -------------------------------------------------------------------------- */

export const useMediaGenresQuery = () => {
	const supabase = useSupabaseClient();
	return useQuery(mediaGenresOptions({
		supabase,
	}));
};