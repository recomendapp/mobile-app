import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRecosQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";
import { useSharedValue } from "react-native-reanimated";
import TableMyRecos from "@/components/screens/collection/my-recos/TableMyRecos";

const MyRecosScreen = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const {
		data: recos,
		isFetching,
		isRefetching,
		refetch,
	} = useUserRecosQuery({
		userId: user?.id,
	});
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	const headerOverlayHeight = useSharedValue(0);
	
	if (!recos) return null;

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
				<TableMyRecos
				recos={recos}
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

export default MyRecosScreen;