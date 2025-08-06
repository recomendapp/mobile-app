import * as React from "react"
import { Pressable, Text } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserReviewLikeQuery } from "@/features/user/userQueries";
import { useUserReviewLikeDeleteMutation, useUserReviewLikeInsertMutation } from "@/features/user/userMutations";
import { usePathname, useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Icons } from "@/constants/Icons";
import Animated from "react-native-reanimated";
import tw from "@/lib/tw";
import * as Haptics from "expo-haptics";

interface ActionReviewLikeProps
	extends React.ComponentProps<typeof Animated.View> {
		reviewId: number;
		reviewLikesCount?: number;
	}

const ActionReviewLike = React.forwardRef<
	React.ComponentRef<typeof Animated.View>,
	ActionReviewLikeProps
>(({ reviewId, reviewLikesCount, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const {
		data: like,
		isLoading,
		isError,
	} = useUserReviewLikeQuery({
		reviewId: reviewId,
		userId: user?.id,
	});
	const [likeCount, setLikeCount] = React.useState(reviewLikesCount ?? undefined);
	const insertLike = useUserReviewLikeInsertMutation();
	const deleteLike = useUserReviewLikeDeleteMutation();

	const handleLike = async () => {
		if (!user) {
			// toast.error(upperFirst(common('errors.not_logged_in')));
			return;
		}
		await insertLike.mutateAsync({
			userId: user.id,
			reviewId: reviewId,
		}, {
			onSuccess: () => {
				setLikeCount((prev) => (prev ?? 0) + 1);
			},
			onError: (error) => {
				console.error(error);
				// toast.error(upperFirst(common('errors.an_error_occurred')));
			}
		});
	};
	const handleUnlike = async () => {
		if (!like) {
			// toast.error(upperFirst(common('errors.an_error_occurred')));
			return;
		}
		await deleteLike.mutateAsync({
			likeId: like.id
		}, {
			onSuccess: () => {
				setLikeCount((prev) => (prev ?? 0) - 1);
			},
			onError: () => {
				// toast.error(upperFirst(common('errors.an_error_occurred')));
			}
		});
	};

	if (user == null) {
		return (
		<Pressable onPress={() => router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)}>
			<Animated.View ref={ref} style={[style]} {...props}>
				<Icons.like color={colors.mutedForeground} size={20} />
				<Animated.Text style={{ color: colors.mutedForeground }}>
					{` ${likeCount}`}
				</Animated.Text>
			</Animated.View>
		</Pressable>
		)
	}

	return (
		<Pressable
		disabled={isLoading || isError || like === undefined || insertLike.isPending || deleteLike.isPending}
		onPress={() => {
			if (process.env.EXPO_OS === 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			like ? handleUnlike() : handleLike()
		}}
		>
			<Animated.View ref={ref} style={[tw.style('flex-row items-center'), style]} {...props}>
				{(isLoading || like === undefined) ? (
				<Icons.Loader color={colors.mutedForeground} size={20} />
				) : isError ? (
				<Icons.AlertCircle color={colors.mutedForeground} size={20}/>
				) : (
				<Icons.like color={like ? colors.accentPink : colors.mutedForeground} size={20} fill={like ? colors.accentPink : 'transparent'} />
				)}
				{likeCount != undefined ? (
					<Text style={{ color: like ? colors.accentPink : colors.mutedForeground }}>
						{` ${likeCount}`}
					</Text>
				) : null}
			</Animated.View>
		</Pressable>
	);
});
ActionReviewLike.displayName = 'ActionReviewLike';

export default ActionReviewLike;
