export const usersKeys = {
	base: ['user'] as const,

	details: ({
		userId,
	} : {
		userId: string;
	}) => [...usersKeys.base, userId] as const,

	profile: ({
		username,
	} : {
		username: string;
	}) => ['profile', username] as const,

	/* --------------------------------- FOLLOWS -------------------------------- */
	followers: ({
		userId,
	} : {
		userId: string;
	}) => [...usersKeys.details({ userId }), 'followers'] as const,
	followersRequests: ({
		userId,
	} : {
		userId: string;
	}) => [...usersKeys.details({ userId }), 'followers-requests'] as const,

	followees: ({
		userId,
	} : {
		userId: string;
	}) => [...usersKeys.details({ userId }), 'followees'] as const,
	followProfile: ({
		userId,
		profileId,
	} : {
		userId: string;
		profileId: string;
	}) => [...usersKeys.details({ userId }), 'follow', profileId] as const,
	followPerson: ({
		userId,
		personId,
	} : {
		userId: string;
		personId: number;
	}) => [...usersKeys.details({ userId }), 'follow-person', personId] as const,
	/* -------------------------------------------------------------------------- */

	/* ---------------------------------- FEED ---------------------------------- */
	myFeed: ({
		filters,
	} : {
		filters?: {
			sortBy: 'created_at';
			sortOrder: 'asc' | 'desc';
		}
	} = {}) => filters ? [...usersKeys.base, 'my_feed', filters] as const : [...usersKeys.base, 'my_feed'] as const,
	myFeedCastCrew: () => [...usersKeys.base, 'my_feed_cast_crew'] as const,
	feed: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: {
			sortBy: 'created_at';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.details({ userId }), 'feed', filters] as const : [...usersKeys.details({ userId }), 'feed'] as const,
	/* -------------------------------------------------------------------------- */

	/* ------------------------------- Activities ------------------------------- */
	activities: ({
		userId,
		type,
		filters,
	} : {
		userId: string;
		type: 'all' | 'movie' | 'tv_series';
		filters?: {
			sortBy: 'watched_date' | 'rating';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.details({ userId }), 'activities', type, filters] as const : [...usersKeys.details({ userId }), 'activities', type] as const,

	activity: ({
		id,
		type,
		userId,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
		userId: string;
	}) => [...usersKeys.details({ userId }), 'activity', type, id] as const,

	movieActivities: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: {
			sortBy: 'watched_date' | 'rating';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.activities({ userId, type: 'movie' }), filters] as const : usersKeys.activities({ userId, type: 'movie' }),

	tvSeriesActivities: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: {
			sortBy: 'watched_date' | 'rating';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.activities({ userId, type: 'tv_series' }), filters] as const : usersKeys.activities({ userId, type: 'tv_series' }),
	/* -------------------------------------------------------------------------- */

	/* --------------------------------- Reviews -------------------------------- */
	review: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...usersKeys.base, 'review', type, id] as const,

	reviewLike: ({
		reviewId,
		type,
		userId,
	} : {
		reviewId: number;
		type: 'movie' | 'tv_series';
		userId: string;
	}) => [...usersKeys.details({ userId }), 'review-like', type, reviewId] as const,
	/* -------------------------------------------------------------------------- */

	/* ---------------------------------- Recos --------------------------------- */
	recos: ({
		userId,
		type,
		filters,
	} : {
		userId: string;
		type: 'all' | 'movie' | 'tv_series';
		filters?: {
			sortBy: 'created_at';
			sortOrder: 'asc' | 'desc' | 'random';
			limit?: number;
		}
	}) => filters ? [...usersKeys.details({ userId }), 'recos', type, filters] as const : [...usersKeys.details({ userId }), 'recos', type] as const,

	recosSend: ({
		id,
		type,
	} : {
		id: number;
		type: 'movie' | 'tv_series';
	}) => [...usersKeys.details({ userId: '' }), 'recos-send', type, id] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- Watchlist ------------------------------- */
	watchlist: ({
		userId,
		type,
		filters,
	} : {
		userId: string;
		type: 'movie' | 'tv_series' | 'all';
		filters?: {
			sortBy: 'created_at';
			sortOrder: 'asc' | 'desc' | 'random';
			limit?: number;
		}
	}) => filters ? [...usersKeys.details({ userId }), 'watchlist', type, filters] as const : [...usersKeys.details({ userId }), 'watchlist', type] as const,

	watchlistItem: ({
		userId,
		type,
		id,
	} : {
		userId: string;
		type: 'movie' | 'tv_series';
		id: number;
	}) => [...usersKeys.details({ userId }), 'watchlist-item', type, id] as const,
	/* -------------------------------------------------------------------------- */

	/* ------------------------------- HEART PICKS ------------------------------ */
	heartPicks: ({
		userId,
		type,
	} : {
		userId: string;
		type: 'movie' | 'tv_series';
	}) => [...usersKeys.details({ userId }), 'heart-picks', type] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- Playlists ------------------------------- */
	playlists: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: {
			sortBy: 'updated_at' | 'created_at' | 'likes_count';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.details({ userId }), 'playlists', filters] as const : [...usersKeys.details({ userId }), 'playlists'] as const,

	playlistsSaved: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: {
			sortBy: 'created_at';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.details({ userId }), 'playlists-saved', filters] as const : [...usersKeys.details({ userId }), 'playlists-saved'] as const,

	playlistLike: ({
		userId,
		playlistId,
	} : {
		userId: string;
		playlistId: number;
	}) => [...usersKeys.details({ userId }), 'playlist-like', playlistId] as const,

	playlistSaved: ({
		userId,
		playlistId,
	} : {
		userId: string;
		playlistId: number;
	}) => [...usersKeys.details({ userId }), 'playlist-saved', playlistId] as const,

	playlistsFriends: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: {
			sortBy: 'updated_at' | 'created_at' | 'likes_count';
			sortOrder: 'asc' | 'desc';
		}
	}) => filters ? [...usersKeys.details({ userId: userId }), 'playlists-friends', filters] as const : [...usersKeys.details({ userId: userId }), 'playlists_friends'] as const,
	/* -------------------------------------------------------------------------- */

	/* --------------------------------- ACCOUNT -------------------------------- */
	deleteRequest: ({
		userId,
	} : {
		userId: string;
	}) => [...usersKeys.details({ userId }), 'delete-request'] as const,
	/* -------------------------------------------------------------------------- */
}