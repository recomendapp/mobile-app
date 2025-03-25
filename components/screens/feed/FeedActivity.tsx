import { IconMediaRating } from "@/components/medias/IconMediaRating";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/context/ThemeProvider";
import tw from "@/lib/tw";
import { UserActivity } from "@/types/type.db";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface FeedActivityProps
  extends React.ComponentProps<typeof View> {
	activity: UserActivity | null;
}

const FeedActivity = forwardRef<
	React.ElementRef<typeof View>,
	FeedActivityProps
>(({ activity, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
  
	return (
	  <View
	  ref={ref}
	  style={[
		tw`flex-row items-center gap-2`,
		style,
	  ]}
	  {...props}
	  >
		{activity?.review ? (
		  <>
			{/* <span>
			  {t('feed.user_movie_activity.reviewed', {
				name: () => (
				  <Link href={`/@${activity.user?.username}`} className="text-foreground hover:underline">
					{activity.user?.username}
				  </Link>
				),
				movie: () => (
					<></>
				//   <MovieHoverCard movie={activity.movie} />
				),
			  })}
			</span> */}
		  </>
		) : (
		  <>
			{/* {activity?.is_liked && activity?.rating ? (
			  <span>
				{t.rich('user_movie_activity.rated_liked', {
				  name: () => (
					<Link href={`/@${activity.user?.username}`} className="text-foreground hover:underline">
					  {activity.user?.username}
					</Link>
				  ),
				})}
			  </span>
			) : activity?.is_liked && !activity?.rating ? (
			  <span>
				{t.rich('user_movie_activity.liked', {
				  name: () => (
					<Link href={`/@${activity.user?.username}`} className="text-foreground hover:underline">
					  {activity.user?.username}
					</Link>
				  ),
				})}
			  </span>
			) : !activity?.is_liked && activity?.rating ? (
			  <span>
				{t.rich('user_movie_activity.rated', {
				  name: () => (
					<Link href={`/@${activity.user?.username}`} className="text-foreground hover:underline">
					  {activity.user?.username}
					</Link>
				  ),
				})}
			  </span>
			) : (
			  <span>
				{t.rich('user_movie_activity.watched', {
				  name: () => (
					<Link href={`/@${activity?.user?.username}`} className="text-foreground hover:underline">
					  {activity?.user?.username}
					</Link>
				  ),
				})}
			  </span>
			)} */}
		  	{activity?.rating && (
				<IconMediaRating
				rating={activity.rating}
				className="inline-flex"
				/>
			)}
			{activity?.is_liked && (
				<Icons.like
				size={24}
				color={colors.background}
				fill={colors.accentPink}
				/>
			)}
		  </>
		)}
	  </View>
	);
});
FeedActivity.displayName = "FeedActivity";

export default FeedActivity;