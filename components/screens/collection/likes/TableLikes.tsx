import React, { Fragment } from "react";
import { UserActivity } from "@/types/type.db";
import { useTranslation } from "react-i18next";
import Animated, { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import CollectionHeader from "../CollectionHeader";
import { capitalize } from "lodash";
import { RefreshControl } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { View } from "react-native";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { ColumnFiltersState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Columns } from "./components/columns";
import { DataTableToolbar } from "./components/data-table-toolbar";

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
	isFetching,
	isRefetching,
	refetch,
} : TableLikesProps) => {
	const { inset } = useTheme();
	const { t } = useTranslation();
	const bottomTabHeight = useBottomTabOverflow();
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);

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
		backdrops={likes.map((like) => like.media?.backdrop_url)}
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
	),[]);

	return (
		<Animated.FlatList
		onScroll={scrollHandler}
		ListHeaderComponent={renderHeader}
		data={table.getRowModel().rows}
		renderItem={({ item }) => (
			<View key={item.id} style={tw`p-1 flex-row items-center justify-between`}>
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
		// estimatedItemSize={likes.length}
		contentContainerStyle={{
			paddingBottom: bottomTabHeight + inset.bottom,
		}}
		keyExtractor={(item) => item.original.id.toString()}
		showsVerticalScrollIndicator={false}
		refreshing={isFetching}
		refreshControl={
			<RefreshControl
				refreshing={isRefetching}
				onRefresh={refetch}
			/>
		}
		/>
	)
};

export default TableLikes;