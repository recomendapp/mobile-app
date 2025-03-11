import { View, Text, Dimensions, ImageBackground } from "react-native";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useWidgetMostRecommended } from "@/features/widget/widgetQueries";
import { Skeleton } from "../ui/skeletonNEWNAME";
import { useRef } from "react";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { ThemedText } from "../ui/ThemedText";
import tw from "@/lib/tw";

const width = Dimensions.get("window").width;

interface WidgetMostRecommendedProps {
	className?: string;
}

const WidgetMostRecommended = ({
	className,
} : WidgetMostRecommendedProps) => {
	const t = useTranslation();
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
		return <Skeleton className={cn("w-full h-80", className)} />
	}
	if (!data.length || isError) return null;
	return (
		<View className={cn('', className)}>
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