import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { MediaTvSeries } from "@recomendapp/types";
import tw from "@/lib/tw";

interface ButtonPlaylistTvSeriesAddProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

export const ButtonPlaylistTvSeriesAdd = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonPlaylistTvSeriesAddProps
>(({ tvSeries, icon = Icons.AddPlaylist, variant = "outline", size = "icon", style, onPress: onPressProps, ...props }, ref) => {
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
				tvSeries.id && router.push({
					pathname: '/playlist/add/tv-series/[tv_series_id]',
					params: {
						tv_series_id: tvSeries.id,
						tv_series_name: tvSeries.name,
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
ButtonPlaylistTvSeriesAdd.displayName = 'ButtonPlaylistTvSeriesAdd';
