import { BORDER_RADIUS } from "@/theme/globals";
import { MediaMovie, MediaPerson, MediaTvSeries, MediaTvSeriesEpisode, MediaTvSeriesSeason, MediaType, Playlist, User } from "@recomendapp/types";
import { Href } from "expo-router";
import { StyleProp, ViewStyle } from "react-native";

interface MediaBaseProps {
	type: MediaType | 'playlist' | 'user';
};
type MediaMovieDetailsProps = {
	type: 'movie',
	media: MediaMovie
};
type MediaTvSeriesDetailsProps = {
	type: 'tv_series',
	media: MediaTvSeries
};
type MediaTvSeriesSeasonDetailsProps = {
	type: 'tv_season',
	media: MediaTvSeriesSeason
};
type MediaTvSeriesEpisodeDetailsProps = {
	type: 'tv_episode',
	media: MediaTvSeriesEpisode
};
type MediaPersonDetailsProps = {
	type: 'person',
	media: MediaPerson
};

type MediaPlaylistDetailsProps = {
	type: 'playlist',
	media: Playlist
};

type MediaUserDetailsProps = {
	type: 'user',
	media: User
};

export type MediaDetailsProps = MediaBaseProps & (
	MediaMovieDetailsProps
	| MediaTvSeriesDetailsProps
	| MediaTvSeriesSeasonDetailsProps
	| MediaTvSeriesEpisodeDetailsProps
	| MediaPersonDetailsProps
	| MediaPlaylistDetailsProps
	| MediaUserDetailsProps
);

const getMediaDetails = ({
	type,
	media
} : MediaDetailsProps) => {
	const getTitle = () => {
		switch (type) {
			case 'movie':
				return media.title;
			case 'tv_series':
				return media.name;
			case 'person':
				return media.name;
			case 'playlist':
				return media.title;
			case 'user':
				return media.full_name;
			default:
				return null;
		}
	};
	const getSubtitle = () => {
		switch (type) {
			case 'movie':
				return media.directors?.map(director => director.name).join(', ');
			case 'tv_series':
				return media.created_by?.map(creator => creator.name).join(', ');
			case 'person':
				return media.known_for_department;
			default:
				return null;
		}
	};
	const getImage = () => {
		switch (type) {
			case 'movie':
				return media.poster_url;
			case 'tv_series':
				return media.poster_url;
			case 'person':
				return media.profile_url;
			case 'playlist':
				return media.poster_url;
			case 'user':
				return media.avatar_url;
			default:
				return null;
		}
	};
	const getDate = () => {
		switch (type) {
			case 'movie':
				return media.release_date;
			case 'tv_series':
				return media.first_air_date;
			default:
				return null;
		}
	};
	const getDescription = () => {
		switch (type) {
			case 'movie':
				return media.overview;
			case 'tv_series':
				return media.overview;
			case 'person':
				return media.biography;
			case 'playlist':
				return media.description;
			case 'user':
				return media.bio;
			default:
				return null;
		}
	};
	const getImageStyle = (): StyleProp<ViewStyle> => {
		switch (type) {
			case 'movie':
			case 'tv_series':
			case 'person':
				return { aspectRatio: 2 / 3, borderRadius: BORDER_RADIUS };
			case 'playlist':
				return { aspectRatio: 1 / 1, borderRadius: BORDER_RADIUS };
			case 'user':
				return { aspectRatio: 1 / 1, borderRadius: BORDER_RADIUS };
			default:
				return {};
		}
	};
	const getUrl = (): Href => {
		switch (type) {
			case 'movie':
				return `/film/${media.slug ?? media.id}`;
			case 'tv_series':
				return `/tv-series/${media.slug ?? media.id}`;
			case 'person':
				return `/person/${media.slug ?? media.id}`;
			case 'playlist':
				return `/playlist/${media.id}`;
			case 'user':
				return `/user/${media.username}`;
			default:
				return '/';
		}
	};
	return {
		title: getTitle(),
		subtitle: getSubtitle(),
		imageUrl: getImage(),
		date: getDate(),
		description: getDescription(),
		style: getImageStyle(),
		url: getUrl(),
		posterClassName: type === 'movie'
			? 'aspect-[2/3] rounded-md'
			: type === 'tv_series'
			? 'aspect-[2/3] rounded-md'
			: type === 'person'
			? 'aspect-[1/1] rounded-full'
			: 'aspect-[2/3] rounded-md',
	}

};

const getMediaUrlPrefix = (type: MediaType) => {
	switch (type) {
		case 'movie':
			return '/film';
		case 'tv_series':
			return '/tv-series';
		case 'person':
			return '/person';
		default:
			return '';
	}
}

const getMediaUrl = ({ id, type, slug }: { id?: number; type?: MediaType; slug?: string | null }) => {
	if (!id || !type) return '';
	return `${getMediaUrlPrefix(type)}/${slug ?? id}`;
}

export {
	getMediaDetails,
	getMediaUrl,
	getMediaUrlPrefix,
};