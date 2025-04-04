import { forwardRef } from "react";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import { useRouter } from "expo-router";
import BottomSheetPlaylistCreate from "../bottom-sheets/sheets/BottomSheetPlaylistCreate";
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
	const { openSheet } = useBottomSheetStore();
	const router = useRouter();
	const handlePress = (event: GestureResponderEvent) => {
		openSheet(BottomSheetPlaylistCreate, {
			onCreate: (playlist) => {
				redirectAfterCreate && router.push(`/playlist/${playlist.id}`);
			}
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