import { View, Dimensions, ViewProps } from "react-native";
import { useWidgetMostRecommended } from "@/features/widget/widgetQueries";
import { Skeleton } from "../ui/Skeleton";
import { useMemo, useRef } from "react";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { ThemedText } from "../ui/ThemedText";
import tw from "@/lib/tw";
import { ImageBackground } from "expo-image";
import { Database } from "@recomendapp/types";
import { getMediaDetails } from "../utils/getMediaDetails";
import { MediaMovie, MediaTvSeries } from "@recomendapp/types";

const width = Dimensions.get("window").width;

const WidgetMostRecommended = ({
	style,
} : ViewProps) => {
	const {
		data,
		isLoading,
		isError
	} = useWidgetMostRecommended();
	const ref = useRef<ICarouselInstance>(null);
	const progress = useSharedValue<number>(0);
	
	const onPressPagination = (index: number) => {
		ref.current?.scrollTo({
		count: index - progress.value,
		animated: true,
		});
	};

	// Render
	const renderItem = ({ item }: { item: Database['public']['Views']['widget_most_recommended']['Row'] }) => (
		<WidgetMostRecommendedItem item={item} />
	);

	if (data === undefined || isLoading) {
		return <Skeleton style={[tw.style('w-full h-80'), style]} />
	}
	if (!data.length || isError) return null;
	return (
		<View style={style}>
			<Carousel
				ref={ref}
				width={width}
				height={width / 2}
				data={data}
				onProgressChange={progress}
				renderItem={renderItem}
			/>
			<Pagination.Basic
				progress={progress}
				data={data}
				dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
				containerStyle={{ gap: 5, marginTop: 10 }}
				onPress={onPressPagination}
			/>
		</View>
	)
};

const WidgetMostRecommendedItem = ({
	item,
} : {
	item: Database['public']['Views']['widget_most_recommended']['Row']
}) => {
	const details = useMemo(() => {
		switch (item.type) {
			case 'movie':
				return getMediaDetails({ type: 'movie', media: item.media as MediaMovie });
			case 'tv_series':
				return getMediaDetails({ type: 'tv_series', media: item.media as MediaTvSeries });
			default:
				return null;
		}
	}, [item]);
	return (
		<ImageBackground
			source={{ uri: item.media?.backdrop_url ?? ''}}
			style={tw.style('h-80 rounded-md overflow-hidden')}
		>
			<ThemedText style={{ textAlign: "center", fontSize: 30 }}>{details?.title}</ThemedText>
		</ImageBackground>
	);
};

export default WidgetMostRecommended;