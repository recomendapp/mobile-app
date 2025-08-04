import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { useAuth } from "@/providers/AuthProvider";
import { useUserRecosQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { upperFirst } from "lodash";
import { useSharedValue } from "react-native-reanimated";
import TableMyRecos from "@/components/screens/collection/my-recos/TableMyRecos";
import { useTranslations } from "use-intl";

const MyRecosScreen = () => {
	const t = useTranslations();
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
				title={upperFirst(t('common.messages.my_recos'))}
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