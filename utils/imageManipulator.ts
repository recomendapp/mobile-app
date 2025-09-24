import { Image } from "react-native";
import {
  ImageManipulator,
  SaveFormat,
  ImageResult,
} from "expo-image-manipulator";

export const cropImageRatio = async (
  originalUri: string,
  targetRatio: number = 9 / 16
): Promise<ImageResult> => {
  return new Promise((resolve, reject) => {
    Image.getSize(originalUri, async (originalWidth, originalHeight) => {
      try {
        const originalRatio = originalWidth / originalHeight;

        let cropWidth: number, cropHeight: number, originX: number, originY: number;

        if (originalRatio > targetRatio) {
          cropHeight = originalHeight;
          cropWidth = originalHeight * targetRatio;
          originX = (originalWidth - cropWidth) / 2;
          originY = 0;
        } else {
          cropWidth = originalWidth;
          cropHeight = originalWidth / targetRatio;
          originY = (originalHeight - cropHeight) / 2;
          originX = 0;
        }

        const ctx = ImageManipulator.manipulate(originalUri);
        ctx.crop({ originX, originY, width: cropWidth, height: cropHeight });

        const imageRef = await ctx.renderAsync();
        const result = await imageRef.saveAsync({
          format: SaveFormat.JPEG,
        });

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });
};
