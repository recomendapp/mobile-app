import { forwardRef } from "react";
import { View } from "../ui/view";
import { MediaTvSeries } from "@/types/type.db";

interface ShareTvSeriesProps extends React.ComponentProps<typeof View> {
	tvSeries: MediaTvSeries;
}

const ShareTvSeries = forwardRef<
	React.ComponentRef<typeof View>,
	ShareTvSeriesProps
>(({ tvSeries, ...props }, ref) => {
	return (
		<View ref={ref} {...props}>

		</View>
	);
});

export default ShareTvSeries;
