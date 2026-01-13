import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/providers/ApiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { playlistDetailsOptions, playlistGuestsAddOptions, playlistGuestsOptions, playlistIsAllowedToEditOptions, playlistItemsMovieOptions, playlistItemsTvSeriesOptions, playlistMovieAddToOptions, playlistsFeaturedOptions, playlistTvSeriesAddToOptions } from "./playlistOptions";

/* --------------------------------- DETAILS -------------------------------- */
export const usePlaylistDetailsQuery = ({
	playlistId,
} : {
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistDetailsOptions({
		supabase,
		playlistId: playlistId,
	}));
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- ITEMS --------------------------------- */
export const usePlaylistItemsMovieQuery = ({
	playlistId,
} : {
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistItemsMovieOptions({
		supabase,
		playlistId: playlistId,
	}));
};

export const usePlaylistItemsTvSeriesQuery = ({
	playlistId,
} : {
	playlistId?: number;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistItemsTvSeriesOptions({
		supabase,
		playlistId: playlistId,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- GUESTS --------------------------------- */
export const usePlaylistGuestsQuery = ({
	playlistId
}: {
	playlistId?: number
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistGuestsOptions({
		supabase,
		playlistId,
	}));
};

export const usePlaylistGuestsAddQuery = ({
	playlistId,
	query,
} : {
	playlistId?: number;
	query?: string;
}) => {
	const api = useApiClient();
	const { session } = useAuth();
	const { data: guests } = usePlaylistGuestsQuery({ playlistId });
	return useInfiniteQuery(playlistGuestsAddOptions({
		api,
		userId: session?.user.id,
		playlistId,
		query,
		guests: guests,
	}));
};

export const usePlaylistIsAllowedToEditQuery = ({
	playlistId,
	userId,
} : {
	playlistId?: number;
	userId?: string;
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistIsAllowedToEditOptions({
		supabase,
		playlistId,
		userId,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- ADD TO --------------------------------- */
export const usePlaylistMovieAddToQuery = ({
	movieId,
	userId,
	source,
} : {
	movieId: number;
	userId?: string;
	source: 'saved' | 'personal';
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistMovieAddToOptions({
		supabase,
		movieId,
		userId,
		source,
	}));
};

export const usePlaylistTvSeriesAddToQuery = ({
	tvSeriesId,
	userId,
	source,
} : {
	tvSeriesId: number;
	userId?: string;
	source: 'saved' | 'personal';
}) => {
	const supabase = useSupabaseClient();
	return useQuery(playlistTvSeriesAddToOptions({
		supabase,
		tvSeriesId,
		userId,
		source,
	}));
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- FEATURED -------------------------------- */
export const usePlaylistsFeaturedQuery = ({
	filters
} : {
	filters: {
		sortBy: 'created_at' | 'updated_at';
		sortOrder: 'asc' | 'desc';
	};
}) => {
	const supabase = useSupabaseClient();
	return useInfiniteQuery(playlistsFeaturedOptions({
		supabase,
		filters,
	}));
};
/* -------------------------------------------------------------------------- */