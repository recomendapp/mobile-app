import * as React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistLikeQuery } from "@/features/user/userQueries";
import { useUserPlaylistLikeDeleteMutation, useUserPlaylistLikeInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

interface ButtonActionPlaylistLikeProps
	extends React.ComponentProps<typeof Button> {
		playlistId: number;
	}

const ButtonActionPlaylistLike = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonActionPlaylistLikeProps
>(({ playlistId, variant = "ghost", size = "icon", icon = Icons.like, onPress, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const t = useTranslations();
	const {
		data: like,
	} = useUserPlaylistLikeQuery({
		userId: session?.user.id,
		playlistId: playlistId,
	});
	const insertLike = useUserPlaylistLikeInsertMutation();
	const deleteLike = useUserPlaylistLikeDeleteMutation();

	const handleLike = async () => {
		if (!session?.user.id || !playlistId) return;
		await insertLike.mutateAsync({
			userId: session.user.id,
			playlistId: playlistId,
		}, {
			onError: (error) => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		});
	};
	const handleUnlike = async () => {
		if (!like) return;
		await deleteLike.mutateAsync({
			likeId: like.id
		}, {
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
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
		onPress={() => {
			like ? handleUnlike() : handleLike();
			onPress?.();
		}}
		{...props}
		/>
	);
});
ButtonActionPlaylistLike.displayName = 'ButtonActionPlaylistLike';

export default ButtonActionPlaylistLike;
