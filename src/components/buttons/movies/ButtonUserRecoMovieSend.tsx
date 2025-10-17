import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { MediaMovie } from "@recomendapp/types";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface ButtonUserRecoMovieSendProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

const ButtonUserRecoMovieSend = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonUserRecoMovieSendProps
>(({ movie, icon = Icons.Reco, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
		onPress={(e) => {
			if (session) {
				movie.id && router.push({
					pathname: '/reco/send/movie/[movie_id]',
					params: {
						movie_id: movie.id,
						movie_title: movie.title,
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
			onPressProps?.(e);
		}}
		iconProps={{
			size: ICON_ACTION_SIZE,
			...iconProps,
		}}
		{...props}
		/>
	);
});
ButtonUserRecoMovieSend.displayName = 'ButtonUserRecoMovieSend';

export default ButtonUserRecoMovieSend;
