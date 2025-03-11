import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
  ({ style, placeholderTextColor, ...props }, ref) => {
    const { colors } = useTheme();
    return (
      <TextInput
        ref={ref}
        style={[
          { backgroundColor: colors.muted, color: colors.foreground },
          tw.style('web:flex h-10 native:h-12 web:w-full rounded-xl  px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2'),
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
