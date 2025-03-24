import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { Icons } from '@/constants/Icons';
import { useTheme } from '@/context/ThemeProvider';
import tw from '@/lib/tw';
import { Column, SortingState, flexRender } from '@tanstack/react-table';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon, LucideIcon, TestTubeIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.ComponentProps<typeof View> {
	column: Column<TData, TValue>;
	title?: string;
	Icon?: LucideIcon;
}
  
export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	Icon,
	style,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const { colors } = useTheme();

	if (!column.getCanSort()) {
	  return <ThemedText>{title}</ThemedText>;
	}
  
	return (
	//   <View style={[tw`flex items-center space-x-2`, style]}>
		<TouchableWithoutFeedback
		//   variant="ghost"
		//   size="sm"
		// className="-ml-3 h-8 data-[state=open]:bg-muted whitespace-nowrap"
		style={tw`flex-row items-center h-8`}
		onPress={() => {
			column.toggleSorting()
		}}
		>
		  {title && <ThemedText style={{ color: colors.mutedForeground }}>{title}</ThemedText>}
		  {Icon && <Icon />}
		  {{
			asc: <Icons.ChevronUp color={colors.accentYellow} size={16} style={tw`ml-2`} />,
			desc: <Icons.ChevronDown color={colors.accentYellow} size={16} style={tw`ml-2`} />,
		  }[column.getIsSorted() as string] ?? (
			<ChevronsUpDownIcon color={colors.mutedForeground} size={16} style={tw`ml-2`} />
		  )}
		</TouchableWithoutFeedback>
	//   </View>
	);
}
  