import tw from "@/lib/tw";
import { LinearGradient } from "expo-linear-gradient";
import { ElementRef, forwardRef } from "react";
import { View } from "react-native";

interface CollectionIconProps
	extends React.ComponentPropsWithoutRef<typeof View> {
		from: string;
		to: string;
	}

const CollectionIcon = forwardRef<
	ElementRef<typeof View>,
	CollectionIconProps
>(({ from, to, children, ...props }, ref) => {
	return (
		<View
		ref={ref}
		style={tw`rounded-md overflow-hidden`}
		{...props}
		>
			<LinearGradient
			colors={[from, to]}
			start={[0, 0]}
			end={[1, 1]}
			style={tw.style("aspect-square w-full items-center justify-center")}
			>
				{children}
			</LinearGradient>
		</View>
	)
});
CollectionIcon.displayName = "CollectionIcon";

export default CollectionIcon;