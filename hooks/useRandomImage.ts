import { DependencyList, useMemo } from "react";

export type ImageObject = {
  src: string;
  alt?: string;
};

export function useRandomImage(images: ImageObject[], deps: DependencyList = []): ImageObject | null {
  const randomer = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const image = useMemo(() => {
    if (!images.length) return null;
    return images[randomer(0, images.length - 1)];
  }, [images, ...deps]);

  return image;
}
