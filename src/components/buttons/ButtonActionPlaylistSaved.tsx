import * as React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserPlaylistSavedQuery } from "@/features/user/userQueries";
import { useUserPlaylistSavedDeleteMutation, useUserPlaylistSavedInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "../Toast";

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
	const toast = useToast();
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
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};
	const handleUnlike = async () => {
		if (!saved) return;
		await deleteSaved.mutateAsync({
			savedId: saved.id
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
			fill: saved ? colors.foreground : 'transparent',
			...iconProps
		}}
		onPress={(e) => {
			saved ? handleUnlike() : handleLike();
			onPress?.(e);
		}}
		{...props}
		/>
	);
});
ButtonActionPlaylistSaved.displayName = 'ButtonActionPlaylistSaved';

export default ButtonActionPlaylistSaved;
