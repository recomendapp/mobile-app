import { useUserProfileQuery } from "@/features/user/userQueries";
import tw from "@/lib/tw";
import { Stack, useLocalSearchParams } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { UserActivityType } from "@/types/type.db";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import UserCollectionMovie from "@/components/screens/user/collection/UserCollectionMovie";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import UserCollectionTvSeries from "@/components/screens/user/collection/UserCollectionTvSeries";

const UserCollectionScreen = () => {
	const t = useTranslations();
	const { username, type: typeParams } = useLocalSearchParams<{ username: string, type?: UserActivityType }>();
	const { data, } = useUserProfileQuery({ username: username });
	// States
	const [type, setType] = useState<UserActivityType>(typeParams || 'movie');
	const segmentedOptions = useMemo((): { label: string, value: UserActivityType }[] => [
		{
			label: upperFirst(t('common.messages.film', { count: 2 })),
			value: 'movie',
		},
		{
			label: upperFirst(t('common.messages.tv_series', { count: 2 })),
			value: 'tv_series',
		},
	], [t]);

	const components = useCallback(() => {
		switch (type) {
			case 'tv_series':
				return <UserCollectionTvSeries />;
			case 'movie':
			default:
				return <UserCollectionMovie />;
		}
	}, [type]);
	return (
	<>
		<Stack.Screen
		options={{
			title: data ? `@${data.username}` : '',
			headerTitle: (props) => <HeaderTitle {...props}>{upperFirst(t('common.messages.collection', { count: 1 }))}</HeaderTitle>
		}}
		/>
		<View style={{ paddingHorizontal: PADDING_HORIZONTAL, paddingBottom: PADDING_VERTICAL }}>
			<SegmentedControl
			values={segmentedOptions.map(option => option.label)}
			selectedIndex={segmentedOptions.findIndex(option => option.value === type)}
			onChange={(event) => {
				setType(segmentedOptions[event.nativeEvent.selectedSegmentIndex].value);
			}}
			/>
		</View>
		<Animated.View
			key={`selected_tab_${type}`}
			entering={FadeIn}
			exiting={FadeOut}
			style={tw`flex-1`}
		>
			{components()}
		</Animated.View>
	</>
	)
}

export default UserCollectionScreen;