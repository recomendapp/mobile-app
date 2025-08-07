import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { upperFirst } from "lodash";
import { Skeleton } from "../ui/Skeleton";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { Button } from "../ui/Button";
import React from "react";
import { ViewStyle } from "react-native";
import { Link } from "expo-router";
import { Icons } from "@/constants/Icons";

interface ButtonMyReviewProps
  extends React.ComponentProps<typeof Button> {
	mediaId: number;
	skeleton?: boolean;
  }

const ButtonMyReview = React.forwardRef<
  React.ComponentRef<typeof Button>,
  ButtonMyReviewProps
>(({ mediaId, skeleton, style, ...props }, ref) => {
	const t = useTranslations();
	const { user } = useAuth();
	const {
	  data: activity,
	  isLoading,  
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: mediaId,
	});
	const loading = skeleton || !mediaId || isLoading || activity === undefined;


	if (!user) return null;

	if (loading) {
		return (
		<Skeleton borderRadius={999} style={tw.style("h-10 w-32")} />
		)
	}
  
	return (
	<Link
	href={activity?.review ? `/review/${activity?.review?.id}` : `/review/create/${mediaId}`}
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
ButtonMyReview.displayName = "ButtonMyReview";

export default ButtonMyReview;
