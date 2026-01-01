import { useMediaPersonDetailsQuery } from "@/api/medias/mediaQueries";
import BottomSheetPerson from "@/components/bottom-sheets/sheets/BottomSheetPerson";
import ButtonPersonFollow from "@/components/buttons/ButtonPersonFollow";
import { PersonHeader } from "@/components/screens/person/PersonHeader";
import PersonWidgetFilms from "@/components/screens/person/PersonWidgetFilms";
import PersonWidgetTvSeries from "@/components/screens/person/PersonWidgetTvSeries";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { GAP, PADDING_VERTICAL } from "@/theme/globals";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo } from "react";
import { View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";

const PersonScreen = () => {
	const t = useTranslations();
	const { person_id } = useLocalSearchParams<{ person_id: string }>();
	const { id: personId } = getIdFromSlug(person_id);
	const { bottomOffset, tabBarHeight } = useTheme();
	const { session } = useAuth();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	// Queries
	const {
		data: person,
		isLoading,
	} = useMediaPersonDetailsQuery({
		personId: personId,
	});
	const loading = useMemo(() => person === undefined || isLoading, [person, isLoading]);
	// SharedValue
	const headerHeight = useSharedValue(0);
	const scrollY = useSharedValue(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});

	const handleMenuPress = useCallback(() => {
		if (person) {
			openSheet(BottomSheetPerson, {
				person: person,
			})
		}
	}, [openSheet, person]);

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: person?.name || '',
			headerTransparent: true,
			headerRight: () => (
				<View style={tw`flex-row items-center gap-1`}>
					{session && <ButtonPersonFollow personId={personId} />}
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={handleMenuPress}
					/>
				</View>
			),
			unstable_headerRightItems: (props) => [
				{
					type: "button",
					label: upperFirst(t('common.messages.menu')),
					onPress: handleMenuPress,
					icon: {
						name: "ellipsis",
						type: "sfSymbol",
					},
				}
			],
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		/>
		<Animated.ScrollView
		onScroll={scrollHandler}
		scrollToOverflowEnabled
		contentContainerStyle={[
			{
				paddingBottom: bottomOffset + PADDING_VERTICAL,
				gap: GAP,
			},
		]}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		>
			<PersonHeader
			person={person}
			loading={loading}
			scrollY={scrollY}
			triggerHeight={headerHeight}
			/>
			{!loading && (
			<>
				<PersonWidgetFilms
				personId={personId}
				url={{
					pathname: `/person/[person_id]/films`,
					params: { person_id: personId }
				}}
				/>
				<PersonWidgetTvSeries
				personId={personId}
				url={{
					pathname: `/person/[person_id]/tv-series`,
					params: { person_id: personId }
				}}
				/>
			</>
			)}
		</Animated.ScrollView>
	</>
	);
};

export default PersonScreen;