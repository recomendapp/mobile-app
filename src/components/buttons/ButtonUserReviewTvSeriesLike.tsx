import * as React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewTvSeriesLikeQuery } from "@/features/user/userQueries";
import { useUserReviewTvSeriesLikeInsertMutation, useUserReviewTvSeriesLikeDeleteMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { useToast } from "../Toast";

interface ButtonUserReviewTvSeriesLikeProps
	extends React.ComponentProps<typeof Button> {
		reviewId: number;
		reviewLikesCount?: number;
	}

const ButtonUserReviewTvSeriesLike = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserReviewTvSeriesLikeProps
>(({ reviewId, reviewLikesCount, variant = "ghost", size, icon = Icons.like, onPress, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const t = useTranslations();
	const toast = useToast();
	const {
		data: like,
		isLoading,
		isError,
	} = useUserReviewTvSeriesLikeQuery({
		reviewId: reviewId,
		userId: session?.user.id,
	});
	const [likeCount, setLikeCount] = React.useState<number | undefined>(reviewLikesCount);
	const insertLike = useUserReviewTvSeriesLikeInsertMutation();
	const deleteLike = useUserReviewTvSeriesLikeDeleteMutation();

	const handleLike = async () => {
		if (!session?.user.id || !reviewId) return;
		await insertLike.mutateAsync({
			userId: session.user.id,
			reviewId: reviewId,
		}, {
			onSuccess: () => {
				setLikeCount((prev) => (prev ?? 0) + 1);
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};
	const handleUnlike = async () => {
		if (!like) return;
		await deleteLike.mutateAsync({
			likeId: like.id
		}, {
			onSuccess: () => {
				setLikeCount((prev) => (prev ?? 0) - 1);
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	};

	React.useEffect(() => {
		setLikeCount(reviewLikesCount);
	}, [reviewLikesCount]);

	if (!session) return null;

	return (
		<Button
		ref={ref}
		variant={variant}
		size={size || reviewLikesCount === undefined ? "icon" : undefined}
		icon={icon}
		iconProps={{
			color: like ? colors.accentPink : colors.foreground,
			fill: like ? colors.accentPink : 'transparent',
		}}
		onPress={() => {
			like ? handleUnlike() : handleLike();
			onPress?.();
		}}
		{...props}
		>
			{reviewLikesCount !== undefined && (
				<Text style={[{ color: like ? colors.accentPink : colors.foreground }]}>
					{likeCount}
				</Text>
			)}
		</Button>
	);
});
ButtonUserReviewTvSeriesLike.displayName = 'ButtonUserReviewTvSeriesLike';

export default ButtonUserReviewTvSeriesLike;
