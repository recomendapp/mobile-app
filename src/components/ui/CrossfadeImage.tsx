import { useEffect, useState } from "react";
import { ImageProps } from "expo-image";
import { ViewProps } from "react-native";
import Animated, {
  AnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import AnimatedImage from "./AnimatedImage";
import tw from "@/lib/tw";
import { scheduleOnRN } from "react-native-worklets";

export interface CrossfadeImageProps extends ImageProps {
  duration?: number;
  easing?: (value: number) => number;
  animatedContainerProps?: Omit<AnimatedProps<ViewProps>, "style">;
};

function getUri(src: ImageProps["source"]): string | null {
  if (!src) return null;
  if (typeof src === "string") return src;
  if (typeof src === "object" && "uri" in src) return src.uri ?? null;
  return null;
}

const CrossfadeImage = ({
  style,
  source,
  duration = 600,
  easing = Easing.out(Easing.ease),
  contentFit = "cover",
  animatedContainerProps,
  ...props
}: CrossfadeImageProps) => {
  const [displayedSource, setDisplayedSource] = useState(source);
  const [nextSource, setNextSource] = useState<ImageProps["source"]>();
  const opacity = useSharedValue(0);

  const currentUri = getUri(source);
  const displayedUri = getUri(displayedSource);

  
  useEffect(() => {
    if (currentUri !== displayedUri) {
      setNextSource(source);
    }
  }, [currentUri, displayedUri]);

  const handleAnimationComplete = () => {
    setDisplayedSource(nextSource!);
  };

  const handleDisplayedLoad = () => {
    setNextSource(undefined);
  };

  const handleNewLoad = () => {
    opacity.value = 0;
    opacity.value = withTiming(
      1,
      { duration, easing },
      (finished) => {
        if (finished) {
          scheduleOnRN(handleAnimationComplete);
        }
      }
    );
  };

  const newImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[tw`overflow-hidden`, style]} {...animatedContainerProps}>
      <AnimatedImage
        {...props}
        source={displayedSource}
        contentFit={contentFit}
        style={[tw`absolute inset-0`]}
        onLoad={handleDisplayedLoad}
      />
      {nextSource && (
        <AnimatedImage
          {...props}
          source={nextSource}
          contentFit={contentFit}
          style={[tw`absolute inset-0`, newImageStyle]}
          onLoad={handleNewLoad}
        />
      )}
    </Animated.View>
  );
};

export default CrossfadeImage;