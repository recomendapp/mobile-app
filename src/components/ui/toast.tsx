import { Text } from '@/components/ui/text';
import { useTheme } from '@/providers/ThemeProvider';
import { AlertCircle, Check, Info, X } from 'lucide-react-native';
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Dimensions,
  Platform,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: (id: string) => void;
  };
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
  index: number;
  duration?: number;
  shouldDismiss?: boolean; // Ajout du prop pour contrôler la suppression
}

interface DismissOptions {
  animated?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const DYNAMIC_ISLAND_HEIGHT = 37;
const EXPANDED_HEIGHT = 85;
const TOAST_MARGIN = 8;
const DYNAMIC_ISLAND_WIDTH = 126;
const EXPANDED_WIDTH = screenWidth - 32;

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  onDismiss,
  index,
  action,
  duration = 4000,
  shouldDismiss = false, // Nouveau prop
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Reanimated shared values
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const width = useSharedValue(DYNAMIC_ISLAND_WIDTH);
  const height = useSharedValue(DYNAMIC_ISLAND_HEIGHT);
  const borderRadius = useSharedValue(18.5);
  const contentOpacity = useSharedValue(0);
  
  const stackPosition = useSharedValue(0);

  const backgroundColor = colors.background;
  const mutedTextColor = colors.mutedForeground;

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#30D158'; // iOS green
      case 'error':
        return '#FF453A'; // iOS red
      case 'warning':
        return '#FF9F0A'; // iOS orange
      case 'info':
        return '#007AFF'; // iOS blue
      default:
        return '#8E8E93'; // iOS gray
    }
  };

  const getIcon = () => {
    const iconProps = { size: 16, color: getVariantColor() };

    switch (variant) {
      case 'success':
        return <Check {...iconProps} />;
      case 'error':
        return <X {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return null;
    }
  };

  const actuallyRemoveToast = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const startDismissAnimation = useCallback(() => {
    if (!isAnimatingOut) {
      setIsAnimatingOut(true);
    }
  }, [isAnimatingOut]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY <= 0) {
        translateY.value = event.translationY;
      }
      translateX.value = 0;
    })
    .onEnd((event) => {
      const { translationY, velocityY } = event;

      if (
        translationY < -50 ||
        velocityY < -800
      ) {
        runOnJS(startDismissAnimation)();
      } else {
        // Snap back to original position
        translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    });

  const toastAnimatedStyle = useAnimatedStyle(() => {
    const stackScale = interpolate(
      index,
      [0, 1, 2, 3],
      [1, 0.95, 0.9, 0.85],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: translateY.value + stackPosition.value },
        { translateX: translateX.value },
        { scale: scale.value * stackScale },
      ],
    };
  });

  const dynamicIslandAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      height: height.value,
      borderRadius: borderRadius.value,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const toastStyle: ViewStyle = {
    position: 'absolute',
    top: insets.top,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000 - index, // Lower index = higher z-index = in front
  };

  const dynamicIslandStyle = {
    backgroundColor,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };

  // useEffects
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        startDismissAnimation();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, startDismissAnimation]);

  useEffect(() => {
    stackPosition.value = withSpring(index * 8, { 
      damping: 20, 
      stiffness: 150,
      mass: 0.8
    });
  }, [index]);

  useEffect(() => {
    const hasContentToShow = Boolean(title || description || action);
    setHasContent(hasContentToShow);

    if (hasContentToShow) {
      width.value = EXPANDED_WIDTH;
      height.value = EXPANDED_HEIGHT;
      borderRadius.value = 20;
      setIsExpanded(true);

      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
      contentOpacity.value = withTiming(1, { duration: 300 });
    } else {
      setIsExpanded(false);

      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
    }

    return () => {
      translateY.value = -150;
      opacity.value = 0;
      scale.value = 0.9;
    };
  }, [title, description, action]);

  // Effet pour gérer la suppression animée via shouldDismiss
  useEffect(() => {
    if (shouldDismiss) {
      startDismissAnimation();
    }
  }, [shouldDismiss, startDismissAnimation]);

  useEffect(() => {
    if (isAnimatingOut) {
      translateY.value = withSpring(-150, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withSpring(0.9, { damping: 15, stiffness: 120 }, (finished) => {
        if (finished) {
          runOnJS(actuallyRemoveToast)();
        }
      });
    }
  }, [isAnimatingOut, actuallyRemoveToast]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[toastStyle, toastAnimatedStyle]}>
        <Animated.View
          style={[dynamicIslandStyle, dynamicIslandAnimatedStyle]}
        >
          {/* Compact state - just icon or indicator */}
          {!isExpanded && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              {getIcon()}
            </View>
          )}

          {/* Expanded state - full content */}
          {isExpanded && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
                contentAnimatedStyle,
              ]}
            >
              {getIcon() && (
                <View style={{ marginRight: 12 }}>{getIcon()}</View>
              )}

              <View style={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <Text
                    variant='subtitle'
                    style={{
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: '600',
                      marginBottom: description ? 2 : 0,
                    }}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {title}
                  </Text>
                )}
                {description && (
                  <Text
                    variant='caption'
                    style={{
                      color: mutedTextColor,
                      fontSize: 13,
                      fontWeight: '400',
                    }}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                  >
                    {description}
                  </Text>
                )}
              </View>

              {action && (
                <TouchableOpacity
                  onPress={() => action.onPress(id)}
                  style={{
                    marginLeft: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: getVariantColor(),
                    borderRadius: 12,
                  }}
                >
                  <Text
                    variant='caption'
                    style={{
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={startDismissAnimation}
                style={{
                  marginLeft: 8,
                  padding: 4,
                  borderRadius: 8,
                }}
              >
                <X size={14} color={mutedTextColor} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

interface ToastContextType {
  toast: (toast: Omit<ToastData, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string, options?: DismissOptions) => void;
  dismissAll: (options?: DismissOptions) => void;
}

interface ToastInternalData extends ToastData {
  shouldDismiss?: boolean;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastInternalData[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToast = useCallback(
    (toastData: Omit<ToastData, 'id'>) => {
      const id = generateId();
      const newToast: ToastInternalData = {
        ...toastData,
        id,
        duration: toastData.duration ?? 4000,
      };

      // Add new toast at the end (newest toast goes behind)
      setToasts((prevToasts) => [...prevToasts, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissToast = useCallback((id: string, options: DismissOptions = {}) => {
    const { animated = true } = options;
    
    if (animated) {
      // Marquer la toast pour suppression animée
      setToasts((prevToasts) => 
        prevToasts.map((toast) => 
          toast.id === id 
            ? { ...toast, shouldDismiss: true }
            : toast
        )
      );
    } else {
      // Suppression immédiate
      removeToast(id);
    }
  }, [removeToast]);

  const dismissAll = useCallback((options: DismissOptions = {}) => {
    const { animated = true } = options;
    
    if (animated) {
      // Marquer toutes les toasts pour suppression animée
      setToasts((prevToasts) => 
        prevToasts.map((toast) => ({ ...toast, shouldDismiss: true }))
      );
    } else {
      // Suppression immédiate de toutes les toasts
      setToasts([]);
    }
  }, []);

  const createVariantToast = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      addToast({
        title,
        description,
        variant,
      });
    },
    [addToast]
  );

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, description) =>
      createVariantToast('success', title, description),
    error: (title, description) =>
      createVariantToast('error', title, description),
    warning: (title, description) =>
      createVariantToast('warning', title, description),
    info: (title, description) =>
      createVariantToast('info', title, description),
    dismiss: dismissToast,
    dismissAll,
  };

  const containerStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
        {children}
        <View style={containerStyle} pointerEvents='box-none'>
          {toasts.slice(0, 4).map((toast, index) => (
            <Toast
              key={toast.id}
              {...toast}
              index={index}
              onDismiss={removeToast}
              duration={toast.duration}
              shouldDismiss={toast.shouldDismiss}
            />
          ))}
        </View>
      {/* </GestureHandlerRootView> */}
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = use(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}