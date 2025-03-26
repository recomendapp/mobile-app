import { UserActivity } from "@/types/type.db";
import { Skeleton } from "@/components/ui/Skeleton";
import tw from "@/lib/tw";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { forwardRef } from "react";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { CardUser } from "@/components/cards/CardUser";
import FeedActivity from "./FeedActivity";

interface FeedItemProps
  extends React.ComponentProps<typeof View> {
	activity: UserActivity | null;
  }

const FeedItem = forwardRef<
	React.ElementRef<typeof View>,
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
				<View style={tw`flex-row items-center gap-2`}>
					{activity.user ? <CardUser user={activity.user} variant="icon" /> : null}
					<FeedActivity activity={activity} />
				</View>
			</View>
		</View>
		{/* <MoviePoster
		className="w-20 @md/feed-item:w-24"
		src={activity.media?.avatar_url ?? ''}
		alt={activity.media?.title ?? ''}
		width={96}
		height={144}
		classNameFallback="h-full"
		/>
		<div className="flex flex-col gap-4 w-full">
			<div className="flex justify-between">
				<div className="flex items-center gap-2">
					{activity.user ? <UserCard user={activity.user} icon /> : null}
					<FeedActivity activity={activity} className="text-sm @md/feed-item:text-base text-muted-foreground"/>
				</div>
				<div className='hidden @md/feed-item:block text-sm text-muted-foreground opacity-0 group-hover:opacity-100 duration-500'>
					{format.relativeTime(new Date(activity.watched_date), new Date())}
				</div>
			</div>
			<Link href={activity.media?.url ?? ''} className="text-md @md/feed-item:text-xl space-x-1 line-clamp-2">
				<span className='font-bold'>{activity.media?.title}</span>
				<sup>
					<DateOnlyYearTooltip date={activity.media?.date ?? ''} className='text-xs @md/feed-item:text-sm font-medium'/>
				</sup>
			</Link>
			{activity.review ? (
				activity.user ? <CardReview
					className="bg-background"
					review={activity.review}
					activity={activity}
					author={activity.user}
				/> : null
			) : (
				<>
				{(activity.media?.extra_data?.overview) ? (
					<>
					<p className={cn("text-xs @md/feed-item:text-sm line-clamp-3 text-justify", !activity.media?.extra_data.overview?.length && 'text-muted-foreground')}>
						{activity.media?.extra_data.overview?.length ? activity.media.extra_data.overview : 'Aucune description'}
					</p>
					</>
				) : null}
				</>
			)}
		</div> */}
	  </View>
	);
});
FeedItem.displayName = 'FeedItem';

export default FeedItem;