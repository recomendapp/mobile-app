import { View, Dimensions, ViewProps } from "react-native";
import { useWidgetMostRecommended } from "@/features/widget/widgetQueries";
import { Skeleton } from "../ui/Skeleton";
import { useRef } from "react";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { ThemedText } from "../ui/ThemedText";
import tw from "@/lib/tw";
import { ImageBackground } from "expo-image";

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
				renderItem={({ index, item }) => (
					<ImageBackground
					source={{ uri: item.media?.backdrop_url ?? ''}}
					style={tw.style('h-80 rounded-md overflow-hidden')}
					>
						<ThemedText style={{ textAlign: "center", fontSize: 30 }}>{item.media?.title}</ThemedText>
					</ImageBackground>
				)}
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

export default WidgetMostRecommended;