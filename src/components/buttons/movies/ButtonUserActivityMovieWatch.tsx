import { Alert } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import { useUserActivityMovieDeleteMutation, useUserActivityMovieInsertMutation } from "@/api/users/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie } from "@recomendapp/types";
import { upperFirst } from "lodash";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import { useUserActivityMovieQuery } from "@/api/users/userQueries";

interface ButtonUserActivityMovieWatchProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

const ButtonUserActivityMovieWatch = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityMovieWatchProps
>(({ movie, icon = Icons.Check, variant = "outline", size = "icon", style, onPress: onPressProps, ...props }, ref) => {
	const { colors, mode } = useTheme();
	const toast = useToast();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: activity,
	} = useUserActivityMovieQuery({
		userId: session?.user.id,
		movieId: movie.id!,
	});
	const { mutateAsync: insertActivity } = useUserActivityMovieInsertMutation();
	const { mutateAsync: deleteActivity } = useUserActivityMovieDeleteMutation();

	const handleWatch = useCallback(async () => {
		if (activity || !session) return;
		await insertActivity({
			userId: session.user.id,
			movieId: movie.id,
		}, {
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [activity, insertActivity, movie.id, session, toast, t]);

	const handleUnwatch = useCallback(async () => {
		if (!activity) return;
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(t('components.media.actions.watch.remove_from_watched.description')),
			[
				{
					text: upperFirst(t('common.messages.cancel')),
					style: 'cancel',
				},
				{
					text: upperFirst(t('common.messages.confirm')),
					onPress: async () => {
						await deleteActivity({
							activityId: activity.id,
						}, {
							onError: () => {
								toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
							}
						});
					},
					style: 'destructive',
				},
			], {
				userInterfaceStyle: mode,
			}
		);
	}, [activity, deleteActivity, mode, toast, t]);

	return (
		<Button
		ref={ref}
		variant={variant}
		size={size}
		icon={icon}
		onPress={async (e) => {
			if (session) {
				if (activity) {
					await handleUnwatch()
				} else {
					await handleWatch()
				}
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
			onPressProps?.(e);
		}}
		style={{
			...(activity ? { backgroundColor: colors.accentBlue } : undefined),
			...tw`rounded-full`,
			...style,
		}}
		{...props}
		/>
	);
});
ButtonUserActivityMovieWatch.displayName = 'ButtonUserActivityMovieWatch';

export default ButtonUserActivityMovieWatch;
