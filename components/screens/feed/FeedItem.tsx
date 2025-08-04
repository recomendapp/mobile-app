import { UserActivity } from "@/types/type.db";
import { Skeleton } from "@/components/ui/Skeleton";
import tw from "@/lib/tw";
import { View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { forwardRef } from "react";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { CardUser } from "@/components/cards/CardUser";
import FeedActivity from "./FeedActivity";

interface FeedItemProps
  extends React.ComponentProps<typeof View> {
	activity: UserActivity | null;
  }

const FeedItem = forwardRef<
	React.ComponentRef<typeof View>,
	FeedItemProps
>(({ activity, ...props }, ref) => {
	const { colors } = useTheme();
	// const mediaDetails = getMediaDetails(activity?.media);

	if (!activity) {
	  return (
		<Skeleton style={tw`flex h-full rounded-xl p-2 gap-2`}>
		  {/* <Skeleton className="bg-background h-[25px] w-[25px] rounded-full" />
		  <Skeleton className="bg-background h-5 w-20" />
		  <Skeleton className="bg-background h-5 w-20 rounded-full" /> */}
		</Skeleton>
	  );
	}

	return (
	  <View
	  ref={ref}
	  style={[
		{ backgroundColor: colors.muted },
		tw`flex-row gap-2 rounded-xl p-2`,
	  ]}
	  {...props}
	  >
		<AnimatedImageWithFallback
		alt={activity.media?.title ?? ''}
		source={{ uri: activity.media?.avatar_url ?? '' }}
		style={[
			{ aspectRatio: 2 / 3, height: 'fit-content' },
			tw.style('rounded-md w-20'),
		]}
		/>
		<View style={tw`gap-4`}>
			<View style={tw`flex-row justify-between`}>
				<View style={tw`flex-row items-center gap-1`}>
					{activity.user && <CardUser user={activity.user} variant="icon" />}
					<FeedActivity activity={activity} />
				</View>
			</View>
		</View>
	  </View>
	);
});
FeedItem.displayName = 'FeedItem';

export default FeedItem;