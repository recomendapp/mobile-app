import React from "react"
import { Alert, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityMovieQuery, useUserActivityTvSeriesQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { useUserActivityMovieDeleteMutation, useUserActivityMovieInsertMutation, useUserActivityTvSeriesDeleteMutation, useUserActivityTvSeriesInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { MediaMovie, MediaTvSeries } from "@recomendapp/types";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { ICON_ACTION_SIZE } from "@/theme/globals";

interface ButtonUserActivityTvSeriesWatchProps
	extends React.ComponentProps<typeof Button> {
		tvSeries: MediaTvSeries;
	}

const ButtonUserActivityTvSeriesWatch = React.forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityTvSeriesWatchProps
>(({ tvSeries, variant = "ghost", size = "fit", onPress: onPressProps, iconProps, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { session } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityTvSeriesQuery({
		userId: session?.user.id,
		tvSeriesId: tvSeries.id!,
	});
	const insertActivity = useUserActivityTvSeriesInsertMutation();
	const deleteActivity = useUserActivityTvSeriesDeleteMutation();

	const handleWatch = async () => {
		if (activity || !session) return;
		await insertActivity.mutateAsync({
			userId: session.user.id,
			tvSeriesId: tvSeries.id,
		}), {
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		};
	};

	const handleUnwatch = async () => {
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
						await deleteActivity.mutateAsync({
							activityId: activity.id,
						}, {
							onError: () => {
								Burnt.toast({
									title: upperFirst(t('common.messages.an_error_occurred')),
									preset: 'error',
									haptic: 'error',
								});
							}
						});
					},
					style: 'destructive',
				},
			]
		);
	};

	return (
		<Button
		variant={variant}
		size={size}
		onPress={() => {
			if (session) {
				activity ? handleUnwatch() : handleWatch();
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
			onPressProps?.();
		}}
		>
			<View style={[{ backgroundColor: activity ? colors.accentBlue : undefined, borderColor: activity ? colors.accentBlue : colors.foreground, width: ICON_ACTION_SIZE, height: ICON_ACTION_SIZE }, tw`rounded-full border-2 items-center justify-center`]}>
				<Icons.Check color={colors.foreground} size={ICON_ACTION_SIZE * 0.7}/>
			</View>
		</Button>
	);
});
ButtonUserActivityTvSeriesWatch.displayName = 'ButtonUserActivityTvSeriesWatch';

export default ButtonUserActivityTvSeriesWatch;
