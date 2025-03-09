'use client';
import { ComponentProps, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/type.db';
import { DimensionValue, Text, View } from 'react-native';
import { ImageIcon, ListVideoIcon } from 'lucide-react-native';
import { Icons } from '@/constants/Icons';
import { Image, ImageSource } from 'expo-image';
import deepmerge from 'deepmerge';

interface ImageWithFallbackProps extends ComponentProps<typeof Image> {
  alt: string;
  type?: 'default' | 'playlist' | 'service' | 'watch-provider' | MediaType | null;
  blurDataURL?: string;
}

// const blurhash =
//   '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export const ImageWithFallback = ({
  source,
  alt,
  type = 'default',
  blurDataURL,
  className,
  contentFit = 'cover',
  transition = 250,
  cachePolicy = 'disk',
  style = {},
  ...rest
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<ImageSource | undefined | null>(source);

  const defaultStyle = { width: '100%' as DimensionValue, height: '100%' as DimensionValue };

  useEffect(() => {
    setImgSrc(source);
  }, [source]);

  return (
    <>
      {imgSrc ? (
        <Image
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
      )}
    </>
  );
};

export function Fallback({
  className,
  type,
  from,
  to,
  alt,
}: {
  className?: string;
  type?: string | null;
  from: string;
  to: string;
  alt?: string;
}) {
  return (
    <View
      style={{
        backgroundImage: `linear-gradient(to top right, ${from}, ${to})`,
      }}
      className={cn(`w-full h-full flex items-center justify-center bg-muted`, className)}
    >
      {type == 'playlist' ? (
        <ListVideoIcon color="#fff" className="w-2/5 h-2/5" />
      ) : type == 'person' ? (
        <Icons.user color="#fff" className="w-2/5 h-2/5" />
      ) : type == 'movie' ? (
        <Text className="text-muted-foreground text-clamp-2 text-center">
          {alt}
        </Text>
      ) : type == 'tv_series' ? (
        <Text className="text-muted-foreground text-clamp-2 text-center">
          {alt}
        </Text>
      ) : type == 'service' ? (
        <Text className="text-muted-foreground text-clamp-2 text-center">
          {alt}
        </Text>
      ) : (
        <ImageIcon color="#fff" className="w-2/5 h-2/5" />
      )}
    </View>
  );
}
