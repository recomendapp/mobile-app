'use client';
import { ComponentProps, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/type.db';
import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { ImageIcon, ListVideoIcon } from 'lucide-react-native';
import { Icons } from '@/constants/Icons';

interface ImageWithFallbackProps extends ComponentProps<typeof Image> {
  type?: 'default' | 'playlist' | 'service' | 'watch-provider' | MediaType | null;
  blurDataURL?: string;
}

export const ImageWithFallback = ({
  source,
  alt,
  type = 'default',
  blurDataURL,
  className,
  ...rest
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<ImageSourcePropType | undefined | null>(source);

  useEffect(() => {
    setImgSrc(source);
  }, [source]);

  return (
    <>
      {imgSrc ? (
        <Image
          alt={alt}
          source={imgSrc}
          className={cn('', className)}
          onError={() => {
            setImgSrc(null);
          }}
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
