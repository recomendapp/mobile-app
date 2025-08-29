import { forwardRef, useRef, useState } from "react";
import { BottomSheetProps } from "../BottomSheetManager";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import ThemedTrueSheet from "@/components/ui/ThemedTrueSheet";
import tw from "@/lib/tw";
import { View } from "react-native";
import ViewShot from 'react-native-view-shot'
import { MediaMovie, MediaPerson, MediaTvSeries, MediaType, Playlist, Profile, User } from "@recomendapp/types";
import Share, { Social } from "react-native-share"
import Constants from 'expo-constants';
import { ShareMovie } from "@/components/share/ShareMovie";
import ShareTvSeries from "@/components/share/ShareTvSeries";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "@/components/ui/text";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/constants/Icons";
import * as Clipboard from 'expo-clipboard';
import { LegendList } from "@legendapp/list";
import * as Burnt from 'burnt';
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { ShareViewRef } from "@/components/share/type";
import { cropImageRatio } from "@/utils/imageManipulator";

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
	user: User | Profile;
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
	const t = useTranslations();
	const { inset } = useTheme();
	const url = `https://${Constants.expoConfig?.extra?.webDomain}${path}`;
	// REFs
	const scrollRef = useRef<ScrollView>(null);
	const captureRef = useRef<ShareViewRef>(null);
	// States
	const [loadingPlatform, setLoadingPlatform] = useState<number | null>(null);

	const renderContent = () => {
		switch (type) {
			case "movie":
				return <ShareMovie ref={captureRef} movie={movie} />;
			case "tv_series":
				return <ShareTvSeries ref={captureRef} tvSeries={tvSeries} />;
			default:
				return null;
		}
	};

	const sharePlatform = [
		{
			label: "Copier le lien",
			icon: Icons.link,
			onPress: async () => {
				await Clipboard.setStringAsync(url);
				Burnt.toast({
					title: upperFirst(t('common.messages.copied', { count: 1, gender: 'male' })),
					preset: 'done',
				});
			}
		},
		{
			label: "Stories",
			icon: Icons.shop,
			onPress: async () => {
				const data = await captureRef.current?.capture();
				if (!data) return;
				await Share.shareSingle({
					social: Social.InstagramStories,
					appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
					title: "Recomend",
					stickerImage: data.sticker,
					backgroundImage: data.backgroundImage,
					backgroundTopColor: data.backgroundTopColor,
					backgroundBottomColor: data.backgroundBottomColor,
					backgroundVideo: data.backgroundVideo,
				});
			}
		},
		{
			label: "More",
			icon: Icons.EllipsisHorizontal,
			onPress: async () => {
				await Share.open({
					url: url,
				})
			}
		}
	];

	// Handlers
	const handlePlatformPress = (item: typeof sharePlatform[number], index: number) => async () => {
		setLoadingPlatform(index);
		try {
			await item.onPress();
		} finally {
			setLoadingPlatform(null);
		}
	};

	return (
		<ThemedTrueSheet
		ref={ref}
		scrollRef={scrollRef as React.RefObject<React.Component<unknown, {}, any>>}
		contentContainerStyle={tw`p-0`}
		{...props}
		>
			<ScrollView
			ref={scrollRef}
			bounces={false}
			contentContainerStyle={{ paddingTop: PADDING_VERTICAL, paddingBottom: inset.bottom, gap: GAP }}
			stickyHeaderIndices={[0]}
			>
				<Text variant="title" style={tw`text-center`}>Share</Text>
				{renderContent()}
				<Separator />
				<LegendList
				data={sharePlatform}
				renderItem={({ item, index }) => (
					<Button
					variant="outline"
					icon={item.icon}
					size="lg"
					style={tw`rounded-full`}
					loading={loadingPlatform === index}
					onPress={handlePlatformPress(item, index)}
					>
						{item.label}
					</Button>
				)}
				contentContainerStyle={{
					paddingHorizontal: PADDING_HORIZONTAL,
					gap: GAP,
				}}
				keyExtractor={item => item.label}
				horizontal
				showsHorizontalScrollIndicator={false}
				/>
				{/* <Button
				onPress={async () => {
					console.log("SHARE");
					const uri = await capture();
					console.log(uri);
					if (uri) {
						await Share.shareSingle({
							social: Social.InstagramStories,
							appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
							stickerImage: uri,
						})
					}
				}}
				>Share</Button> */}
			</ScrollView>
		</ThemedTrueSheet>
	);
});
BottomSheetShare.displayName = "BottomSheetShare";

export default BottomSheetShare;