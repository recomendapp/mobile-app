import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";
import { MediaMovie } from "@/types/type.db";

interface ButtonPlaylistMovieAddProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

export const ButtonPlaylistMovieAdd = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonPlaylistMovieAddProps
>(({ movie, icon = Icons.AddPlaylist, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, ...props }, ref) => {
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
				movie.id && router.push({
					pathname: '/playlist/add/movie/[movie_id]',
					params: {
						movie_id: movie.id,
						movie_title: movie.title,
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
ButtonPlaylistMovieAdd.displayName = 'ButtonPlaylistMovieAdd';
