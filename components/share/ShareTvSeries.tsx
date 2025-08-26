import { forwardRef } from "react";
import { View } from "../ui/view";
import { MediaTvSeries } from "@/types/type.db";
import { ShareViewRef } from "./type";

interface ShareTvSeriesProps extends React.ComponentProps<typeof View> {
	tvSeries: MediaTvSeries;
}

const ShareTvSeries = forwardRef<
	ShareViewRef,
	ShareTvSeriesProps
>(({ tvSeries, ...props }, ref) => {
	return (
		<View {...props}>

		</View>
	);
});

export default ShareTvSeries;
