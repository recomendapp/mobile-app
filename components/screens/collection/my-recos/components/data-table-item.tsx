import * as React from "react"
import { UserRecosAggregated } from "@/types/type.db";
import { Text, View } from "react-native";
import tw from "@/lib/tw";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Row } from "@tanstack/react-table";
import { LinkProps } from "expo-router";
import { ThemedText } from "@/components/ui/ThemedText";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { useTheme } from "@/providers/ThemeProvider";

interface DataTableItemProps {
	item: Row<UserRecosAggregated>;
	openSheet: (data: UserRecosAggregated) => void;
}

export const DataTableItem = ({ item, openSheet, ...props } : DataTableItemProps) => {
	const { colors } = useTheme();
	const router = useRouter();
	return (
	<TouchableWithoutFeedback
	onPress={() => router.push(item.original.media?.url as LinkProps['href'])}
	onLongPress={async () => await openSheet(item.original)}
	containerStyle={tw`flex-1`}
	style={tw`flex-row items-center gap-2`}
	>
		<AnimatedImageWithFallback
		alt={item?.original.media?.title ?? ''}
		source={{ uri: item?.original.media?.avatar_url ?? '' }}
		style={[
			{ aspectRatio: 2 / 3, height: 'fit-content' },
			tw.style('rounded-md w-16'),
		]}
		/>
		<View style={tw`shrink`}>
			<ThemedText numberOfLines={1} >
				{item.original.media?.title}
			</ThemedText>
			<Text style={{ color: colors.mutedForeground }} numberOfLines={1}>
				{item.original.media?.main_credit?.map((director, index) => director.title).join(', ')}
			</Text>
		</View>
	</TouchableWithoutFeedback>
	);
};