import { forwardRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistLikeQuery } from "@/features/user/userQueries";
import { useUserPlaylistLikeDeleteMutation, useUserPlaylistLikeInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "../Toast";
import { Playlist } from "@recomendapp/types";

interface ButtonActionPlaylistLikeProps
	extends React.ComponentProps<typeof Button> {
		playlist: Playlist;
	}

const ButtonActionPlaylistLike = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonActionPlaylistLikeProps
>(({ playlist, variant = "ghost", size = "icon", icon = Icons.like, onPress, iconProps, ...props }, ref) => {
	const toast = useToast();
	const { colors } = useTheme();
	const { session } = useAuth();
	const t = useTranslations();
	const {
		data: like,
	} = useUserPlaylistLikeQuery({
		userId: session?.user.id,
		playlistId: playlist.id,
	});
	const { mutateAsync: insertLike } = useUserPlaylistLikeInsertMutation();
	const { mutateAsync: deleteLike } = useUserPlaylistLikeDeleteMutation();

	const handleLike = async () => {
		if (!session?.user.id || !playlist.id) return;
		await insertLike({
			userId: session.user.id,
			playlistId: playlist.id,
		}, {
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};
	const handleUnlike = async () => {
		if (!like) return;
		await deleteLike({
			likeId: like.id
		}, {
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};

	if (!session) return null;

	return (
		<Button
		ref={ref}
		variant={variant}
		size={size}
		icon={icon}
		iconProps={{
			color: like ? colors.accentPink : colors.foreground,
			fill: like ? colors.accentPink : 'transparent',
			...iconProps
		}}
		onPress={(e) => {
			if (like) {
				handleUnlike();
			} else {
				handleLike();
			}
			onPress?.(e);
		}}
		{...props}
		/>
	);
});
ButtonActionPlaylistLike.displayName = 'ButtonActionPlaylistLike';

export default ButtonActionPlaylistLike;
