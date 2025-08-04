import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { useAuth } from "@/providers/AuthProvider";
import { useUserWatchlistQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { useSharedValue } from "react-native-reanimated";
import TableWatchlist from "@/components/screens/collection/watchlist/TableWatchlist";
import { useTranslations } from "use-intl";

const WatchlistScreen = () => {
	const t = useTranslations();
	const { user } = useAuth();
	const {
		data: watchlist,
		isFetching,
		isRefetching,
		refetch,
	} = useUserWatchlistQuery({
		userId: user?.id,
	});
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	const headerOverlayHeight = useSharedValue(0);
	
	if (!watchlist) return null;

	return (
		<>
			<ThemedAnimatedView style={tw`flex-1`}>
				<HeaderOverlay
				triggerHeight={headerHeight}
				headerHeight={headerOverlayHeight}
				onHeaderHeight={(height) => {
					'worklet';
					headerOverlayHeight.value = height;
				}}
				scrollY={scrollY}
				title={upperFirst(t('common.messages.watchlist'))}
				/>
				<TableWatchlist
				watchlist={watchlist}
				scrollY={scrollY}
				headerHeight={headerHeight}
				headerOverlayHeight={headerOverlayHeight}
				isFetching={isFetching}
				isRefetching={isRefetching}
				refetch={refetch}
				/>
			</ThemedAnimatedView>
		</>
	);
};

export default WatchlistScreen;