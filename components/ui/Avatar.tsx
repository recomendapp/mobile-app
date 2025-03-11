import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import React from 'react';
import {
  Image as RNImage,
  View,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
  type ImageLoadEventData,
  type ImageErrorEventData,
} from 'react-native';

// Types
type AvatarState = 'loading' | 'error' | 'loaded';

interface RootProps {
  alt: string;
  style?: any;
  children?: React.ReactNode;
}

interface ImageProps {
  source: ImageSourcePropType;
  style?: any;
  onLoad?: (e: NativeSyntheticEvent<ImageLoadEventData>) => void;
  onError?: (e: NativeSyntheticEvent<ImageErrorEventData>) => void;
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
}

const RootContext = React.createContext<RootContext | null>(null);

// Root Component
const Root = React.forwardRef<View, RootProps>(({ alt, style, children }, ref) => {
  const [status, setStatus] = React.useState<AvatarState>('error');

  return (
    <RootContext.Provider value={{ alt, status, setStatus }}>
      <View
	  ref={ref}
	  style={[
		tw.style('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'),
		style,
	  ]}
	  >
        {children}
      </View>
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
const Image = React.forwardRef<RNImage, ImageProps>(
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
      (e: NativeSyntheticEvent<ImageLoadEventData>) => {
        setStatus('loaded');
        onLoadingStatusChange?.('loaded');
        onLoadProp?.(e);
      },
      [onLoadProp, onLoadingStatusChange, setStatus]
    );

    const onError = React.useCallback(
      (e: NativeSyntheticEvent<ImageErrorEventData>) => {
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
      <RNImage
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
const Fallback = React.forwardRef<View, FallbackProps>(({ style, children }, ref) => {
  const { colors } = useTheme();
  const { alt, status } = useRootContext();

  if (status !== 'error') {
    return null;
  }

  return (
    <View
    ref={ref}
    style={[
      { backgroundColor: colors.muted },
      tw.style('flex h-full w-full items-center justify-center rounded-full'),
      style,
    ]}
    accessibilityRole="image"
    accessibilityLabel={alt}
    >
      {children}
    </View>
  );
});

Fallback.displayName = 'FallbackAvatar';

// Utilitaire
function isValidSource(source?: ImageSourcePropType): boolean {
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