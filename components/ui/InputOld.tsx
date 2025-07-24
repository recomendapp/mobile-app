import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

interface InputProps
  extends TextInputProps {
    variant?: 'default' | 'outline';
  }

const Input = React.forwardRef<React.ComponentRef<typeof TextInput>, InputProps>(
  ({ style, variant, placeholderTextColor, ...props }, ref) => {
    const { colors } = useTheme();
    const variantStyles = React.useMemo(() => {
        const shared = "web:flex h-10 native:h-12 web:w-full rounded-xl  px-3 web:py-2 lg:text-sm native:text-lg native:leading-[1.25] web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2";
        let style = {};
        switch (variant) {
          case 'outline':
            style = {
              backgroundColor: colors.background,
              color: colors.foreground
            }
            break;
          default:
            style = {
              backgroundColor: colors.muted,
              color: colors.foreground,
            }
        }
        return {
          shared,
          variant: style,
        }
      }, [variant, colors]);
    return (
      <TextInput
        ref={ref}
        style={[
          tw.style(variantStyles.shared),
          variantStyles.variant,
          props.editable === false && tw.style('opacity-50 web:cursor-not-allowed'),
          style,
        ]}
        placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
