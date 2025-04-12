import React from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { useNavigation } from 'expo-router';
import useBottomSheetStore from '@/stores/useBottomSheetStore';

export const BottomSheetManager = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { sheets, closeSheet, removeSheet } = useBottomSheetStore();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      sheets.forEach(async (sheet) => {
        if (!sheet.persistent && sheet.ref?.current) {
          await closeSheet(sheet.id);
        }
      });
    });

    return unsubscribe;
  }, [sheets, closeSheet, navigation]);

  return (
    <>
      {sheets.map(({ id, content: Content, props, sizes, ref }) => (
        <Content
        key={id}
        ref={ref}
        id={id}
        sizes={sizes}
        cornerRadius={24}
        backgroundColor={colors.background}
        closeSheet={closeSheet}
        removeSheet={removeSheet}
        onDismiss={() => {
          removeSheet(id);
        }}
        contentContainerStyle={{
          paddingTop: 16,
        }}
        {...props}
        />
      ))}
    </>
  );
};