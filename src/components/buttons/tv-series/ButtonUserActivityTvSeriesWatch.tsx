import { Alert } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import { useUserActivityTvSeriesDeleteMutation, useUserActivityTvSeriesInsertMutation } from "@/api/users/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaTvSeries } from "@recomendapp/types";
import { upperFirst } from "lodash";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { forwardRef, useCallback } from "react";
import { useUserActivityTvSeriesQuery } from "@/api/users/userQueries";

interface ButtonUserActivityTvSeriesWatchProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserActivityTvSeriesWatch = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityTvSeriesWatchProps
>(({ tvSeries, icon = Icons.Check, variant = "outline", size = "icon", style, onPress: onPressProps, ...props }, ref) => {
	const toast = useToast();
	const { colors, mode } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: activity,
	} = useUserActivityTvSeriesQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id!,
	});
	const { mutateAsync: insertActivity } = useUserActivityTvSeriesInsertMutation();
	const { mutateAsync: deleteActivity } = useUserActivityTvSeriesDeleteMutation();

	const handleWatch = useCallback(async () => {
		if (activity || !session) return;
		await insertActivity({
			userId: session.user.id,
			tvSeriesId: tvSeries.id,
		}, {
			onError: () => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [activity, insertActivity, tvSeries.id, session, toast, t]);

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
ButtonUserActivityTvSeriesWatch.displayName = 'ButtonUserActivityTvSeriesWatch';

export default ButtonUserActivityTvSeriesWatch;
