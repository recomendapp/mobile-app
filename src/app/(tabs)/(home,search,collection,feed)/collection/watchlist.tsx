import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import Animated, { FadeIn, FadeOut, useSharedValue } from "react-native-reanimated";
import tw from "@/lib/tw";
import { useUIStore } from "@/stores/useUIStore";
import { CollectionWatchlistMovie } from "@/components/screens/collection/watchlist/CollectionWatchlistMovie";
import { CollectionWatchlistTvSeries } from "@/components/screens/collection/watchlist/CollectionWatchlistTvSeries";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";

const WatchlistScreen = () => {
    const t = useTranslations();
    const { watchlist: { tab }, setWatchlistTab } = useUIStore((state) => state);

    // SharedValues
    const scrollY = useSharedValue(0);
    const headerHeight = useSharedValue(0);

    return (
    <>
        <AnimatedStackScreen
		options={{
			headerTitle: upperFirst(t('common.messages.watchlist')),
            headerRight: () => (
                <Button
                variant="outline"
                size="icon"
                style={tw`rounded-full`}
                icon={tab === 'movie' ? Icons.Movie : Icons.Tv}
                onPress={() => {
                    setWatchlistTab(tab === 'movie' ? 'tv_series' : 'movie');
                }}
                />
            ),
            unstable_headerRightItems: (props) => [
                {
                    type: 'menu',
                    label: tab === 'movie' ? upperFirst(t('common.messages.film', { count: 2 })) : upperFirst(t('common.messages.tv_series', { count: 2 })),
                    icon: {
                        name: tab === 'movie' ? 'movieclapper' : 'tv',
                        type: 'sfSymbol',
                    },
                    menu: {
                        items: [
                            {
                                type: 'action',
                                label: upperFirst(t('common.messages.film', { count: 2 })),
                                onPress: () => {
                                    setWatchlistTab('movie');
                                },
                                icon: {
                                    name: 'movieclapper',
                                    type: 'sfSymbol',
                                }
                            },
                            {
                                type: 'action',
                                label: upperFirst(t('common.messages.tv_series', { count: 2 })),
                                onPress: () => {
                                    setWatchlistTab('tv_series');
                                },
                                icon: {
                                    name: 'tv',
                                    type: 'sfSymbol',
                                }
                            }
                        ]
                    }
                }
            ],
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		/>
		<Animated.View
			key={`selected_tab_${tab}`}
			entering={FadeIn}
			exiting={FadeOut}
			style={tw`flex-1`}
		>
			{tab === 'tv_series' ? (
                <CollectionWatchlistTvSeries scrollY={scrollY} headerHeight={headerHeight} />
            ) : (
                <CollectionWatchlistMovie scrollY={scrollY} headerHeight={headerHeight} />
            )}
		</Animated.View>
    </>
    )
};

export default WatchlistScreen;