import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { Media } from "@/types/type.db";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetAddToPlaylist from "@/components/bottom-sheets/sheets/BottomSheetAddToPlaylist";

const ICON_SIZE = 30;

interface MediaActionPlaylistAddProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionPlaylistAdd = React.forwardRef<
	React.ElementRef<typeof Pressable>,
	MediaActionPlaylistAddProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { openSheet } = useBottomSheetStore();
	return (
		<Pressable
		ref={ref}
		onPress={() => {
			openSheet(BottomSheetAddToPlaylist, {
				media: media,
			})
		}}
		{...props}
		>
			<Icons.AddPlaylist color={colors.foreground} size={ICON_SIZE} />
		</Pressable>
	);
});
MediaActionPlaylistAdd.displayName = 'MediaActionPlaylistAdd';

export default MediaActionPlaylistAdd;
