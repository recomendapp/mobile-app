import { ThemedText } from '@/components/ui/ThemedText';
import { Icons } from '@/constants/Icons';
import { useTheme } from '@/providers/ThemeProvider';
import tw from '@/lib/tw';
import { Column } from '@tanstack/react-table';
import { ChevronsUpDownIcon, LucideIcon } from 'lucide-react-native';
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
}: DataTableColumnHeaderProps<TData, TValue>) {
	const { colors } = useTheme();

	if (!column.getCanSort()) {
	  return <ThemedText>{title}</ThemedText>;
	}
  
	return (
	<TouchableWithoutFeedback
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
	);
}; 