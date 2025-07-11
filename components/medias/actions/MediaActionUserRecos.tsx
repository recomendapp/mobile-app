import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetSendReco from "@/components/bottom-sheets/sheets/BottomSheetSendReco";

const ICON_SIZE = 30;

interface MediaActionUserRecosProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserRecos = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserRecosProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { openSheet } = useBottomSheetStore();
	return (
		<Pressable
		ref={ref}
		onPress={() => {
			openSheet(BottomSheetSendReco, {
				media: media,
			})
		}}
		{...props}
		>
			<Icons.Reco color={colors.foreground} size={ICON_SIZE} />
		</Pressable>
	);
});
MediaActionUserRecos.displayName = 'MediaActionUserRecos';

export default MediaActionUserRecos;
