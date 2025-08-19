import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityTvSeriesQuery } from "@/features/user/userQueries";
import { upperFirst } from "lodash";
import { Skeleton } from "../ui/Skeleton";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { Button } from "../ui/Button";
import React from "react";
import { ViewStyle } from "react-native";
import { Link } from "expo-router";
import { Icons } from "@/constants/Icons";
import { MediaTvSeries } from "@/types/type.db";

interface ButtonMyReviewTvSeriesProps
  extends React.ComponentProps<typeof Button> {
	tvSeries: MediaTvSeries;
	skeleton?: boolean;
  }

const ButtonMyReviewTvSeries = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonMyReviewTvSeriesProps
>(({ tvSeries, skeleton, style, ...props }, ref) => {
	const t = useTranslations();
	const { user } = useAuth();
	const {
	  data: activity,
	  isLoading,  
	} = useUserActivityTvSeriesQuery({
		userId: user?.id,
		tvSeriesId: tvSeries.id,
	});
	const loading = skeleton || isLoading || activity === undefined;


	if (!user) return null;

	if (loading) {
		return (
		<Skeleton borderRadius={999} style={tw.style("h-10 w-32")} />
		)
	}
  
	return (
	<Link
	href={`/tv_series/${tvSeries.slug || tvSeries.id}/review/${activity?.review ? activity.review.id : `create`}`}
	asChild
	>
		<Button
		ref={ref}
		variant={props.size === "icon" ? "ghost" : activity?.review ? "muted" : "accent-yellow"}
		style={[
		  tw.style('px-4 py-2 rounded-full'),
		  style as ViewStyle,
		]}
		icon={activity?.review ? Icons.Eye : Icons.Edit}
		{...props}
		>
		  {props.size !== "icon" && (activity?.review ? upperFirst(t('common.messages.my_review', { count: 1 })) : upperFirst(t('common.messages.add_review')))}
		</Button>
	</Link>
	);
});
ButtonMyReviewTvSeries.displayName = "ButtonMyReviewTvSeries";

export default ButtonMyReviewTvSeries;
