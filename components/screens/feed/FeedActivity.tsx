import { IconMediaRating } from "@/components/medias/IconMediaRating";
import { ThemedText } from "@/components/ui/ThemedText";
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
			<ThemedText>
			  {t('pages.feed.reviewed', {
				name: activity.user?.username,
			  })}
			</ThemedText>
		  </>
		) : (
		  <>
			{activity?.is_liked && activity?.rating ? (
			  <ThemedText>
				{t('pages.feed.rated_liked', {
				  name: activity.user?.username,
				})}
			  </ThemedText>
			) : activity?.is_liked && !activity?.rating ? (
			  <ThemedText>
				{t('pages.feed.liked', {
					name: activity.user?.username,
				})}
			  </ThemedText>
			) : !activity?.is_liked && activity?.rating ? (
			  <ThemedText>
				{t('pages.feed.rated', {
				  name: activity.user?.username,
				})}
			  </ThemedText>
			) : (
			  <ThemedText>
				{t('pages.feed.watched', {
				  name: activity?.user?.username,
				})}
			  </ThemedText>
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