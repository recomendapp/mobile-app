import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import * as React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

type Variant =
  'default'
  | 'destructive'
  | 'outline'
  | 'accent-yellow';

interface ButtonTextProps
  extends React.ComponentPropsWithoutRef<typeof Animated.Text> {
    variant?: Variant;
  }

const ButtonText = React.forwardRef<
  React.ElementRef<typeof Animated.Text>,
  ButtonTextProps
>(({ variant, style, ...props }, ref) => {
    const { colors } = useTheme();
    const variantStyles = React.useMemo(() => {
      const shared = "text-sm font-medium";
      let style = {};
      switch (variant) {
        case 'destructive':
          style = {
            color: colors.destructiveForeground,
          }
          break;
        case 'outline':
          style = {
            color: colors.foreground,
          }
          break;
        case 'accent-yellow':
          style = {
            color: colors.accentYellowForeground,
          }
          break;
        default:
          style = {
            color: colors.primaryForeground,
          }
      }
      return {
        shared,
        variant: style,
      }
    }, [variant, colors]);
    return (
      <Animated.Text
        ref={ref}
        style={[
          tw.style(variantStyles.shared),
          variantStyles.variant,
          style,
        ]}
        {...props}
      />
    );
  }
);



interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Animated.View> {
    variant?: Variant;
    disabled?: boolean;
    onPress?: () => void;
  }

const Button = React.forwardRef<React.ElementRef<typeof Animated.View>, ButtonProps>(
  ({ variant, disabled, role = 'button', style, ...props }, ref) => {
    const { colors } = useTheme();
    const variantStyles = React.useMemo(() => {
      const shared = "flex-row items-center justify-center gap-2 rounded-md text-sm font-medium px-4 py-2";
      let style = {};
      switch (variant) {
        case 'destructive':
          style = {
            backgroundColor: colors.destructive,
          }
          break;
        case 'outline':
          style = {
            backgroundColor: colors.background,
            borderColor: colors.muted,
            borderWidth: 1,
          }
          break;
        case 'accent-yellow':
          style = {
            backgroundColor: colors.accentYellow,
          }
          break;
        default:
          style = {
            backgroundColor: colors.primary,
          }
      }
      return {
        shared,
        variant: style,
      }
    }, [variant, colors]);
    return (
      <Pressable disabled={disabled} onPress={props.onPress} style={{ opacity: disabled ? 0.5 : 1 }}>
        <Animated.View
        ref={ref}
        role={role}
        style={[
          tw.style(variantStyles.shared),
          variantStyles.variant,
          style,
          // tw.style(buttonVariants({ variant, size })),
        ]}
        {...props}
        >
          {props.children}
        </Animated.View>
      </Pressable>
      // <TextClassContext.Provider
      //   value={cn(
      //     props.disabled && 'web:pointer-events-none',
      //     buttonTextVariants({ variant, size })
      //   )}
      // >
      //   <Pressable
      //     className={cn(
      //       props.disabled && 'opacity-50 web:pointer-events-none',
      //       buttonVariants({ variant, size, className })
      //     )}
      //     ref={ref}
      //     role='button'
      //     {...props}
      //   />
      // </TextClassContext.Provider>
    );
  }
);
Button.displayName = 'Button';

export {
  Button,
  ButtonText,
};
export type {
  ButtonProps,
  ButtonTextProps,
};
