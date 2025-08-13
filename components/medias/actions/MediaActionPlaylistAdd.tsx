import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { Media } from "@/types/type.db";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface MediaActionPlaylistAddProps
	extends React.ComponentProps<typeof Button> {
		media: Media;
	}

const MediaActionPlaylistAdd = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionPlaylistAddProps
>(({ media, icon = Icons.AddPlaylist, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
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
			onPressProps?.();
		}}
		iconProps={{
			size: ICON_ACTION_SIZE,
			...iconProps,
		}}
		{...props}
		/>
	);
});
MediaActionPlaylistAdd.displayName = 'MediaActionPlaylistAdd';

export default MediaActionPlaylistAdd;
