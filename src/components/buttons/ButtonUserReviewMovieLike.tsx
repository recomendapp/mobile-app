import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewMovieLikeQuery } from "@/features/user/userQueries";
import { useUserReviewMovieLikeDeleteMutation, useUserReviewMovieLikeInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import { Button } from "@/components/ui/Button";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { Text } from "@/components/ui/text";
import { useToast } from "../Toast";
import { forwardRef, useCallback, useEffect, useState } from "react";
import tw from "@/lib/tw";

interface ButtonUserReviewMovieLikeProps
	extends React.ComponentProps<typeof Button> {
		reviewId: number;
		reviewLikesCount?: number;
	}

const ButtonUserReviewMovieLike = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserReviewMovieLikeProps
>(({ reviewId, reviewLikesCount, variant = "outline", size, icon = Icons.like, style, onPress, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const t = useTranslations();
	const toast = useToast();
	const {
		data: like,
	} = useUserReviewMovieLikeQuery({
		reviewId: reviewId,
		userId: session?.user.id,
	});
	const [likeCount, setLikeCount] = useState<number | undefined>(reviewLikesCount);
	const { mutateAsync: insertLike } = useUserReviewMovieLikeInsertMutation();
	const { mutateAsync: deleteLike } = useUserReviewMovieLikeDeleteMutation();

	const handleLike = useCallback(async () => {
		if (!session?.user.id || !reviewId) return;
		await insertLike({
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
	}, [insertLike, reviewId, session, toast, t]);
	const handleUnlike = useCallback(async () => {
		if (!like) return;
		await deleteLike({
			likeId: like.id
		}, {
			onSuccess: () => {
				setLikeCount((prev) => (prev ?? 0) - 1);
			},
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [deleteLike, like, toast, t]);

	useEffect(() => {
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
		onPress={async (e) => {
			if (like) {
				await handleUnlike()
			} else {
				await handleLike()
			}
			onPress?.(e);
		}}
		style={{
			...tw`rounded-full`,
			...style,
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
ButtonUserReviewMovieLike.displayName = 'ButtonUserReviewMovieLike';

export default ButtonUserReviewMovieLike;
