import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import React from 'react';
import {
  Image as EImage,
  type ImageErrorEventData,
  type ImageLoadEventData,
  type ImageSource
} from 'expo-image';
import Animated from 'react-native-reanimated';

// Types
type AvatarState = 'loading' | 'error' | 'loaded';

interface RootProps {
  alt: string;
  style?: any;
  children?: React.ReactNode;
}

interface ImageProps {
  source: ImageSource;
  style?: any;
  onLoad?: (e: ImageLoadEventData) => void;
  onError?: (e: ImageErrorEventData) => void;
  onLoadingStatusChange?: (status: 'error' | 'loaded') => void;
}

interface FallbackProps {
  style?: any;
  children?: React.ReactNode;
}

// Context
interface RootContext {
  alt: string;
  status: AvatarState;
  setStatus: (status: AvatarState) => void;
  containerSize: { width: number; height: number };
}

const RootContext = React.createContext<RootContext | null>(null);

// Root Component
const Root = React.forwardRef<Animated.View, RootProps>(({ alt, style, children }, ref) => {
  const [status, setStatus] = React.useState<AvatarState>('error');
  const [containerSize, setContainerSize] = React.useState<{ width: number; height: number }>({
    width: 40,
    height: 40,
  });

  return (
    <RootContext.Provider value={{ alt, status, setStatus, containerSize }}>
    <Animated.View
	  ref={ref}
	  style={[
      tw.style('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'),
      style,
	  ]}
    onLayout={(e) => {
      setContainerSize({
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height,
      });
    }}
	  >
        {children}
      </Animated.View>
    </RootContext.Provider>
  );
});

Root.displayName = 'RootAvatar';

// Hook pour utiliser le contexte
function useRootContext() {
  const context = React.useContext(RootContext);
  if (!context) {
    throw new Error('Avatar components must be used within Avatar.Root');
  }
  return context;
}

// Image Component
const Image = React.forwardRef<EImage, ImageProps>(
  ({ source, style, onLoad: onLoadProp, onError: onErrorProp, onLoadingStatusChange }, ref) => {
    const { alt, setStatus, status } = useRootContext();

    React.useEffect(() => {
      if (isValidSource(source)) {
        setStatus('loading');
      }
      return () => {
        setStatus('error');
      };
    }, [source, setStatus]);

    const onLoad = React.useCallback(
      (e: ImageLoadEventData) => {
        setStatus('loaded');
        onLoadingStatusChange?.('loaded');
        onLoadProp?.(e);
      },
      [onLoadProp, onLoadingStatusChange, setStatus]
    );

    const onError = React.useCallback(
      (e: ImageErrorEventData) => {
        setStatus('error');
        onLoadingStatusChange?.('error');
        onErrorProp?.(e);
      },
      [onErrorProp, onLoadingStatusChange, setStatus]
    );

    if (status === 'error') {
      return null;
    }

    return (
      <EImage
        ref={ref}
        source={source}
        style={[
          tw.style('aspect-square h-full w-full'),
          style,
        ]}
        accessibilityLabel={alt}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }
);

Image.displayName = 'ImageAvatar';

// Fallback Component
const Fallback = React.forwardRef<Animated.View, FallbackProps>(({ style }, ref) => {
  const { colors } = useTheme();
  const { alt, status, containerSize } = useRootContext();

  if (status !== 'error') {
    return null;
  }

  const initials = getInitials(alt);
  const fontSize = Math.min(containerSize.width, containerSize.height) / 4;

  return (
    <Animated.View
    ref={ref}
    style={[
      { backgroundColor: colors.muted },
      tw.style('flex h-full w-full items-center justify-center rounded-full'),
      style,
    ]}
    accessibilityRole="image"
    accessibilityLabel={alt}
    >
      <Animated.Text
      style={{ color: colors.foreground, fontSize: fontSize, fontWeight: 'semibold' }}
      >
        {initials}
      </Animated.Text>
    </Animated.View>
  );
});

Fallback.displayName = 'FallbackAvatar';

const getInitials = (name: string, type: 'first-and-last' | 'all' | 'international' = 'first-and-last') => {
  switch (type) {
    case 'all': 
      return name.match(/(\b\S)?/g)?.join("").toUpperCase();
    case 'international':
      return name.match(/(^\S\S?|\s\S)?/g)?.map(v=>v.trim()).join("").match(/(^\S|\S$)?/g)?.join("").toLocaleUpperCase();
    default:
      return name.match(/(^\S\S?|\b\S)?/g)?.join("").match(/(^\S|\S$)?/g)?.join("").toUpperCase();
  }
};

// Utilitaire
function isValidSource(source?: ImageSource): boolean {
  if (!source) return false;
  if (typeof source === 'number') return true;
  if (Array.isArray(source)) return source.some((s) => !!s.uri);
  return !!source.uri;
}

export default {
	Root,
	Image,
	Fallback
};