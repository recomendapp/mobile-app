import React, { Fragment } from "react";
import { UserRecosAggregated } from "@/types/type.db";
import { useTranslation } from "react-i18next";
import Animated, { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import CollectionHeader from "../CollectionHeader";
import { capitalize } from "lodash";
import { View } from "react-native";
import tw from "@/lib/tw";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ColumnFiltersState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Columns } from "./components/columns";
import { ThemedText } from "@/components/ui/ThemedText";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { useTheme } from "@/providers/ThemeProvider";

interface TableMyRecosProps {
	recos: UserRecosAggregated[];
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
	isFetching: boolean;
	isRefetching: boolean;
	refetch: () => void;
}

const TableMyRecos = ({
	recos,
	scrollY,
	headerHeight,
	headerOverlayHeight,
	isFetching,
	isRefetching,
	refetch,
} : TableMyRecosProps) => {
	const { inset } = useTheme();
	const { t } = useTranslation();
	const backdrops = React.useMemo(() => {
		return recos.map((reco) => reco.media?.backdrop_url);
	}, [recos]);
	const bottomTabHeight = useBottomTabOverflow();
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
		'created_at': false,
		'by': false,
	});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: 'created_at', desc: false },
	]);

	const table = useReactTable<UserRecosAggregated>({
		data: recos,
		columns: Columns(),
		initialState: {
			pagination: {
				pageSize: 5000,
			},
		},
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const renderHeader = React.useCallback(() => (
	<>
		<CollectionHeader
		headerHeight={headerHeight}
		headerOverlayHeight={headerOverlayHeight}
		scrollY={scrollY}
		title={capitalize(t('common.messages.my_recos'))}
		numberOfItems={recos.length}
		backdrops={backdrops}
		/>
		<DataTableToolbar table={table} />
	</>
	), [recos]);

	const renderEmpty = React.useCallback(() => (
		<View style={tw`flex-1 items-center justify-center`}>
			<ThemedText>{capitalize(t('common.messages.no_results'))}</ThemedText>
		</View>
	), []);

	return (
		<Animated.FlatList
		onScroll={scrollHandler}
		ListHeaderComponent={renderHeader}
		ListHeaderComponentStyle={tw`mb-2`}
		data={table.getRowModel().rows}
		renderItem={({ item }) => (
			<View key={item.id} style={tw`flex-row items-center justify-between p-1 gap-2`}>
				{item.getVisibleCells().map((cell) => (
				<Fragment key={cell.id}>
					{flexRender(
					cell.column.columnDef.cell,
					cell.getContext()
					)}
				</Fragment>
                ))}
			</View>
		)}
		ListEmptyComponent={renderEmpty}
		// estimatedItemSize={recos.length}
		contentContainerStyle={{
			paddingBottom: bottomTabHeight + inset.bottom,
		}}
		keyExtractor={(item) => item.original.media_id!.toString()}
		showsVerticalScrollIndicator={false}
		refreshing={isRefetching}
		onRefresh={refetch}
		/>
	)
};

export default TableMyRecos;