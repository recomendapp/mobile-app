import React from 'react';
// import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/context/ThemeProvider';
import { useNavigation } from 'expo-router';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { SheetSize, TrueSheet } from "@lodev09/react-native-true-sheet"

type BottomSheetItemProps = {
  id: string;
  isOpen: boolean;
  isClosing: boolean;
  content: React.ComponentType<any>;
  props?: any;
  sizes?: SheetSize[];
  closeSheet: (id: string) => void;
  removeSheet: (id: string) => void;
};

export const BottomSheetItem = ({
  id,
  isOpen,
  isClosing,
  content: Content,
  props,
  sizes,
  closeSheet,
  removeSheet,
}: BottomSheetItemProps) => {
  const { colors } = useTheme();
  const bottomSheetRef = React.useRef<TrueSheet>(null);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      removeSheet(id);
    }
  };

  // const renderBackdrop = useCallback(
	// 	(props: BottomSheetBackdropProps) => (
	// 		<BottomSheetBackdrop
	// 		{...props}
	// 		disappearsOnIndex={-1}
	// 		appearsOnIndex={0}
	// 		/>
	// 	),
	// 	[]
	// );

  React.useEffect(() => {
    const manageSheet = async () => {
      if (isOpen && !isClosing) {
        console.log('open');
        await bottomSheetRef.current?.present();
        console.log('present');
      } else {
        console.log('close');
        await bottomSheetRef.current?.dismiss();
        console.log('dismiss');
      }
    }
    if (bottomSheetRef.current) {
      manageSheet();
    }
  }, [isOpen, isClosing, bottomSheetRef]);

  return (
    <TrueSheet
      ref={bottomSheetRef}
      sizes={sizes}
      style={{
        backgroundColor: colors.muted
      }}
      // onChange={handleSheetChanges}
      cornerRadius={24} // Optionnel, selon ton design
      // backgroundStyle={{
      //   backgroundColor: colors.background,
      // }}
      // handleIndicatorStyle={{
      //   backgroundColor: colors.mutedForeground,
      // }}
    >
      <Content id={id} {...props} />
    </TrueSheet>
  );

  // return (
  //   <Component
  //     ref={bottomSheetRef}
  //     snapPoints={snapPoints}
  //     onChange={handleSheetChanges}
  //     // backdropComponent={renderBackdrop}
  //     backgroundStyle={{
  //       backgroundColor: colors.background
  //     }}
  //     handleIndicatorStyle={{
  //       backgroundColor: colors.mutedForeground
  //     }}
  //     id={id}
  //     {...props}
  //   />
  // );
};

export const BottomSheetManager = () => {
  const navigation = useNavigation();
  const { sheets, closeSheet, removeSheet } = useBottomSheetStore();

  React.useEffect(() => {
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
    <>
      {sheets.map(({ id, isOpen, isClosing, content, props, sizes }) => (
        <BottomSheetItem
        key={id}
        id={id}
        isOpen={isOpen}
        isClosing={isClosing}
        content={content}
        props={props}
        sizes={sizes}
        closeSheet={closeSheet}
        removeSheet={removeSheet}
        />
      ))}
    </>
  );
};