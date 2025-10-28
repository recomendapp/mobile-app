import { useTheme } from '@/providers/ThemeProvider';
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

const BlurredHandle = () => {
  // hooks
  const { colors } = useTheme();

  // styles
  const indicatorStyle = useMemo(
    () => [
      styles.indicator,
      {
        backgroundColor: colors.mutedForeground,
      },
    ],
    [colors.mutedForeground]
  );

  // render
  return (
    <View style={styles.container}>
      <View style={indicatorStyle} />
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  indicator: {
    alignSelf: 'center',
    width: (8 * SCREEN_WIDTH) / 100,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

export default BlurredHandle;