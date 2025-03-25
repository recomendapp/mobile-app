import { useTheme } from "@/context/ThemeProvider";
import tw from "@/lib/tw";
import { UserActivity } from "@/types/type.db";
import * as React from "react"
import Animated from "react-native-reanimated";
import { ImageWithFallback } from "../utils/ImageWithFallback";

interface CardUserActivityProps
	extends React.ComponentProps<typeof Animated.View> {
		variant?: "default";
		activity: UserActivity;
	}

const CardUserActivityDefault = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	Omit<CardUserActivityProps, "variant">
>(({ style, activity, children, ...props }, ref) => {
	const { colors } = useTheme();
	// const format = useFormatter();
	// const now = useNow({ updateInterval: 1000 * 10 });
	return (
		<Animated.View
			ref={ref}
			style={[
				{ backgroundColor: colors.card, borderColor: colors.border },
				tw`flex-row rounded-xl p-1 gap-2 border`,
				style
			]}
			{...props}
		>
			<ImageWithFallback
			source={{uri: activity.media?.avatar_url ?? ''}}
			alt={activity.media?.title ?? ''}
			type={activity.media?.media_type}
			style={tw`w-20 h-full`}
			/>
			<div className='flex flex-col gap-2 p-2 w-full'>
				<div className="flex justify-between">
					<div className="flex items-center gap-2">
						{activity.user?.username ? <UserAvatar avatar_url={activity?.user?.avatar_url} username={activity?.user?.username} className="w-6 h-6" /> : null}
						<FeedActivity activity={activity} className="text-sm @md/feed-item:text-base text-muted-foreground"/>
					</div>
					<div className='text-sm text-muted-foreground opacity-0 group-hover:opacity-100 duration-500'>
						{format.relativeTime(new Date(activity?.watched_date ?? ''), now)}
					</div>
				</div>
				<Link href={activity?.media?.url ?? ''} className="space-y-2">
					{/* TITLE */}
					<div className="text-md @md/feed-item:text-xl space-x-1 line-clamp-2">
						<span className='font-bold'>{activity?.media?.title}</span>
						{/* DATE */}
						<sup>
							<DateOnlyYearTooltip date={activity?.media?.date ?? ''} className='text-xs @md/feed-item:text-sm font-medium'/>
						</sup>
					</div>
					{/* DESCRIPTION */}
					<p
					className={`
						text-xs line-clamp-2 text-justify
						${(!activity?.media?.extra_data.overview || !activity?.media?.extra_data.overview.length) && 'text-muted-foreground'}
					`}
					>
						{(activity?.media?.extra_data.overview && activity?.media?.extra_data.overview.length) ? activity?.media?.extra_data.overview : 'Aucune description'}
					</p>
				</Link>
			</div>
		</Animated.View>
	);
});
CardUserActivityDefault.displayName = "CardUserActivityDefault";

const CardUserActivity = React.forwardRef<
	React.ElementRef<typeof Animated.View>,
	CardUserActivityProps
>(({ variant = "default", ...props }, ref) => {
	return (
		<>
			{variant === "default" ? (
				<CardUserActivityDefault ref={ref} {...props} />
			) : null}
		</>
	)
});
CardUserActivity.displayName = "CardUserActivity";

export {
	type CardUserActivityProps,
	CardUserActivity,
	CardUserActivityDefault,
}