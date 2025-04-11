import React, { Fragment } from "react";
import { UserActivity } from "@/types/type.db";
import { useTranslation } from "react-i18next";
import Animated, { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import CollectionHeader from "../CollectionHeader";
import { capitalize } from "lodash";
import { View } from "react-native";
import tw from "@/lib/tw";
import { ColumnFiltersState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Columns } from "./components/columns";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { ThemedText } from "@/components/ui/ThemedText";

interface TableLikesProps {
	likes: UserActivity[];
	scrollY: SharedValue<number>;
	headerHeight: SharedValue<number>;
	headerOverlayHeight: SharedValue<number>;
	isFetching: boolean;
	isRefetching: boolean;
	refetch: () => void;
}

const TableLikes = ({
	likes,
	scrollY,
	headerHeight,
	headerOverlayHeight,
	isRefetching,
	refetch,
} : TableLikesProps) => {
	const { t } = useTranslation();
	const backdrops = React.useMemo(() => {
		return likes.map((like) => like.media?.backdrop_url);
	}, [likes]);
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
		'created_at': false,
	});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: 'created_at', desc: false },
	]);

	const table = useReactTable<UserActivity>({
		data: likes,
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
		title={capitalize(t('common.library.collection.likes.label'))}
		numberOfItems={likes.length}
		backdrops={backdrops}
		/>
		<DataTableToolbar table={table} />
		{/* <View>
			{table.getHeaderGroups().map((headerGroup) => (
				<View
				key={headerGroup.id}
				style={tw`flex-row items-center justify-between p-1`}
				>
					{headerGroup.headers.map((header) => (
						<View
						key={header.id}
						style={tw`flex-1 flex-row items-center gap-2`}
						>
							{header.isPlaceholder
								? null
								: flexRender(
									header.column.columnDef.header,
									header.getContext()
								)}
						</View>
					))}
				</View>
			))}
		</View> */}
	</>
	), [likes]);

	const renderEmpty = React.useCallback(() => (
		<View style={tw`flex-1 items-center justify-center`}>
			<ThemedText>{capitalize(t('common.messages.no_results'))}</ThemedText>
		</View>
	), []);

	return (
		<>
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
			keyExtractor={(item) => item.original.id.toString()}
			showsVerticalScrollIndicator={false}
			refreshing={isRefetching}
			onRefresh={refetch}
			/>
		</>
	)
};

export default TableLikes;