import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React, { useCallback, useMemo } from "react";
import { UserActivityType } from "@recomendapp/types";
import { Icons } from "@/constants/Icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { View } from "@/components/ui/view";
import { Stack } from "expo-router";
import tw from "@/lib/tw";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUIStore } from "@/stores/useUIStore";
import { Button } from "@/components/ui/Button";
import { CollectionHeartPicksMovie } from "@/components/screens/collection/heart-picks/CollectionHeartPicksMovie";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CollectionHeartPicksTvSeries } from "@/components/screens/collection/heart-picks/CollectionHeartPicksTvSeries";
import { NativeSegmentedControlIOSChangeEvent } from "@react-native-segmented-control/segmented-control";
import { NativeSyntheticEvent } from "react-native";

const HeartPicksScreen = () => {
	const t = useTranslations();
	const { heartPicks: { tab, view }, setHeartPicksTab, setHeartPicksView } = useUIStore((state) => state);

	// States
	const segmentedOptions = useMemo((): { label: string, value: UserActivityType }[] => [
		{
			label: upperFirst(t('common.messages.film', { count: 2 })),
			value: 'movie',
		},
		{
			label: upperFirst(t('common.messages.tv_series', { count: 2 })),
			value: 'tv_series',
		},
	], [t]);

	const SelectedComponent = useMemo(() => {
		switch (tab) {
			case 'movie':
				return CollectionHeartPicksMovie;
			case 'tv_series':
				return CollectionHeartPicksTvSeries;
			default:
				return CollectionHeartPicksMovie;
		}
	}, [tab]);

	const handleChangeView = useCallback(() => {
		setHeartPicksView(view === 'grid' ? 'list' : 'grid');
	}, [setHeartPicksView, view]);

	const handleChangeTab = useCallback((event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
		const value = segmentedOptions[event.nativeEvent.selectedSegmentIndex].value;
		setHeartPicksTab(value);
	}, [setHeartPicksTab]);

	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
				<View style={tw`flex-row items-center gap-2`}>
					<Button
					variant="ghost"
					icon={view === 'grid' ? Icons.Grid : Icons.List}
					size="icon"
					onPress={handleChangeView}
					/>
				</View>
			)
		}}
		/>
		<View
		style={{ paddingHorizontal: PADDING_HORIZONTAL, paddingBottom: PADDING_VERTICAL }}
		>
			<SegmentedControl
				values={segmentedOptions.map((option) => option.label)}
				selectedIndex={segmentedOptions.findIndex((option) => option.value === tab)}
				onChange={handleChangeTab}
			/>
		</View>
		<Animated.View
			key={`selected_tab_${tab}`}
			entering={FadeIn}
			exiting={FadeOut}
			style={tw`flex-1`}
		>
			<SelectedComponent />
		</Animated.View>
	</>
	)
};

export default HeartPicksScreen;