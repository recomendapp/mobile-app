import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import ThemedTrueSheet from '@/components/ui/ThemedTrueSheet';
import { BottomSheetProps } from '../BottomSheetManager';

interface BottomSheetDefaultViewProps extends BottomSheetProps {
  content: React.ReactNode;
}

const BottomSheetDefaultView = React.forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetDefaultViewProps
>(({ id, content, ...props }, ref) => {
  return (
    <ThemedTrueSheet ref={ref} {...props}>
      {content}
    </ThemedTrueSheet>
  );
});
BottomSheetDefaultView.displayName = 'BottomSheetDefaultView';

export default BottomSheetDefaultView;