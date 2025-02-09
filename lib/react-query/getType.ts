export const getType = (obj: any) => {
	// USER
	if ('username' in obj && 'full_name' in obj) return ('user');
	// FRIENDS
	else if ('friend' in obj) return ('user_riend');
	// PLAYLISTS
	else if ('user_id' in obj && 'title' in obj && 'description' in obj && 'private' in obj && 'poster_url' in obj) return ('playlists');
	// PLAYLIST_GUESTS
	else if ('playlist_id' in obj && 'user_id' in obj && 'created_at' in obj && 'edit' in obj) return ('playlist_guests');
	// PLAYLIST_ITEMS
	else if ('comment' in obj && 'created_at' in obj && 'media_id' in obj && 'playlist_id' in obj && 'rank' in obj && 'user_id' in obj) return ('playlist_items');
	// USER_WATCHLIST
	else if ('comment' in obj && 'created_at' in obj && 'media_id' in obj && 'status' in obj) return ('user_watchlist');
	// TMDB_PERSON
	else if ('id' in obj && 'name' in obj && 'gender' in obj && 'profile_path' in obj && 'popularity' in obj && 'known_for_department' in obj) return ('person');
	// TMDB_MOVIE
	else if ('id' in obj && 'title' in obj && 'overview' in obj && 'release_date' in obj && 'poster_path' in obj && 'backdrop_path' in obj && 'runtime' in obj && 'genres' in obj && 'directors' in obj) return ('movie');
	// USER_ACTIVITY
	else if ('created_at' in obj && 'watched_date' in obj && 'is_liked' in obj && 'media_id' in obj && 'rating' in obj && 'user_id' in obj) return ('user_activity');
	// USER_REVIEW
	else if ('body' in obj && 'created_at' in obj && 'media_id' in obj && 'title' in obj && 'user_id' in obj) return ('user_review');
	// USER_MOVIE_GUIDELIST_ITEM
	else if ('created_at' in obj && 'guidelist_id' in obj && 'user_id' in obj && 'comment' in obj) return ('user_movie_guidelist_item');
	// USER_FOLLOWER
	else if ('followee_id' in obj && 'user_id' in obj) return ('user_follower');
	
	return undefined;
};
