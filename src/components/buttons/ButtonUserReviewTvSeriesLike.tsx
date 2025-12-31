import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { forwardRef, useEffect, useState } from "react";
import tw from "@/lib/tw";
import { useUserReviewTvSeriesLike } from "@/api/users/hooks/useUserReviewTvSeriesLike";

interface ButtonUserReviewTvSeriesLikeProps
	extends React.ComponentProps<typeof Button> {
		reviewId: number;
		reviewLikesCount?: number;
	}

const ButtonUserReviewTvSeriesLike = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserReviewTvSeriesLikeProps
>(({ reviewId, reviewLikesCount, variant = "outline", size, icon = Icons.like, style, onPress, ...props }, ref) => {
	const { colors } = useTheme();
	const { isLiked, toggle } = useUserReviewTvSeriesLike({
		reviewId,
	});
	const [likeCount, setLikeCount] = useState<number | undefined>(reviewLikesCount);

	useEffect(() => {
		setLikeCount(reviewLikesCount);
	}, [reviewLikesCount]);

	return (
		<Button
		ref={ref}
		variant={variant}
		size={size || reviewLikesCount === undefined ? "icon" : undefined}
		icon={icon}
		iconProps={{
			color: isLiked ? colors.accentPink : colors.foreground,
			fill: isLiked ? colors.accentPink : 'transparent',
		}}
		onPress={(e) => {
			toggle();
			onPress?.(e);
		}}
		style={{
			...tw`rounded-full`,
			...style,
		}}
		{...props}
		>
			{reviewLikesCount !== undefined && (
				<Text style={[{ color: isLiked ? colors.accentPink : colors.foreground }]}>
					{likeCount}
				</Text>
			)}
		</Button>
	);
});
ButtonUserReviewTvSeriesLike.displayName = 'ButtonUserReviewTvSeriesLike';

export default ButtonUserReviewTvSeriesLike;
