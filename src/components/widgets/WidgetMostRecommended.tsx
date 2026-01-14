import { View, ViewProps, useWindowDimensions, ViewStyle, StyleProp, StyleSheet, Pressable } from "react-native";
import { Skeleton } from "../ui/Skeleton";
import { useRef } from "react";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, interpolate } from "react-native-reanimated";
import tw from "@/lib/tw";
import { Image } from "expo-image";
import { Database, MediaMovie, MediaTvSeries } from "@recomendapp/types";
import { getMediaDetails } from "../utils/getMediaDetails";
import { clamp, upperFirst } from "lodash";
import { LinearGradient } from "expo-linear-gradient";
import Color from "color";
import { useTheme } from "@/providers/ThemeProvider";
import { Text } from "../ui/text";
import { useHeaderHeight } from "@react-navigation/elements";
import { BORDER_RADIUS_FULL, GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { BadgeMedia } from "../badges/BadgeMedia";
import { useTranslations } from "use-intl";
import { useRouter } from "expo-router";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetMovie from "../bottom-sheets/sheets/BottomSheetMovie";
import BottomSheetTvSeries from "../bottom-sheets/sheets/BottomSheetTvSeries";
import { getTmdbImage } from "@/lib/tmdb/getTmdbImage";
import { useWidgetMostRecommendedQuery } from "@/api/widgets/widgetQueries";

interface WidgetMostRecommendedProps extends ViewProps {
	scrollY?: SharedValue<number>;
}

const WidgetMostRecommended = ({
	scrollY,
	style,
	...props
} : WidgetMostRecommendedProps) => {
	const { colors } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	// Dimensions
	const { width: screenWidth, height: screenHeight } = useWindowDimensions();
	// Queries
	const {
		data,
		isLoading,
		isError
	} = useWidgetMostRecommendedQuery();
	const ref = useRef<ICarouselInstance>(null);
	const progress = useSharedValue<number>(0);
	
	const onPressPagination = (index: number) => {
		ref.current?.scrollTo({
		count: index - progress.value,
		animated: true,
		});
	};
	const height = clamp(screenHeight / 2, 200, 400);

	if (data === undefined || isLoading) {
		return <Skeleton style={[{ height: height }, tw`w-full`, style]} />
	}
	if (!data.length || isError) return <View style={[{ height: navigationHeaderHeight }, tw`w-full`, style]} />;
	return (
		<View
		style={[
			{ borderColor: colors.border, paddingBottom: PADDING_VERTICAL },
			tw`border-b`
		]}
		{...props}
		>
			<Carousel
			ref={ref}
			width={screenWidth}
			height={height}
			data={data}
			onProgressChange={progress}
			renderItem={({ item, index }) => (
				<WidgetMostRecommendedItem item={item} position={index + 1} style={[style]} scrollY={scrollY} baseHeight={height} carouselProgress={progress} />
			)}
			autoPlay={true}
			autoPlayInterval={6000}
			style={{ overflow: 'visible'}}
			/>
			<Pagination.Basic
			progress={progress}
			data={data}
			dotStyle={{ backgroundColor: colors.muted, borderRadius: BORDER_RADIUS_FULL }}
			activeDotStyle={{ backgroundColor: colors.accentYellow, borderRadius: BORDER_RADIUS_FULL }}
			containerStyle={{ gap: 5, marginTop: 10 }}
			onPress={onPressPagination}
			/>
		</View>
	)
};

const WidgetMostRecommendedItem = ({
	item,
	position,
	style,
	scrollY,
	baseHeight,
	carouselProgress,
} : {
	item: Database['public']['Views']['widget_most_recommended']['Row'];
	position: number;
	style?: StyleProp<ViewStyle>;
	scrollY?: SharedValue<number>;
	baseHeight: number;
	carouselProgress: SharedValue<number>;
}) => {
	const openSheet = useBottomSheetStore(state => state.openSheet);
	const router = useRouter();
	const { colors } = useTheme();
	const t = useTranslations();
	const navigationHeaderHeight = useHeaderHeight();
	const details = (
		item.type === 'movie' ? getMediaDetails({ type: 'movie', media: item.media as MediaMovie }) :
		item.type === 'tv_series' ? getMediaDetails({ type: 'tv_series', media: item.media as MediaTvSeries }) :
		null
	)
	const handleOnPress = () => {
		if (!details?.url) return;
		router.push(details.url);
	};
	const handleOnLongPress = () => {
		switch (item.type) {
			case 'movie':
				return openSheet(BottomSheetMovie, { movie: item.media });
			case 'tv_series':
				return openSheet(BottomSheetTvSeries, { tvSeries: item.media });
			default:
				return null;
		}
	};

	const bgAnim = useAnimatedStyle(() => {
		if (!scrollY) return {};
		const stretch = Math.max(-scrollY.value, 0);
		const base = baseHeight;
		const scale = 1 + stretch / base;
		const clampedScale = Math.min(scale, 3);
		const translateY = -stretch / 2;
		const itemIndex = position - 1;

		const itemScale = interpolate(
			carouselProgress.value,
			[itemIndex - 1, itemIndex, itemIndex + 1],
			[1, clampedScale, 1],
			'clamp'
		);

		const itemTranslateY = interpolate(
			carouselProgress.value,
			[itemIndex - 1, itemIndex, itemIndex + 1],
			[0, translateY, 0],
			'clamp'
		);

		return {
			transform: [
				{ translateY: itemTranslateY },
				{ scaleY: itemScale },
				{ scaleX: itemScale },
			],
		};
	});
	return (
		<Pressable onLongPress={handleOnLongPress}>
			<View
			style={[
				{ paddingTop: navigationHeaderHeight },
				tw`h-full`,
				style
			]}
			>

				<Animated.View
				style={[
					tw`absolute inset-0`,
					bgAnim,
				]}
				>
					{(item.media.backdrop_path) && <Image style={StyleSheet.absoluteFill} source={{ uri: getTmdbImage({ path: item.media.backdrop_path, size: 'w1280' }) ?? '' }} />}
					<LinearGradient
					colors={[
						'transparent',
						Color.hsl(colors.background).alpha(0.6).string(),
						Color.hsl(colors.background).alpha(0.8).string(),
						Color.hsl(colors.background).string(),
					]}
					locations={[
						0,
						0.5,
						0.75,
						1,
					]}
					style={StyleSheet.absoluteFill}
					/>

				</Animated.View>
				<View style={[tw`flex-1 justify-end`, { gap: GAP, paddingHorizontal: PADDING_HORIZONTAL, paddingBottom: PADDING_VERTICAL }]}>
					<View style={[{ gap: GAP * 2 }, tw`flex-row items-center justify-between`]}>
						<Text style={tw`font-bold`}>{upperFirst(t('common.messages.most_recommended', { count: 2 }))}</Text>
						<View style={[tw`flex-row items-center shrink-0`, { gap: GAP }]}>
							<BadgeMedia type={item.type} />
							<Text style={tw`text-xl font-bold`}># {position}</Text>
						</View>
					</View>
					<View style={[{ gap: GAP }]}>
						<Text onPress={handleOnPress} onLongPress={handleOnLongPress} style={tw`text-xl font-bold`}>{details?.title}</Text>
						{details?.description && <Text style={tw`text-base`} numberOfLines={2}>{details.description}</Text>}
					</View>
				</View>
			</View>
		</Pressable>
	);
};

export default WidgetMostRecommended;