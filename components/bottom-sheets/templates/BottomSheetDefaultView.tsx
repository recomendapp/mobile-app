import React from 'react';
import tw from '@/lib/tw';
import { useTheme } from '@/context/ThemeProvider';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { View } from 'react-native';

interface BottomSheetDefaultViewProps extends Omit<React.ComponentPropsWithoutRef<typeof TrueSheet>, 'children'> {
  content: React.ReactNode;
}

const BottomSheetDefaultView = React.forwardRef<
	React.ElementRef<typeof TrueSheet>,
	BottomSheetDefaultViewProps
>(({ content, ...props }, ref) => {
  const { inset } = useTheme();
  return (
    <TrueSheet
    ref={ref}
    {...props}
    >
      <View
      style={[
        { paddingBottom: inset.bottom },
        tw`flex-1`,
      ]}
      >
        {content}
      </View>
    </TrueSheet>
  );
});
BottomSheetDefaultView.displayName = 'BottomSheetDefaultView';

export default BottomSheetDefaultView;