import { isAndroid } from "@/platform/detection";
import { useTheme } from "@/providers/ThemeProvider";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

export const useModalInsets = (): EdgeInsets => {
	const insets = useSafeAreaInsets();
	const { bottomOffset } = useTheme();

	return ({
		top: insets.top,
		bottom: isAndroid ? bottomOffset : insets.bottom,
		left: insets.left,
		right: insets.right,
	});
};