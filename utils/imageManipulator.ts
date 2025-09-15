import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

/**
 * Prend l'URI d'une image (supposée être en 16:9) et la recadre
 * au centre pour obtenir un format 9:16.
 * @param originalUri L'URI de l'image source.
 * @returns L'URI de la nouvelle image recadrée.
 */
export const cropImageRatio = async (originalUri: string, targetRatio: number = 9 / 16): Promise<string> => {
  return new Promise((resolve, reject) => {
    Image.getSize(originalUri, async (originalWidth, originalHeight) => {
      try {
        const originalRatio = originalWidth / originalHeight;
        let cropWidth, cropHeight, originX, originY;
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
        const result = await ImageManipulator.manipulateAsync(
          originalUri,
          [
            {
              crop: {
                originX,
                originY,
                width: cropWidth,
                height: cropHeight,
              },
            },
          ],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        resolve(result.uri);
      } catch (error) {
        console.error("Erreur lors du recadrage de l'image:", error);
        reject(error);
      }
    });
  });
};