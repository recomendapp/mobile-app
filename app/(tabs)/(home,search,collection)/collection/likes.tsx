import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import CollectionHeader from "@/components/screens/collection/CollectionHeader";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { Button, ButtonText } from "@/components/ui/Button";
import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeProvider";
import { useUserActivityUpdateMutation } from "@/features/user/userMutations";
import { useUserLikesQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Media, UserActivity } from "@/types/type.db";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinkProps, useRouter } from "expo-router";
import { capitalize, upperFirst } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Burnt from 'burnt';
import TableLikes from "@/components/screens/collection/likes/TableLikes";

const LikesScreen = () => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const { user } = useAuth();
	const router = useRouter();
	const inset = useSafeAreaInsets();
	const tabBarHeight = useBottomTabOverflow();
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