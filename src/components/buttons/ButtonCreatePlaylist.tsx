import { forwardRef, useCallback } from "react";
import { Icons } from "@/constants/Icons";
import { useRouter } from "expo-router";
import BottomSheetPlaylistCreate from "../bottom-sheets/sheets/BottomSheetPlaylistCreate";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { Button } from "../ui/Button";
import tw from "@/lib/tw";
import { GestureResponderEvent } from "react-native";

interface ButtonCreatePlaylistProps extends React.ComponentPropsWithoutRef<typeof Button> {
	redirectAfterCreate?: boolean;
};

const ButtonCreatePlaylist = forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonCreatePlaylistProps
>(({ variant = "outline", icon = Icons.Add, size = "icon", onPress, redirectAfterCreate = true, ...props }, ref) => {
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	const router = useRouter();
	const handlePress = useCallback((e: GestureResponderEvent) => {
		openSheet(BottomSheetPlaylistCreate, {
			onCreate: (playlist) => {
				redirectAfterCreate && router.push(`/playlist/${playlist.id}`);
			}
		});
		onPress?.(e);
	}, [openSheet, router, redirectAfterCreate, onPress]);
	return (
		<Button
		ref={ref}
		variant={variant}
		icon={icon}
		size={size}
		onPress={handlePress}
		style={tw`rounded-full`}
		{...props}
		/>
	)
});
ButtonCreatePlaylist.displayName = "ButtonCreatePlaylist";

export default ButtonCreatePlaylist;