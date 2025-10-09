import { useTheme } from "@/providers/ThemeProvider";
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from "react-native-keyboard-controller";

interface KeyboardAwareScrollViewProps extends React.ComponentPropsWithoutRef<typeof RNKeyboardAwareScrollView> {
	addToolbarOffset?: boolean;
}

export const KeyboardAwareScrollView = ({
	bottomOffset: bottomOffsetProps,
	addToolbarOffset = true,
	...props
}: KeyboardAwareScrollViewProps) => {
	const bottomOffset = (bottomOffsetProps ?? 0) + (addToolbarOffset ? 62 : 0);
	return <RNKeyboardAwareScrollView bottomOffset={bottomOffset} {...props} />;
};
