import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { useAuth } from "@/providers/AuthProvider";
import { useUserLikesQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";
import { useSharedValue } from "react-native-reanimated";
import TableLikes from "@/components/screens/collection/likes/TableLikes";

const LikesScreen = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const {
		data: likes,
		isFetching,
		isRefetching,
		refetch,
	} = useUserLikesQuery({
		userId: user?.id,
	});
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	const headerOverlayHeight = useSharedValue(0);
	
	if (!likes) return null;

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
				title={capitalize(t('common.library.collection.likes.label'))}
				/>
				<TableLikes
				likes={likes}
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

export default LikesScreen;