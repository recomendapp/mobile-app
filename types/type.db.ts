import { Json as JsonGenerated } from "./__generated__/type.db";

export type Json = JsonGenerated;

/* ---------------------------------- USER ---------------------------------- */
export type Profile = Database['public']['Views']['profile']['Row'] & {
};

export type User = (Database['public']['Tables']['user']['Row']) & {
	subscriptions?: UserSubscriptions[] | any;
	favorite_movies?: Media[] | any;
};

export type UserFriend = Database['public']['Tables']['user_friend']['Row'] & {
	friend: User;
	user: User;
};

export type UserFollower = Database['public']['Tables']['user_follower']['Row'] & {
	followee: User;
	user: User;
};

/* ---------------------------------- MEDIA --------------------------------- */
export type MediaType = Database['public']['Enums']['media_type'];

export type MediaMovie = Database['public']['Views']['media_movie']['Row'] & {
	videos?: Database['public']['Tables']['tmdb_movie_videos']['Row'][];
	production_countries?: Database['public']['Tables']['tmdb_movie_production_countries']['Row'][];
	spoken_languages?: Database['public']['Tables']['tmdb_movie_spoken_languages']['Row'][];
	cast?: MediaMoviePerson[];
};

export type MediaMoviePerson = Database['public']['Tables']['tmdb_movie_credits']['Row'] & {
	person?: MediaPerson;
	role?: Database['public']['Tables']['tmdb_movie_roles']['Row'];
};

export type MediaMovieAggregateCredits = Database['public']['Views']['media_movie_aggregate_credits']['Row'] & {
};

export type MediaTvSeries = Database['public']['Views']['media_tv_series']['Row'] & {
	videos?: Database['public']['Tables']['tmdb_tv_series_videos']['Row'][];
	production_countries?: Database['public']['Tables']['tmdb_tv_series_production_countries']['Row'][];
	spoken_languages?: Database['public']['Tables']['tmdb_tv_series_spoken_languages']['Row'][];
	cast?: MediaTvSeriesPerson[];
	seasons?: MediaTvSeriesSeason[];
	specials?: MediaTvSeriesSeason[];
};

export type MediaTvSeriesPerson = Database['public']['Tables']['tmdb_tv_series_credits']['Row'] & {
	person?: MediaPerson;
};

export type MediaTvSeriesSeason = Database['public']['Views']['media_tv_series_seasons']['Row'] & {
	episodes?: MediaTvSeriesEpisode[];
	serie?: MediaTvSeries;
};

export type MediaTvSeriesEpisode = Database['public']['Views']['media_tv_series_episodes']['Row'] & {
};

export type MediaTvSeriesAggregateCredits = any;

export type MediaPerson = Database['public']['Views']['media_person']['Row'] & {
};

export type Media = MediaMovie & MediaTvSeries & MediaPerson & {
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- ACTIVITY -------------------------------- */
export type UserActivity = Database['public']['Tables']['user_activity']['Row'] & {
	user?: User;
	review?: UserReview | null;
	media?: Media;
};
/* -------------------------------------------------------------------------- */

/* ---------------------------------- RECOS --------------------------------- */
export type UserRecosAggregated = Database['public']['Views']['user_recos_aggregated']['Row'] & {
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- WATCHLIST ------------------------------- */
export type UserWatchlist = Database['public']['Tables']['user_watchlist']['Row'] & Database['public']['Views']['user_watchlist_random']['Row'] & {
	media?: Media;
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- REVIEW --------------------------------- */
export type UserReview =
	Database['public']['Tables']['user_review']['Row']
	& {
		activity?: UserActivity;
	};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PLAYLIST -------------------------------- */
export type Playlist = Database['public']['Tables']['playlists']['Row'] & {
	user?: User;
	guests?: PlaylistGuest[];
	items?: PlaylistItem[];
};

export type PlaylistItem = Database['public']['Tables']['playlist_items']['Row'] & {
	media?: Media;
	playlist?: Playlist;
	user?: User;
};

export type PlaylistGuest = Database['public']['Tables']['playlist_guests']['Row'] & {
	user?: User;
	playlist?: Playlist;
};

export type PlaylistType = 'personal' | 'saved';
/* -------------------------------------------------------------------------- */

/* ---------------------------------- FEED ---------------------------------- */
export type UserFeedCastCrew = Database['public']['Views']['user_feed_cast_crew']['Row'] & {
	media?: Media;
	person?: MediaPerson;
};
/* -------------------------------------------------------------------------- */


/* ------------------------------ SUBSCRIPTIONS ----------------------------- */
export type UserSubscriptions = Database['public']['Tables']['user_subscriptions']['Row'] & {
	prices?: Prices[];
};
/* -------------------------------------------------------------------------- */

/* --------------------------------- PRICES --------------------------------- */
export type Prices = Database['public']['Tables']['prices']['Row'] & {
	product?: Products;
};
/* -------------------------------------------------------------------------- */

/* -------------------------------- PRODUCTS -------------------------------- */
export type Products = Database['public']['Tables']['products']['Row'] & {
	prices?: Prices[];
};
/* -------------------------------------------------------------------------- */