import * as React from 'react';
import { ComponentProps, useEffect, useState } from 'react';
import { MediaType } from '@/types/type.db';
import { Text, View } from 'react-native';
import { ImageIcon, ListVideoIcon } from 'lucide-react-native';
import { Icons } from '@/constants/Icons';
import { Image, ImageProps, ImageSource } from 'expo-image';
import tailwind from 'twrnc';
import Animated from 'react-native-reanimated';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';

interface ImageWithFallbackProps extends ComponentProps<typeof Animated.View> {
  source: ImageSource;
  contentFit?: ImageProps['contentFit'];
  transition?: ImageProps['transition'];
  cachePolicy?: ImageProps['cachePolicy'];
  alt: string;
  type?: 'default' | 'playlist' | 'service' | 'watch-provider' | MediaType | null;
}

// const blurhash =
//   '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export const ImageWithFallback = React.forwardRef<
  View,
  ImageWithFallbackProps
>(({
  source,
  alt,
  type = 'default',
  contentFit = 'cover',
  transition = 250,
  cachePolicy = 'disk',
  style,
  ...rest
}, ref) => {
  const { colors } = useTheme();
  const [imgSrc, setImgSrc] = useState<ImageSource | undefined | null>(source);

  useEffect(() => {
    setImgSrc(source);
  }, [source]);

  return (
    <Animated.View
    ref={ref}
    style={[
      { backgroundColor: colors.muted },
      tw.style('overflow-hidden items-center justify-center w-full h-full rounded-md'),
      style,
    ]}
    {...rest}
    >
      {imgSrc ? (
        <Image
        source={imgSrc}
        onError={() => {
          setImgSrc(null);
        }}
        style={
          tailwind.style('w-full h-full')
        }
        transition={transition}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
        />
      ) : (
        <Fallback type={type} alt={alt} />
      )}
    </Animated.View>
  );
});

const Fallback = ({
  type,
  alt,
}: {
  type?: string | null;
  alt?: string;
}) => {
  const { colors } = useTheme();
  switch (type) {
    case 'playlist':
      return <ListVideoIcon color={colors.foreground} style={tw.style('w-2/5 h-2/5')} />;
    case 'person':
      return <Icons.user color={colors.foreground} style={tw.style('w-2/5 h-2/5')} />;
    case 'movie':
      return <Text numberOfLines={2} style={[{ color: colors.mutedForeground }, tw.style('text-center')]}>{alt}</Text>;
    case 'tv_series':
      return <Text numberOfLines={2} style={[{ color: colors.mutedForeground }, tw.style('text-center')]}>{alt}</Text>;
    case 'service':
      return <Text numberOfLines={2} style={[{ color: colors.mutedForeground }, tw.style('text-center')]}>{alt}</Text>;
    default:
      return <ImageIcon color={colors.foreground} style={tw.style('w-2/5 h-2/5')} />;
  }
};
