import { useEffect, useMemo } from 'react';
import { useNavigation } from 'expo-router';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

export interface BottomSheetProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
};

export const BottomSheetManager = () => {
  const navigation = useNavigation();
  const sheets = useBottomSheetStore((state) => state.sheets);
  const closeSheet = useBottomSheetStore((state) => state.closeSheet);
  const removeSheet = useBottomSheetStore((state) => state.removeSheet);

  const renderSheets = useMemo(() => {
    return sheets.map(({ id, content: Content, props, sizes, ref }) => (
      <Content
        key={id}
        ref={ref}
        id={id}
        sizes={sizes}
        initialIndex={0}
        closeSheet={closeSheet}
        removeSheet={removeSheet}
        onDismiss={() => {
          removeSheet(id);
        }}
        {...props}
      />
    ));
  }, [sheets, closeSheet, removeSheet]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      sheets.forEach(async (sheet) => {
        if (!sheet.persistent && sheet.ref?.current) {
          await closeSheet(sheet.id);
        }
      });
    });

    return unsubscribe;
  }, [sheets, closeSheet, navigation]);

  return renderSheets;
};