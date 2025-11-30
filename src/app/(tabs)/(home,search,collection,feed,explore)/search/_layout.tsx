import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/searchbar";
import { View } from "@/components/ui/view"
import tw from "@/lib/tw";
import useSearchStore, { SearchType } from "@/stores/useSearchStore";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { Href, Stack, usePathname, useRouter } from "expo-router"
import { upperFirst } from "lodash"
import { useEffect, useMemo, useCallback, useState } from "react";
import Animated, { FadeInUp, FadeOutUp, LinearTransition, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";

type TypeItem = { value: SearchType, label: string, href: Href };

const SearchTypeButton = ({ 
	item,
	active,
	onPress 
}: { 
	item: TypeItem;
	active: boolean;
	onPress: (item: TypeItem) => void;
}) => {
	return (
		<Button
			variant={active ? "accent-yellow" : "muted"}
			style={tw`rounded-full`}
			onPress={() => onPress(item)}
		>
			{item.label}
		</Button>
	);
};
SearchTypeButton.displayName = 'SearchTypeButton';

const SearchLayout = () => {
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname();
	const insets = useSafeAreaInsets();
	const { search, setSearch } = useSearchStore(state => state);
	const [type, setType] = useState<SearchType | null>(null);

	const types = useMemo((): TypeItem[] => [
		{ value: 'movies', label: upperFirst(t('common.messages.film', { count: 2 })), href: '/search/films' },
		{ value: 'tv_series', label: upperFirst(t('common.messages.tv_series', { count: 2 })), href: '/search/tv-series' },
		{ value: 'persons', label: upperFirst(t('common.messages.person', { count: 2 })), href: '/search/persons' },
		{ value: 'playlists', label: upperFirst(t('common.messages.playlist', { count: 2 })), href: '/search/playlists' },
		{ value: 'users', label: upperFirst(t('common.messages.user', { count: 2 })), href: '/search/users' },
	], [t]);

	const handleTypePress = useCallback((item: TypeItem) => {
		if (item.value === type) {
			router.replace('/search');
		} else {
			router.replace(item.href);
		}
	}, [type, router]);

	const renderTypeItem = useCallback(({ item }: { item: TypeItem }) => (
		<SearchTypeButton
		item={item}
		active={type === item.value}
		onPress={handleTypePress}
		/>
	), [type, handleTypePress]);

	const keyExtractor = useCallback((item: TypeItem) => 
		item.value || 'all', []
	);

	const renderHeader = useCallback((props: any) => {
		return (
			<View
			style={{
				paddingTop: insets.top,
				paddingLeft: insets.left,
				paddingRight: insets.right,
				paddingBottom: PADDING_VERTICAL,
				gap: GAP,
			}}
			>
				<Animated.View
					style={[
						{ gap: GAP, paddingHorizontal: PADDING_HORIZONTAL },
						tw`flex-row items-center`
					]}
				>
					{props.options.headerLeft && (
						<Animated.View
						entering={SlideInLeft}
						exiting={SlideOutLeft}
						>
							{props.options.headerLeft({
								tintColor: props.options.headerTintColor,
								canGoBack: !!props.back,
							})}
						</Animated.View>
					)}
					<Animated.View
					style={tw`flex-1`}
					layout={LinearTransition.springify().delay(100)}
					>
						<SearchBar
						defaultValue={search}
						onSearch={setSearch}
						placeholder={
							type === 'movies' ? upperFirst(t('common.messages.search_film', { count: 2 }))
							: type === 'tv_series' ? upperFirst(t('common.messages.search_tv_series', { count: 2 }))
							: type === 'persons' ? upperFirst(t('common.messages.search_person', { count: 2 }))
							: type === 'playlists' ? upperFirst(t('common.messages.search_playlist', { count: 2 }))
							: type === 'users' ? upperFirst(t('common.messages.search_user', { count: 2 }))
							: t('pages.search.placeholder')}
						/>
					</Animated.View>
					{props.options.headerRight && (
						<Animated.View
						entering={SlideInRight}
						exiting={SlideOutRight}
						>
							{props.options.headerRight({
								tintColor: props.options.headerTintColor,
								canGoBack: !!props.back
							})}
						</Animated.View>
					)}
				</Animated.View>
				{(search?.length || type) && (
					<Animated.FlatList
					data={types}
					entering={FadeInUp}
					exiting={FadeOutUp}
					renderItem={renderTypeItem}
					keyExtractor={keyExtractor}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: PADDING_HORIZONTAL,
						gap: GAP,
					}}
					keyboardShouldPersistTaps='handled'
					/>
				)}
			</View>
		)
	}, [insets, t, type, search, renderTypeItem, keyExtractor]);

	useEffect(() => {
		switch (pathname) {
			case '/search/films':
				return setType('movies');
			case '/search/tv-series':
				return setType('tv_series');
			case '/search/persons':
				return setType('persons');
			case '/search/playlists':
				return setType('playlists');
			case '/search/users':
				return setType('users');
			case '/search':
				return setType(null);
			default:
				return;
		}
	}, [pathname]);

	return (
	<>
		<Stack.Screen
		options={{
			headerTitle: upperFirst(t('common.messages.search')),
			headerTransparent: false,
			header: renderHeader
		}}
		/>
		<Stack initialRouteName="index" screenOptions={{ headerShown: false, animation: 'fade' }}>
			<Stack.Screen name="index" />
		</Stack>
	</>
	)
};

export default SearchLayout;