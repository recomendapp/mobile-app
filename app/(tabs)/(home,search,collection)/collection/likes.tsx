import CollectionHeader from "@/components/screens/collection/CollectionHeader";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import AnimatedFlashList from "@/components/ui/AnimatedFlashList";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import HeaderOverlay from "@/components/ui/HeaderOverlay";
import { ThemedAnimatedView } from "@/components/ui/ThemedAnimatedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAuth } from "@/context/AuthProvider";
import { useUserLikesQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { useRouter } from "expo-router";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LikesScreen = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const router = useRouter();
	const inset = useSafeAreaInsets();
	const tabBarHeight = useBottomTabOverflow();
	const {
		data: likes,
		isLoading,
		isError,
		isFetching,
		isRefetching,
		refetch,
	} = useUserLikesQuery({
		userId: user?.id,
	});
	const scrollY = useSharedValue(0);
	const headerHeight = useSharedValue(0);
	const headerOverlayHeight = useSharedValue(0);
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});
	
	if (!likes) return null;

	return (
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
			<AnimatedFlashList
			onScroll={scrollHandler}
			ListHeaderComponent={() => (
				<CollectionHeader
				headerHeight={headerHeight}
				headerOverlayHeight={headerOverlayHeight}
				scrollY={scrollY}
				title={capitalize(t('common.library.collection.likes.label'))}
				numberOfItems={likes.length}
				/>
			)}
			data={likes}
			renderItem={({ item, index }) => (
				<TouchableWithoutFeedback
				onPress={() => router.push(item.media.url)}
				onLongPress={() => console.log('long pressed')}
				>
					<View
					key={index}
					style={[
						tw`flex-row items-center justify-between p-1`,
					]}
					>
						<View style={tw`flex-1 flex-row items-center gap-2`}>
							<AnimatedImageWithFallback
							alt={item?.media?.title ?? ''}
							source={{ uri: item?.media?.avatar_url ?? '' }}
							style={[
								{ aspectRatio: 2 / 3, height: 'fit-content' },
								tw.style('rounded-md w-16'),
							]}
							/>
							<ThemedText numberOfLines={1} style={tw`flex-1`} >
								{item.media?.title} sef sef sef sef ef
							</ThemedText>

						</View>
						{/* <ThemedText>
							{item.created_at}
						</ThemedText> */}
					</View>
				</TouchableWithoutFeedback>
			)}
			estimatedItemSize={likes.length}
			contentContainerStyle={{
				paddingBottom: tabBarHeight + inset.bottom,
			}}
			keyExtractor={(_, index) => index.toString()}
			showsVerticalScrollIndicator={false}
			refreshing={isFetching}
			refreshControl={
				<RefreshControl
					refreshing={isRefetching}
					onRefresh={refetch}
				/>
			}
			/>
	  		<ThemedText>Likes Screen</ThemedText>
		</ThemedAnimatedView>
	);
};

export default LikesScreen;