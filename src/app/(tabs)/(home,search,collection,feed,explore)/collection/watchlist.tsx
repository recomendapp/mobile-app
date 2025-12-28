import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import React, { useCallback, useMemo } from "react";
import { UserActivityType } from "@recomendapp/types";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { View } from "@/components/ui/view";
import tw from "@/lib/tw";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUIStore } from "@/stores/useUIStore";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { CollectionWatchlistMovie } from "@/components/screens/collection/watchlist/CollectionWatchlistMovie";
import { CollectionWatchlistTvSeries } from "@/components/screens/collection/watchlist/CollectionWatchlistTvSeries";
import { NativeSyntheticEvent } from "react-native";
import { NativeSegmentedControlIOSChangeEvent } from "@react-native-segmented-control/segmented-control";

const WatchlistScreen = () => {
    const t = useTranslations();
    const { watchlist: { tab }, setWatchlistTab } = useUIStore((state) => state);

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

    const handleChangeTab = useCallback((event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => {
        const value = segmentedOptions[event.nativeEvent.selectedSegmentIndex].value;
        setWatchlistTab(value);
    }, [setWatchlistTab, segmentedOptions]);

    return (
    <>
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
			{tab === 'tv_series' ? <CollectionWatchlistTvSeries /> : <CollectionWatchlistMovie />}
		</Animated.View>
    </>
    )
};

export default WatchlistScreen;