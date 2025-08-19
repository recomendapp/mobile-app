import * as React from "react"
import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewTvSeriesLikeQuery } from "@/features/user/userQueries";
import { useUserReviewTvSeriesLikeInsertMutation, useUserReviewTvSeriesLikeDeleteMutation } from "@/features/user/userMutations";
import { usePathname, useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";

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
	const router = useRouter();
	const pathname = usePathname();
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
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
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
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
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
