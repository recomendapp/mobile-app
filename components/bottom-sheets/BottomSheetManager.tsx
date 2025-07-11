import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useNavigation } from 'expo-router';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

export interface BottomSheetProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
};

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
        onLayout={() => {
          if (typeof ref === 'object' && ref?.current?.present) {
            ref.current.present();
          };
        }}
        id={id}
        sizes={sizes}
        initialIndex={1}
        closeSheet={closeSheet}
        removeSheet={removeSheet}
        onDismiss={() => {
          removeSheet(id);
        }}
        {...props}
        />
      ))}
    </>
  );
};