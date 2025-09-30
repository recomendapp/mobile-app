import { IconMediaRating } from "@/components/medias/IconMediaRating";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { Profile, UserActivityMovie, UserActivityTvSeries } from "@recomendapp/types";
import { forwardRef } from "react";
import { View } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";

interface FeedUserActivityProps
  extends React.ComponentProps<typeof View> {
	author: Profile;
	activity: UserActivityMovie | UserActivityTvSeries | null;
}

const FeedUserActivity = forwardRef<
	React.ComponentRef<typeof View>,
	FeedUserActivityProps
>(({ author, activity, style, ...props }, ref) => {
	const { colors } = useTheme();
	const t = useTranslations();
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
			<Text>
			  {t.rich('pages.feed.actions.reviewed', {
				name: () => (
				  <Text style={tw`font-semibold`}>
					{author.username}
				  </Text>
				),
			  })}
			</Text>
		  </>
		) : (
		  <>
			{activity?.is_liked && activity?.rating ? (
			  <Text>
				{t.rich('pages.feed.actions.rated_liked', {
				  name: () => (
					<Text style={tw`font-semibold`}>
					  {author.username}
					</Text>
				  ),
				})}
			  </Text>
			) : activity?.is_liked && !activity?.rating ? (
			  <Text>
				{t.rich('pages.feed.actions.liked', {
					name: () => (
					  <Text style={tw`font-semibold`}>
						{author.username}
					  </Text>
					),
				})}
			  </Text>
			) : !activity?.is_liked && activity?.rating ? (
			  <Text>
				{t.rich('pages.feed.actions.rated', {
				  name: () => (
					<Text style={tw`font-semibold`}>
					  {author.username}
					</Text>
				  ),
				})}
			  </Text>
			) : (
			  <Text>
				{t.rich('pages.feed.actions.watched', {
				  name: () => (
					<Text style={tw`font-semibold`}>
					  {author.username}
					</Text>
				  ),
				})}
			  </Text>
			)}
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
FeedUserActivity.displayName = "FeedUserActivity";

export default FeedUserActivity;