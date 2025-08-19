import { forwardRef, useRef } from "react";
import { BottomSheetProps } from "../BottomSheetManager";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ThemedTrueSheet from "@/components/ui/ThemedTrueSheet";
import tw from "@/lib/tw";
import { View } from "react-native";
import { captureRef } from 'react-native-view-shot'
import { MediaMovie, MediaPerson, MediaTvSeries, MediaType, Playlist, User } from "@/types/type.db";
import Share, { Social } from "react-native-share"
import Constants from 'expo-constants';
import ShareMovie from "@/components/share/ShareMovie";
import ShareTvSeries from "@/components/share/ShareTvSeries";

interface BottomSheetShareBaseProps extends BottomSheetProps {
	type: MediaType | "user" | "playlist" | "review";
	path: string;
}

type BottomSheetShareMovieProps = {
	type: 'movie';
	movie: MediaMovie;
	tvSeries?: never;
	person?: never;
	user?: never;
	playlist?: never;
}

type BottomSheetShareTvSeriesProps = {
	type: 'tv_series';
	tvSeries: MediaTvSeries;
	movie?: never;
	person?: never;
	user?: never;
	playlist?: never;
}

type BottomSheetSharePersonProps = {
	type: 'person';
	person: MediaPerson;
	movie?: never;
	tvSeries?: never;
	user?: never;
	playlist?: never;
}

type BottomSheetShareUserProps = {
	type: "user";
	user: User;
	movie?: never;
	tvSeries?: never;
	person?: never;
	media?: never;
	playlist?: never;
}

type BottomSheetSharePlaylistProps = {
	type: "playlist";
	playlist: Playlist;
	movie?: never;
	tvSeries?: never;
	person?: never;
	media?: never;
	user?: never;
}

export type BottomSheetShareProps = BottomSheetShareBaseProps &
	(BottomSheetShareMovieProps | BottomSheetShareTvSeriesProps | BottomSheetSharePersonProps | BottomSheetShareUserProps | BottomSheetSharePlaylistProps);

const BottomSheetShare = forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetShareProps
>(({
	id,
	path,
	type,
	movie,
	tvSeries,
	user,
	playlist,
	...props
}, ref) => {
	const url = Constants.expoConfig?.extra?.webDomain + path;
	const imgRef = useRef<View>(null);

	const capture = async () => {
		if (imgRef.current) {
			 const uri = await captureRef(imgRef.current, {
				result: 'data-uri',
			});
			return uri;
		}
		return null;
	};

	const renderContent = () => {
		switch (type) {
			case "movie":
				return <ShareMovie movie={movie} />;
			case "tv_series":
				return <ShareTvSeries tvSeries={tvSeries} />;
			default:
				return null;
		}
	};

	const sharePlatform = [
		{
			label: "Stories",
			onPress: async (uri: string) => {
				console.log("Share to Stories");
				await Share.shareSingle({
					social: Social.InstagramStories,
					appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
					stickerImage: uri,
				})
			}
		}
	]

	return (
		<ThemedTrueSheet
		ref={ref}
		contentContainerStyle={tw`p-0`}
		{...props}
		>


		</ThemedTrueSheet>
	);
});
BottomSheetShare.displayName = "BottomSheetShare";

export default BottomSheetShare;