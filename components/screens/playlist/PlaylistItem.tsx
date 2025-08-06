import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import { ThemedText } from "@/components/ui/ThemedText";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { PlaylistItem as TPlaylistItem } from "@/types/type.db";
import { LinkProps, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

interface PlaylistItemProps extends React.ComponentProps<typeof View> {
	item: TPlaylistItem;
}

const PlaylistItem = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	PlaylistItemProps
>(({ style, item, ...props }, ref) => {
	const router = useRouter();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const { colors } = useTheme();
	return (
		<Pressable
		onPress={() => router.push(item.media?.url as LinkProps['href'])}
		onLongPress={() => openSheet(BottomSheetMedia, {
			media: item.media,
		})}
		>
			<Animated.View
			ref={ref}
			style={[
				tw`flex-row items-center gap-2`,
				style
			]}
			{...props}
			>
				<ImageWithFallback
				alt={item.media?.title ?? ''}
				source={{ uri: item.media?.avatar_url ?? '' }}
				style={[
					{ aspectRatio: 2 / 3, height: 'fit-content' },
					tw.style('rounded-md w-16'),
				]}
				/>
				<View style={tw`shrink`}>
					<ThemedText numberOfLines={1} >
						{item.media?.title}
					</ThemedText>
					<Text style={{ color: colors.mutedForeground }} numberOfLines={1}>
						{item.media?.main_credit?.map((director, index) => director.title).join(', ')}
					</Text>
				</View>
			</Animated.View>
		</Pressable>
	);
});
PlaylistItem.displayName = "PlaylistItem";

export default PlaylistItem;