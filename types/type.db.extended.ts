
import { Database as PostgresSchema } from './__generated__/type.db';
import { Media, MediaPerson, User } from './type.db';

type PostgresTables = PostgresSchema['public']['Tables'];
type PostgresViews = PostgresSchema['public']['Views'];

type TableExtensions = { 
  user_review: {
    body: any; // TODO: Tiptap JSON format
  }
};

type ViewExtensions = {
 /* ---------------------------------- MEDIA --------------------------------- */
  media: {
    id: number,
    main_credit: Media['main_credit'],
    genres: Media['genres'],
    extra_data: Media['extra_data'],
  },
  media_movie: {
    id: number,
    main_credit?: MediaPerson[],
    genres?: {
        id: number
        name: string
    }[],
    extra_data: {
      overview: string,
      release_date: string | null,
      runtime: number | null,
      original_title: string,
      original_language: string,
      status: string,
      type: string,
    },
  },
  media_movie_aggregate_credits: {
    media: Media,
  },
  media_tv_series: {
    id: number,
    main_credit?: MediaPerson[],
    genres?: {
      id: number
      name: string
    }[],
    extra_data: {
      overview: string,
      first_air_date: string | null,
      in_production: boolean,
      last_air_date: string | null,
      number_of_episodes: number,
      number_of_seasons: number,
      original_name: string,
      original_language: string,
      status: string,
      type: string,
    },
  },
  media_person: {
    id: number,
    main_credit?: MediaPerson[],
    genres?: {
      id: number
      name: string
    }[],
    extra_data: {
      birthday: string | null,
      deathday: string | null,
      homepage: string | null,
      imdb_id: string | null,
      known_for_department: string,
      place_of_birth: string | null,
      gender: number,
      biography: string,
    },
  },
  media_person_combined_credits: {
    media: Media,
}
 /* -------------------------------------------------------------------------- */

  /* -------------------------------- PLAYLIST -------------------------------- */
  playlist_items_media: {
    media: Media,
  },
  user_recos_aggregated: {
    media?: Media,
    senders: {
      user: User,
      comment?: string | null,
      created_at: string,
    }[],
  },
};
// <END>
// ☝️ this is the only thing you edit

type TakeDefinitionFromSecond<T extends object, P extends object> = Omit<
  T,
  keyof P
> &
  P;

type NewTables = {
  [k in keyof PostgresTables]: {
    Row: k extends keyof TableExtensions
      ? TakeDefinitionFromSecond<
          PostgresTables[k]['Row'],
          TableExtensions[k]
        >
      : PostgresTables[k]['Row'];
    Insert: k extends keyof TableExtensions
      ? TakeDefinitionFromSecond<
          PostgresTables[k]['Insert'],
          TableExtensions[k]
        >
      : PostgresTables[k]['Insert'];
    Update: k extends keyof TableExtensions
      ? Partial<
          TakeDefinitionFromSecond<
            PostgresTables[k]['Update'],
            TableExtensions[k]
          >
        >
      : PostgresTables[k]['Update'];
	Relationships: PostgresTables[k]['Relationships'];
  };
};

type NewViews = {
  [k in keyof PostgresViews]: {
	Row: k extends keyof ViewExtensions
	  ? TakeDefinitionFromSecond<
		  PostgresViews[k]['Row'],
		  ViewExtensions[k]
		>
	  : PostgresViews[k]['Row'];
	Relationships: PostgresViews[k]['Relationships'];
  };
};

export type Database = {
  public: Omit<PostgresSchema['public'], 'Tables' | 'Views'> & {
    Tables: NewTables;
	Views: NewViews;
  };
};

export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> =
  Database['public']['Tables'][T]['Row'];

export type ViewName = keyof Database['public']['Views'];
export type ViewRow<View extends ViewName> =
  Database['public']['Views'][View]['Row'];

