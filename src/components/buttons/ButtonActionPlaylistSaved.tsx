import * as React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistSavedQuery } from "@/features/user/userQueries";
import { useUserPlaylistSavedDeleteMutation, useUserPlaylistSavedInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";

interface ButtonActionPlaylistSavedProps
	extends React.ComponentProps<typeof Button> {
		playlistId: number;
	}

const ButtonActionPlaylistSaved = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonActionPlaylistSavedProps
>(({ playlistId, variant = "ghost", size = "icon", icon = Icons.Watchlist, onPress, iconProps, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const t = useTranslations();
	const {
		data: saved,
	} = useUserPlaylistSavedQuery({
		userId: session?.user.id,
		playlistId: playlistId,
	});
	const insertSaved = useUserPlaylistSavedInsertMutation();
	const deleteSaved = useUserPlaylistSavedDeleteMutation();

	const handleLike = async () => {
		if (!session?.user.id || !playlistId) return;
		await insertSaved.mutateAsync({
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
		if (!saved) return;
		await deleteSaved.mutateAsync({
			savedId: saved.id
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
			fill: saved ? colors.foreground : 'transparent',
			...iconProps
		}}
		onPress={() => {
			saved ? handleUnlike() : handleLike();
			onPress?.();
		}}
		{...props}
		/>
	);
});
ButtonActionPlaylistSaved.displayName = 'ButtonActionPlaylistSaved';

export default ButtonActionPlaylistSaved;
