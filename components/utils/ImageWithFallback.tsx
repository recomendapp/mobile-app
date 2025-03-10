import * as React from 'react';
import { ComponentProps, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/type.db';
import { DimensionValue, Text, View } from 'react-native';
import { ImageIcon, ListVideoIcon } from 'lucide-react-native';
import { Icons } from '@/constants/Icons';
import { Image, ImageProps, ImageSource } from 'expo-image';
import deepmerge from 'deepmerge';
import tailwind from 'twrnc';
import Animated from 'react-native-reanimated';

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
  className,
  contentFit = 'cover',
  transition = 250,
  cachePolicy = 'disk',
  style = {},
  ...rest
}, ref) => {
  const [imgSrc, setImgSrc] = useState<ImageSource | undefined | null>(source);

  useEffect(() => {
    setImgSrc(source);
  }, [source]);

  return (
    <Animated.View
    ref={ref}
    className={cn('overflow-hidden items-center justify-center w-full h-full bg-muted rounded-md', className)}
    style={[
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
      {/* {imgSrc ? (
        <Image
          ref={ref}
          source={imgSrc}
          onError={() => {
            setImgSrc(null);
          }}
          style={deepmerge(defaultStyle, style)}
          transition={transition}
          contentFit={contentFit}
          // placeholder={{ blurhash }}
          cachePolicy={cachePolicy}
          {...rest}
        />
      ) : (
        <Fallback className={cn('', className)} type={type} from="#363636" to="#363636" alt={alt} />
      )} */}
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
  switch (type) {
    case 'playlist':
      return <ListVideoIcon color="#fff" className="w-2/5 h-2/5" />;
    case 'person':
      return <Icons.user color="#fff" className="w-2/5 h-2/5" />;
    case 'movie':
      return <Text className="text-muted-foreground text-clamp-2 text-center">{alt}</Text>;
    case 'tv_series':
      return <Text className="text-muted-foreground text-clamp-2 text-center">{alt}</Text>;
    case 'service':
      return <Text className="text-muted-foreground text-clamp-2 text-center">{alt}</Text>;
    default:
      return <ImageIcon color="#fff" className="w-2/5 h-2/5" />;
  }
};
