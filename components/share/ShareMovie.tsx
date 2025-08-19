import { forwardRef } from "react";
import { View } from "../ui/view";
import { MediaMovie } from "@/types/type.db";

interface ShareMovieProps extends React.ComponentProps<typeof View> {
	movie: MediaMovie;
}

const ShareMovie = forwardRef<
	React.ComponentRef<typeof View>,
	ShareMovieProps
>(({ movie, ...props }, ref) => {
	return (
		<View ref={ref} {...props}>

		</View>
	);
});

export default ShareMovie;
