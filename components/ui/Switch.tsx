import { useTheme } from '@/context/ThemeProvider';
import * as React from 'react';
import { SwitchProps, Switch as SwitchRN } from 'react-native';

const Switch = React.forwardRef<React.ElementRef<typeof SwitchRN>, SwitchProps>(
	({ style, ...props }, ref) => {
		const { colors } = useTheme();
		return (
			<SwitchRN
				ref={ref}
				trackColor={{ true: colors.accentYellow, false: colors.muted }}
				thumbColor={colors.background}
				{...props}
			/>
		);
	}
);
Switch.displayName = 'Switch';

export default Switch;