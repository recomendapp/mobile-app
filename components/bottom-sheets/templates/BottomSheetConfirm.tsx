import React from 'react';
import { ThemedText } from '@/components/ui/ThemedText';
import tw from '@/lib/tw';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/Button';
import useBottomSheetStore from '@/stores/useBottomSheetStore';
import { useTheme } from '@/context/ThemeProvider';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

interface BottomSheetConfirmProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  id: string;
  title: string;
  description?: string | React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  cancelLabel?: string;
  confirmLabel?: string;
}

const BottomSheetConfirm = React.forwardRef<
	React.ElementRef<typeof TrueSheet>,
	BottomSheetConfirmProps
>(({ id, title, description, onConfirm, onCancel, cancelLabel, confirmLabel, ...props }, ref) => {
  const { inset } = useTheme();
  const { closeSheet } = useBottomSheetStore();
  const { t } = useTranslation();

  const cancelText = cancelLabel || capitalize(t('common.word.cancel'));
  const confirmText = confirmLabel || capitalize(t('common.messages.confirm'));

  const handleConfirm = async () => {
    onConfirm && await onConfirm();
    await closeSheet(id);
  };

  const handleCancel = async () => {
    onCancel && await onCancel();
    await closeSheet(id);
  };
	
  return (
    <TrueSheet
    ref={ref}
    onLayout={async () => {
      if (typeof ref === 'object' && ref?.current?.present) {
        await ref.current.present();
      };
    }}
    {...props}
    >
      <View
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
      </View>
    </TrueSheet>
  );
});
BottomSheetConfirm.displayName = 'BottomSheetConfirm';

export default BottomSheetConfirm;