import { DependencyList, useMemo } from "react";
import { ImageSourcePropType } from "react-native";

export function useRandomImage(images: ImageSourcePropType[] | string[], deps: DependencyList = []): ImageSourcePropType | string | undefined {
  const randomer = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const image = useMemo(() => {
    if (!images.length) return null;
    return images[randomer(0, images.length - 1)];
  }, [images, ...deps]);

  return image ?? undefined;
}
