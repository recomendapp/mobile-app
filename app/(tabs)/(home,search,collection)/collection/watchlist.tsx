import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { useAuth } from "@/context/AuthProvider";
import { useUserWatchlistQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";
import { useSharedValue } from "react-native-reanimated";
import TableWatchlist from "@/components/screens/collection/watchlist/TableWatchlist";

const WatchlistScreen = () => {
	const { t } = useTranslation();
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
				title={capitalize(t('common.library.collection.watchlist.label'))}
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