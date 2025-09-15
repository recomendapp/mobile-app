import BottomSheetPerson from "@/components/bottom-sheets/sheets/BottomSheetPerson";
import { PersonHeader } from "@/components/screens/person/PersonHeader";
import PersonWidgetFilms from "@/components/screens/person/PersonWidgetFilms";
import PersonWidgetTvSeries from "@/components/screens/person/PersonWidgetTvSeries";
import AnimatedStackScreen from "@/components/ui/AnimatedStackScreen";
import { ThemedText } from "@/components/ui/ThemedText"
import { useMediaPersonQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { getIdFromSlug } from "@/utils/getIdFromSlug";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";

const PersonScreen = () => {
	const { person_id } = useLocalSearchParams<{ person_id: string }>();
	const { id: personId } = getIdFromSlug(person_id);
	const { bottomTabHeight } = useTheme();
	const t = useTranslations();
	const openSheet = useBottomSheetStore((state) => state.openSheet);
	// Queries
	const {
		data: person,
		isLoading,
		isRefetching,
		refetch
	} = useMediaPersonQuery({
		personId: personId,
	});
	const loading = person === undefined || isLoading;
	// SharedValue
	const headerHeight = useSharedValue(0);
	const headerOverlayHeight = useSharedValue(0);
	const scrollY = useSharedValue(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: event => {
			'worklet';
			scrollY.value = event.contentOffset.y;
		},
	});

	// Render
	const renderContent = useMemo(() => {
		if (loading) return null;
		return (
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
		)
	}, [personId, loading]);

	return (
	<>
		<AnimatedStackScreen
		options={{
			headerTitle: person?.name || '',
			headerTransparent: true,
		}}
		scrollY={scrollY}
		triggerHeight={headerHeight}
		onMenuPress={person ? () => {
			openSheet(BottomSheetPerson, {
				person: person,
			})
		} : undefined}
		/>
		<Animated.ScrollView
		onScroll={scrollHandler}
		scrollToOverflowEnabled
		contentContainerStyle={[
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
				gap: GAP,
			},
		]}
		>
			<PersonHeader
			person={person}
			loading={loading}
			scrollY={scrollY}
			headerHeight={headerHeight}
			headerOverlayHeight={headerOverlayHeight}
			/>
			{renderContent}
		</Animated.ScrollView>
	</>
	);
};

export default PersonScreen;