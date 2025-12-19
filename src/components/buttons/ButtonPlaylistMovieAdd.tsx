import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { MediaMovie } from "@recomendapp/types";
import tw from "@/lib/tw";

interface ButtonPlaylistMovieAddProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

export const ButtonPlaylistMovieAdd = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonPlaylistMovieAddProps
>(({ movie, icon = Icons.AddPlaylist, variant = "outline", size = "icon", style, onPress: onPressProps, ...props }, ref) => {
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
			onPressProps?.(e);
		}}
		style={{
			...tw`rounded-full`,
			...style,
		}}
		{...props}
		/>
	);
});
ButtonPlaylistMovieAdd.displayName = 'ButtonPlaylistMovieAdd';
