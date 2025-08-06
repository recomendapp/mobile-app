import { forwardRef } from "react";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "expo-router";
import BottomSheetPlaylistCreate from "../bottom-sheets/sheets/BottomSheetPlaylistCreate";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { Button } from "../ui/Button";

interface ButtonCreatePlaylistProps extends React.ComponentPropsWithoutRef<typeof Button> {
	redirectAfterCreate?: boolean;
};

const ButtonCreatePlaylist = forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonCreatePlaylistProps
>(({ variant = "ghost", icon = Icons.Add, size = "icon", onPress, redirectAfterCreate = true, ...props }, ref) => {
	const { colors } = useTheme();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const router = useRouter();
	const handlePress = () => {
		openSheet(BottomSheetPlaylistCreate, {
			onCreate: (playlist) => {
				redirectAfterCreate && router.push(`/playlist/${playlist.id}`);
			}
		});
		onPress?.();
	};
	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
		onPress={handlePress}
		{...props}
		/>
	)
});

export default ButtonCreatePlaylist;