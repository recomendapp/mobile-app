import { Component } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import GBottomSheetModal, {
  BottomSheetModalProps as GBottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomSheetModalProps extends GBottomSheetModalProps {}

export default class BottomSheetModal extends Component<BottomSheetModalProps> {
  render() {
    return <ThemedBottomSheetModal {...this.props} />;
  }
}

const ThemedBottomSheetModal = ({ backgroundStyle, handleIndicatorStyle, ...props }: BottomSheetModalProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <GBottomSheetModal
    topInset={insets.top}
    handleIndicatorStyle={[
      { backgroundColor: colors.mutedForeground },
      handleIndicatorStyle,
    ]}
    backgroundStyle={[
      { backgroundColor: colors.muted },
      backgroundStyle,
    ]}
    {...props}
    />
  );
}