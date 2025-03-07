export const userKeys = {
	all: ['user'] as const,
	search: (filters?: {
		search?: string | null;
	}) => filters ? [...userKeys.all, 'search', filters] as const : [...userKeys.all, 'search'] as const,
	details: () => [...userKeys.all, 'details'] as const,
	/**
	 * Fetches details of a user
	 * @param userId The user id
	 * @returns The user details
	 */
	detail: (userId: string) => [...userKeys.all, userId] as const,
	/**
	 * Fetches friends of a user
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns List of friends
	 */
	friends: (
		userId: string,
		filters?: {
			search?: string | null
		}
	) => filters ? [...userKeys.detail(userId), 'friends', filters] : [...userKeys.detail(userId), 'friends'] as const,

	/**
	 * Fetches followers of a user
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns List of followers
	 */
	followers: (
		userId: string,
		filters?: {
			search?: string | null
		}
	) => filters ? [...userKeys.detail(userId), 'followers', filters] as const : [...userKeys.detail(userId), 'followers'] as const,

	/**
	 * Fetches followers requests of a user
	 * @param userId The user id
	 * @returns List of followers requests
	 */
	followersRequests: (
		userId: string,
	) => [...userKeys.detail(userId), 'followers-requests'] as const,

	/**
	 * Fetches followees of a user
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns List of followees
	 */
	followees: (
		userId: string,
		filters?: {
			infinite?: boolean;
			search?: string | null
		},
	) => filters ? [...userKeys.detail(userId), 'followees', filters] as const : [...userKeys.detail(userId), 'followees'] as const,
	followProfile: (userId: string, profileId: string) => [...userKeys.detail(userId), 'follow', profileId] as const,


	/* -------------------------------- ACTIVITY -------------------------------- */
	activities: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'activities', filters] as const : [...userKeys.detail(userId), 'activities'] as const,

	activity: ({
		userId,
		mediaId,
	} : {
		userId: string;
		mediaId: number;
	}) => [...userKeys.detail(userId), 'activity', mediaId] as const,

	followersRating: ({
		userId,
		mediaId,
	} : {
		userId: string;
		mediaId: number;
	}) => [...userKeys.detail(userId), 'followers-rating', mediaId] as const,
	/* -------------------------------------------------------------------------- */

	/* --------------------------------- REVIEW --------------------------------- */
	reviews: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'reviews', filters] as const : [...userKeys.detail(userId), 'reviews'] as const,

	review: ({
		reviewId,
	} : {
		reviewId: number;
	}) => [...userKeys.all, 'review', reviewId] as const,

	reviewLike: ({
		reviewId,
		userId,
	} : {
		reviewId: number;
		userId: string;
	}) => [...userKeys.detail(userId), 'review-like', reviewId] as const,
	/* -------------------------------------------------------------------------- */

	/* ---------------------------------- RECOS --------------------------------- */
	recos: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'recos', filters] as const : [...userKeys.detail(userId), 'recos'] as const,

	recosSend: ({
		mediaId,
	} : {
		mediaId: number;
	}) => [...userKeys.all, 'recos-send', mediaId] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- WATCHLIST ------------------------------- */
	watchlist: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'watchlist', filters] as const : [...userKeys.detail(userId), 'watchlist'] as const,

	watchlistItem: ({
		userId,
		mediaId,
	} : {
		userId: string;
		mediaId: number;
	}) => [...userKeys.detail(userId), 'watchlist-item', mediaId] as const,
	/* -------------------------------------------------------------------------- */

	/* ---------------------------------- LIKES --------------------------------- */
	likes: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'likes', filters] as const : [...userKeys.detail(userId), 'likes'] as const,
	/* -------------------------------------------------------------------------- */

	/* ---------------------------------- FEED ---------------------------------- */
	/**
	 * Fetches the user's feed
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns The user's feed
	 */
	feed: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'feed', filters] as const : [...userKeys.detail(userId), 'feed'] as const,
	/* -------------------------------------------------------------------------- */

	/* -------------------------------- PLAYLIST -------------------------------- */
	/**
	 * Fetches the user's playlists
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns The user's playlists
	 */
	playlists: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'playlists', filters] as const : [...userKeys.detail(userId), 'playlists'] as const,

	playlistSaved: ({
		userId,
		playlistId,
	} : {
		userId: string;
		playlistId: number;
	}) => [...userKeys.detail(userId), 'playlist-saved', playlistId] as const,

	playlistsSaved: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'playlists-saved', filters] as const : [...userKeys.detail(userId), 'playlists-saved'] as const,
	/* -------------------------------------------------------------------------- */





	/* -------------------------------------------------------------------------- */
	/*                                     OLD                                    */
	/* -------------------------------------------------------------------------- */


	movies: (userId: string) => [...userKeys.detail(userId), 'movies'] as const,
	movie: (userId: string, movieId: number) => [...userKeys.movies(userId), movieId] as const,
	movieActivity: (userId: string, movieId: number) => [...userKeys.movie(userId, movieId), 'activity'] as const,
	movieWatchlist: (userId: string, movieId: number) => [...userKeys.movie(userId, movieId), 'watchlist'] as const,
	movieActivities: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'activities', filters] as const : [...userKeys.detail(userId), 'activities'] as const,

	collection: (userId: string) => [...userKeys.detail(userId), 'collection'] as const,
	collectionLikes: (userId: string) => [...userKeys.collection(userId), 'likes'] as const,
	collectionWatchlist: (userId: string) => [...userKeys.collection(userId), 'watchlist'] as const,
	collectionGuidelist: (userId: string) => [...userKeys.collection(userId), 'guidelist'] as const,
	/**
	 * Fetches the user's guidelist
	 * @param userId The user id
	 * @returns The user's guidelist
	 */
	guidelist: (
		userId: string,
		filters?: {
			order?: 'created_at-desc' | 'created_at-asc' | 'random';
			limit?: number;
		}
	) => filters ? [...userKeys.detail(userId), 'guidelist', filters] as const : [...userKeys.detail(userId), 'guidelist'] as const,

	/**
	 * Fetches the user's watchlist
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns The user's watchlist
	 */
	// watchlist: (
	// 	userId: string,
	// 	filters?: {
	// 		order?: 'created_at-desc' | 'created_at-asc' | 'random';
	// 		limit?: number;
	// 	}
	// ) => filters ? [...userKeys.detail(userId), 'watchlist', filters] as const : [...userKeys.detail(userId), 'watchlist'] as const,
	// /**
	//  * Fetches the user's feed
	//  * @param userId The user id
	//  * @param filters The filters (optional)
	//  * @returns The user's feed
	//  */
	// feed: (
	// 	userId: string,
	// 	filters?: any
	// 	// filters?: {
	// 	// 	limit?: number;
	// 	// }
	// ) => filters ? [...userKeys.detail(userId), 'feed', filters] as const : [...userKeys.detail(userId), 'feed'] as const,
	feedCastCrew: (
		userId: string,
		filters?: any
	) => filters ? [...userKeys.detail(userId), 'feed-cast-crew', filters] as const : [...userKeys.detail(userId), 'feed-cast-crew'] as const,
	/**
	 * Fetches playlists of friends
	 * @param userId The user id
	 * @param filters The filters (optional)
	 * @returns The playlists of friends
	 */
	playlistsFriends: ({
		userId,
		filters,
	} : {
		userId: string;
		filters?: any;
	}) => filters ? [...userKeys.detail(userId), 'playlists-friends', filters] as const : [...userKeys.detail(userId), 'playlists-friends'] as const,

	/**
	 * Discover users
	 * @param filters The filters (optional)
	 * @returns The discovered users
	 */
	discovery: ({
		filters,
	} : {
		filters?: any
	}) => filters ? [...userKeys.all, 'discovery', filters] as const : [...userKeys.all, 'discovery'] as const,
};
