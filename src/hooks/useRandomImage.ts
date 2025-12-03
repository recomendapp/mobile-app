import { useMemo } from "react";
import { ImageSourcePropType } from "react-native";

export function useRandomImage<T extends string | ImageSourcePropType>(
  images: T[],
): T | undefined {
  const image = useMemo(() => {
    if (!images.length) return undefined;

    const idx = Math.floor(Math.random() * images.length);
    return images[idx];
  }, [images]);

  return image;
}
