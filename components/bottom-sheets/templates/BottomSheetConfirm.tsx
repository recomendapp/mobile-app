import React, { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ThemedText } from '@/components/ui/ThemedText';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/Button';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useTheme } from '@/context/ThemeProvider';

interface BottomSheetConfirmProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  id: string;
  title: string;
  description?: string | React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  cancelLabel?: string;
  confirmLabel?: string;
}

const BottomSheetConfirm = React.forwardRef<
	React.ElementRef<typeof BottomSheetModal>,
	BottomSheetConfirmProps
>(({ id, title, description, onConfirm, onCancel, cancelLabel, confirmLabel, backdropComponent, ...props }, ref) => {
  const { inset } = useTheme();
  const { closeSheet } = useBottomSheetStore();
  const { t } = useTranslation();

  const cancelText = cancelLabel || capitalize(t('common.word.cancel'));
  const confirmText = confirmLabel || capitalize(t('common.messages.confirm'));

  const handleConfirm = async () => {
    onConfirm && await onConfirm();
    closeSheet(id);
  };

  const handleCancel = async () => {
    onCancel && await onCancel();
    closeSheet(id);
  };

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
			{...props}
			disappearsOnIndex={-1}
			appearsOnIndex={0}
			pressBehavior={'none'}
			/>
		),
		[]
	);
	
  return (
    <BottomSheetModal
    ref={ref}
    enablePanDownToClose={false}
    backdropComponent={renderBackdrop}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1`,
      ]}
      >
        <ThemedText style={tw`text-xl font-bold text-center mb-2`}>{title}</ThemedText>
        {description ? <ThemedText style={tw`text-center mb-4`}>
          {typeof description === 'string' ? description : description}
        </ThemedText> : null}
        <View style={tw`gap-4 px-4`}>
          <Button onPress={handleConfirm}>
            <ButtonText>{confirmText}</ButtonText>
          </Button>
          <Button
          variant='outline'
          onPress={handleCancel}
          >
            <ButtonText variant='outline'>{cancelText}</ButtonText>
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetConfirm.displayName = 'BottomSheetConfirm';

export default BottomSheetConfirm;