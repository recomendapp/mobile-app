import React from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';

interface BottomSheetDefaultViewProps extends Omit<React.ComponentPropsWithoutRef<typeof BottomSheetModal>, 'children'> {
  content: React.ReactNode;
}

const BottomSheetDefaultView = React.forwardRef<
	React.ElementRef<typeof BottomSheetModal>,
	BottomSheetDefaultViewProps
>(({ content, ...props }, ref) => {
  const { inset } = useTheme();
  return (
    <BottomSheetModal
    ref={ref}
    {...props}
    >
      <BottomSheetView
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1`,
      ]}
      >
        {content}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetDefaultView.displayName = 'BottomSheetDefaultView';

export default BottomSheetDefaultView;