import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import BottomSheetAddToPlaylist from "@/components/bottom-sheets/sheets/BottomSheetAddToPlaylist";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";

const ICON_SIZE = 24;

interface MediaActionPlaylistAddProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionPlaylistAdd = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionPlaylistAddProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	return (
		<Pressable
		ref={ref}
		onPress={() => {
			if (session) {
				openSheet(BottomSheetAddToPlaylist, {
					media: media,
				});
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
		}}
		{...props}
		>
			<Icons.AddPlaylist color={colors.foreground} size={ICON_SIZE} />
		</Pressable>
	);
});
MediaActionPlaylistAdd.displayName = 'MediaActionPlaylistAdd';

export default MediaActionPlaylistAdd;
