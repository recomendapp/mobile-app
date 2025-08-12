import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { Media } from "@/types/type.db";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface MediaActionUserRecosProps
	extends React.ComponentProps<typeof Button> {
		media: Media;
	}

const MediaActionUserRecos = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserRecosProps
>(({ media, icon = Icons.Reco, variant = "ghost", size = "icon", onPress: onPressProps, iconProps, ...props }, ref) => {
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
					pathname: '/media/[media_id]/reco/send',
					params: {
						media_id: media.media_id,
						media_title: media.title,
					}
				})
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
MediaActionUserRecos.displayName = 'MediaActionUserRecos';

export default MediaActionUserRecos;
