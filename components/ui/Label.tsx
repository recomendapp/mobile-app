import tw from '@/lib/tw';
import * as React from 'react';
import { TextProps } from 'react-native';
import { ThemedText } from './ThemedText';

const Label = React.forwardRef<React.ElementRef<typeof ThemedText>, TextProps>(
	({ style, ...props }, ref) => {
		return (
			<ThemedText
				ref={ref}
				style={[
					tw.style('text-sm native:text-base font-medium leading-none web:peer-disabled:cursor-not-allowed web:peer-disabled:opacity-70'),
					style,
				]}
				{...props}
			/>
		);
	}
);
Label.displayName = 'Label';

export { Label };