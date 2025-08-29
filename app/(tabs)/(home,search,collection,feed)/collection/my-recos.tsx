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
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CollectionMyRecosMovie } from "@/components/screens/collection/my-recos/CollectionMyRecosMovie";
import { CollectionMyRecosTvSeries } from "@/components/screens/collection/my-recos/CollectionMyRecosTvSeries";

const MyRecosScreen = () => {
    const t = useTranslations();
    const { tab, view } = useUIStore((state) => state.myRecosTab);
    const setTab = useUIStore((state) => state.setMyRecosTab);
    const setView = useUIStore((state) => state.setMyRecosView);

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
	const components = useCallback(() => {
		return (
			<>
				{tab === 'movie' && (
					<CollectionMyRecosMovie />
				)}
				{tab === 'tv_series' && (
					<CollectionMyRecosTvSeries />
				)}
			</>
		);
	}, [tab]);
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
					onPress={() => setView(view === 'grid' ? 'list' : 'grid')}
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
                onChange={(event) => {
                    setTab(segmentedOptions[event.nativeEvent.selectedSegmentIndex].value);
                }}
            />
        </View>
		<Animated.View
			key={`selected_tab_${tab}`}
			entering={FadeIn}
			exiting={FadeOut}
			style={tw`flex-1`}
		>
			{components()}
		</Animated.View>
    </>
    )
};

export default MyRecosScreen;