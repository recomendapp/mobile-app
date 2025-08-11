import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
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
	return (
		<Pressable
		ref={ref}
		onPress={() => {
			if (session) {
				media.media_id && router.push({
					pathname: '/playlist/add/media/[media_id]',
					params: {
						media_id: media.media_id,
						media_title: media?.title,
					},
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
