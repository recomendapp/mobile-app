import { forwardRef, useCallback, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/Button";
import TrueSheet from "@/components/ui/TrueSheet";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { BottomSheetProps } from "../BottomSheetManager";
import tw from "@/lib/tw";
import { Icons } from "@/constants/Icons";
import { View } from "@/components/ui/view";

export interface SortOption<T = string> {
	label: string;
	value: T;
	defaultOrder?: "asc" | "desc";
}

interface BottomSheetSortProps<T> extends BottomSheetProps {
	options: SortOption<T>[];
	selectedValue: T;
	order: "asc" | "desc";
	onChange: (value: T, order: "asc" | "desc") => void;
}

const BottomSheetSort = forwardRef<
	React.ComponentRef<typeof TrueSheet>,
	BottomSheetSortProps<any>
>(({ id, options, selectedValue, order, onChange, ...props }, ref) => {
	const { colors, mode } = useTheme();
	const closeSheet = useBottomSheetStore(state => state.closeSheet);

	const items = useMemo(() => options.map(option => ({
		...option,
		selected: option.value === selectedValue,
		onPress: () => {
			if (option.value === selectedValue) {
				onChange(option, order === "asc" ? "desc" : "asc");
			} else {
				onChange(option, option.defaultOrder ?? "asc");
			}
		},
		closeSheet: true,
	})), [options, selectedValue, onChange, order]);

  	const renderItem = useCallback(({ item }: { item: typeof items[number] }) => (
		<Button
		variant="ghost"
		iconProps={{ color: colors.mutedForeground }}
		style={tw`h-auto py-4`}
		onPress={() => {
			item.onPress();
			if (item.closeSheet !== false) closeSheet(id);
		}}
		>
		<View style={tw`flex-row items-center justify-between gap-2 flex-1`}>
			<Text
			style={{
				color: item.selected ? colors.primary : colors.foreground
			}}
			>
			{item.label}
			</Text>
			{item.selected && (
				order === "asc" ? (
					<Icons.ArrowUp size={20} color={colors.primary} />
				) : (
					<Icons.ArrowDown size={20} color={colors.primary} />
				)
			)}
		</View>
		</Button>
	), [closeSheet, colors, id, order]);


  	return (
    <TrueSheet
	ref={ref}
	scrollable
	{...props}
	>
      <FlashList
        data={items}
        contentContainerStyle={tw`pt-4`}
		bounces={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        indicatorStyle={mode === "dark" ? "white" : "black"}
      />
    </TrueSheet>
  	);
});

BottomSheetSort.displayName = "BottomSheetSort";

export default BottomSheetSort;
