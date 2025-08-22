import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React, { useCallback, useMemo, useState } from "react";
import { UserActivityType } from "@/types/type.db";
import { Icons } from "@/constants/Icons";
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight, useSharedValue } from "react-native-reanimated";
import { View } from "@/components/ui/view";
import { Stack } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import tw from "@/lib/tw";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUIStore } from "@/stores/useUIStore";
import { Button } from "@/components/ui/Button";
import { BlurView } from 'expo-blur';
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CollectionWatchlistMovie } from "@/components/screens/collection/watchlist/CollectionWatchlistMovie";
import { CollectionWatchlistTvSeries } from "@/components/screens/collection/watchlist/CollectionWatchlistTvSeries";

const WatchlistScreen = () => {
    const t = useTranslations();
    const { tab, view } = useUIStore((state) => state.watchlistTab);
    const setTab = useUIStore((state) => state.setWatchlistTab);
    const setView = useUIStore((state) => state.setWatchlistView);

    const [previousTabIndex, setPreviousTabIndex] = useState(0);

	// SharedValues
    const tabsHeight = useSharedValue(0);

    // States
    const navigationHeaderHeight = useHeaderHeight();
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
					<CollectionWatchlistMovie navigationHeaderHeight={navigationHeaderHeight + tabsHeight.value} />
				)}
				{tab === 'tv_series' && (
					<CollectionWatchlistTvSeries navigationHeaderHeight={navigationHeaderHeight + tabsHeight.value} />
				)}
			</>
		);
	}, [tab, navigationHeaderHeight, tabsHeight.value]);

	// Animation
    const currentIndex = segmentedOptions.findIndex((option) => option.value === tab);
    const direction = currentIndex > previousTabIndex ? 'right' : 'left';
    const enteringAnimation = direction === 'right' ? FadeInRight.springify().damping(80).stiffness(200) : FadeInLeft.springify().damping(80).stiffness(200);
    const exitingAnimation = direction === 'right' ? FadeOutLeft.springify().damping(80).stiffness(200) : FadeOutRight.springify().damping(80).stiffness(200);

    return (
    <>
        <Stack.Screen
        options={{
            headerTransparent: true,
            headerStyle: {
                backgroundColor: 'transparent',
            },
            headerBlurEffect: 'dark',
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
        <BlurView
        onLayout={(event) => {
            tabsHeight.value = event.nativeEvent.layout.height;
        }}
        tint="dark"
        intensity={100}
        style={[
            tw`z-10`,
            {
                top: navigationHeaderHeight,
                paddingHorizontal: PADDING_HORIZONTAL,
                paddingBottom: PADDING_VERTICAL
            }
        ]}
        >
            <SegmentedControl
                backgroundColor="transparent"
                values={segmentedOptions.map((option) => option.label)}
                selectedIndex={currentIndex}
                onChange={(event) => {
                    setPreviousTabIndex(currentIndex);
                    setTab(segmentedOptions[event.nativeEvent.selectedSegmentIndex].value);
                }}
            />
        </BlurView>
		<Animated.View
			key={`selected_tab_${tab}`}
			entering={enteringAnimation}
			exiting={exitingAnimation}
			style={tw`flex-1`}
		>
			{components()}
		</Animated.View>
    </>
    )
};

export default WatchlistScreen;