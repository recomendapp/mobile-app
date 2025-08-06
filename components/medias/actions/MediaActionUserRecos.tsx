import React from "react"
import { Pressable } from "react-native";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetSendReco from "@/components/bottom-sheets/sheets/BottomSheetSendReco";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname, useRouter } from "expo-router";

const ICON_SIZE = 24;

interface MediaActionUserRecosProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserRecos = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserRecosProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	return (
		<Pressable
		ref={ref}
		onPress={() => {
			if (session) {
				openSheet(BottomSheetSendReco, {
					media: media,
				});
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
		}}
		{...props}
		>
			<Icons.Reco color={colors.foreground} size={ICON_SIZE} />
		</Pressable>
	);
});
MediaActionUserRecos.displayName = 'MediaActionUserRecos';

export default MediaActionUserRecos;
