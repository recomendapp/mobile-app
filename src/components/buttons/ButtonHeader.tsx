import { ButtonHeaderProps } from "./ButtonHeader.ios";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Pressable } from "react-native-gesture-handler";
import { theme } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ButtonHeader({ imageProps, buttonProps }: ButtonHeaderProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      hitSlop={20}
      onPress={buttonProps?.onPress}
      onPressIn={() => {
        scale.value = withTiming(0.8);
      }}
      onPressOut={() => {
        scale.value = withTiming(1);
      }}
      style={animatedStyle}
    >
      <MaterialCommunityIcons
        // Todo: fix this type
        name={(imageProps?.systemName as any) || "cross"}
        size={theme.fontSize24}
        // color={imageProps?.color || theme.colorGrey}
      />
    </AnimatedPressable>
  );
}