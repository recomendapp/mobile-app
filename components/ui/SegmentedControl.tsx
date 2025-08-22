import { useTheme } from '@/providers/ThemeProvider';
import RNSegmentedControl, { FontStyle } from '@react-native-segmented-control/segmented-control';
import { forwardRef } from 'react';

export type SegmentedControlVariant = 
  | 'default'

interface SegmentedControlProps extends React.ComponentProps<typeof RNSegmentedControl> {
  variant?: SegmentedControlVariant
}

const SegmentedControl = forwardRef<
  RNSegmentedControl,
  SegmentedControlProps
>((
  {
  variant = 'default',
  tintColor,
  fontStyle,
  activeFontStyle,
  ...props
}, ref) => {
  const { colors } = useTheme();

  const getTintColor = (): string => {
    switch (variant) {
      default:
        return colors.background;
    }
  };
  const getFontStyle = (): FontStyle => {
    switch (variant) {
      default:
        return {
          color: colors.foreground,
        };
    }
  };
  const getActiveFontStyle = (): FontStyle => {
    switch (variant) {
      default:
        return {
          color: colors.accentYellow,
        };
    }
  };

  return (
    <RNSegmentedControl
    ref={ref}
    tintColor={tintColor || getTintColor()}
    fontStyle={{
      ...getFontStyle(),
      ...fontStyle,
    }}
    activeFontStyle={{
      ...getActiveFontStyle(),
      ...activeFontStyle,
    }}
    {...props}
    />
  )
});
SegmentedControl.displayName = 'SegmentedControl';

export { SegmentedControl };