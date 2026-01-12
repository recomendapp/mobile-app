import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { Playlist } from "@recomendapp/types";
import { forwardRef } from "react";
import { useUserPlaylistSaved } from "@/api/users/hooks/useUserPlaylistSaved";

interface ButtonActionPlaylistSavedProps
	extends React.ComponentProps<typeof Button> {
		playlist: Playlist;
	}

const ButtonActionPlaylistSaved = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonActionPlaylistSavedProps
>(({ playlist, variant = "ghost", size = "icon", icon = Icons.Watchlist, onPress, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const { isSaved, toggle } = useUserPlaylistSaved({ playlistId: playlist.id });

	if (!session || session.user.id === playlist.user_id) return null;

	return (
		<Button
		ref={ref}
		variant={variant}
		size={size}
		icon={icon}
		iconProps={{
			fill: isSaved ? colors.foreground : 'transparent',
			...iconProps
		}}
		onPress={(e) => {
			toggle();
			onPress?.(e);
		}}
		{...props}
		/>
	);
});
ButtonActionPlaylistSaved.displayName = 'ButtonActionPlaylistSaved';

export default ButtonActionPlaylistSaved;
