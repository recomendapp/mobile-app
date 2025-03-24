import React, { useCallback, useEffect } from 'react';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/context/ThemeProvider';
import { useNavigation } from 'expo-router';
import useBottomSheetStore from '@/stores/useBottomSheetStore';

type BottomSheetItemProps = {
  id: string;
  isOpen: boolean;
  isClosing: boolean;
  content: React.ComponentType<any>;
  props?: any;
  snapPoints?: string[];
  closeSheet: (id: string) => void;
  removeSheet: (id: string) => void;
};

export const BottomSheetItem = ({
  id,
  isOpen,
  isClosing,
  content: Component,
  props,
  snapPoints = ['40%', '60%'],
  closeSheet,
  removeSheet,
}: BottomSheetItemProps) => {
  const { colors } = useTheme();
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      removeSheet(id);
    }
  };

  const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
			{...props}
			disappearsOnIndex={-1}
			appearsOnIndex={0}
			/>
		),
		[]
	);

  useEffect(() => {
    if (bottomSheetRef.current) {
      if (isOpen && !isClosing) {
        bottomSheetRef.current?.present();
      } else {
        bottomSheetRef.current?.close();
      }
    }
  }, [isOpen, isClosing]);

  return (
    <Component
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.mutedForeground
      }}
      id={id}
      {...props}
    />
  );
};

export const BottomSheetManager = () => {
  const navigation = useNavigation();
  const { sheets, closeSheet, removeSheet } = useBottomSheetStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      sheets.forEach((sheet) => {
        if (!sheet.persistent && sheet.isOpen) {
          closeSheet(sheet.id);
        }
      });
    });

    return unsubscribe;
  }, [sheets, closeSheet, navigation]);

  return (
    <BottomSheetModalProvider>
      {sheets.map(({ id, isOpen, isClosing, content, props, snapPoints }) => (
        <BottomSheetItem
        key={id}
        id={id}
        isOpen={isOpen}
        isClosing={isClosing}
        content={content}
        props={props}
        snapPoints={snapPoints}
        closeSheet={closeSheet}
        removeSheet={removeSheet}
      />
      ))}
    </BottomSheetModalProvider>
  );
};