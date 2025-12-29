import { theme } from "@/theme";
import {
  Host,
  Button,
  Image,
  ButtonProps,
  ImageProps,
} from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { StyleProp, ViewStyle } from "react-native";

const SIZE = theme.fontSize34;

export interface ButtonHeaderProps {
  imageProps?: ImageProps;
  buttonProps?: ButtonProps;
  style?: StyleProp<ViewStyle>;
}

export function ButtonHeader({
  imageProps,
  buttonProps,
  style,
}: ButtonHeaderProps) {
  return (
    <Host matchContents style={[{ height: SIZE, width: SIZE }, style]}>
      <Button {...buttonProps} variant={buttonProps?.variant || "glass"}>
        <Image
          {...imageProps}
          systemName={imageProps?.systemName || "xmark"}
          color={imageProps?.color || "primary"}
          size={imageProps?.size || theme.fontSize24}
          modifiers={[
            frame({ height: SIZE }),
            ...(imageProps?.modifiers || []),
          ]}
        />
      </Button>
    </Host>
  );
}