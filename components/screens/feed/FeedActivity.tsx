import { IconMediaRating } from "@/components/medias/IconMediaRating";
import { Icons } from "@/constants/Icons";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { UserActivity } from "@/types/type.db";
import { forwardRef } from "react";
import { View } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";

interface FeedActivityProps
  extends React.ComponentProps<typeof View> {
	activity: UserActivity | null;
}

const FeedActivity = forwardRef<
	React.ComponentRef<typeof View>,
	FeedActivityProps
>(({ activity, style, ...props }, ref) => {
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
					{activity.user?.username}
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
					  {activity.user?.username}
					</Text>
				  ),
				})}
			  </Text>
			) : activity?.is_liked && !activity?.rating ? (
			  <Text>
				{t.rich('pages.feed.actions.liked', {
					name: () => (
					  <Text style={tw`font-semibold`}>
						{activity.user?.username}
					  </Text>
					),
				})}
			  </Text>
			) : !activity?.is_liked && activity?.rating ? (
			  <Text>
				{t.rich('pages.feed.actions.rated', {
				  name: () => (
					<Text style={tw`font-semibold`}>
					  {activity.user?.username}
					</Text>
				  ),
				})}
			  </Text>
			) : (
			  <Text>
				{t.rich('pages.feed.actions.watched', {
				  name: () => (
					<Text style={tw`font-semibold`}>
					  {activity?.user?.username}
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
FeedActivity.displayName = "FeedActivity";

export default FeedActivity;