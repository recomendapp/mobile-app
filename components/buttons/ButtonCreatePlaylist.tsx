import { forwardRef } from "react";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthProvider";
import { usePlaylistInsertMutation } from "@/features/playlist/playlistMutations";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import BottomSheetQuickCreatePlaylist from "../bottom-sheets/sheets/BottomSheetQuickCreatePlaylist";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { GestureResponderEvent, TouchableOpacity } from "react-native";

interface ButtonCreatePlaylistProps extends Omit<React.ComponentPropsWithoutRef<typeof TouchableOpacity>, 'children'> {
	size?: number;
	color?: string;
	redirectAfterCreate?: boolean;
};

const ButtonCreatePlaylist = forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonCreatePlaylistProps
>(({ size, color, onPress, redirectAfterCreate = true, ...props }, ref) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { user } = useAuth();
	const { openSheet } = useBottomSheetStore();
	const router = useRouter();
	const createPlaylistMutation = usePlaylistInsertMutation({
		userId: user?.id,
	})

	const handleCreatePlaylist = async (playlistName: string) => {
		await createPlaylistMutation.mutateAsync({
			title: playlistName,
		}, {
			onSuccess: (playlist) => {
				Burnt.toast({
					title: upperFirst(t('common.messages.added')),
					preset: 'done',
				});
				redirectAfterCreate && router.push(`/playlist/${playlist.id}`);
			},
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.errors.an_error_occurred')),
					preset: 'error',
				})
			}
		});
	};
	const handlePress = (event: GestureResponderEvent) => {
		openSheet(BottomSheetQuickCreatePlaylist, {
			onConfirm: handleCreatePlaylist,
		});
		onPress?.(event);
	};
	return (
		<TouchableOpacity
		ref={ref}
		onPress={handlePress}
		{...props}
		>
			<Icons.Add size={size ?? 20} color={color ?? colors.foreground} />
		</TouchableOpacity>
	)
});

export default ButtonCreatePlaylist;