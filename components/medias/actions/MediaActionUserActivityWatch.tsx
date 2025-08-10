import React from "react"
import { Alert, Pressable, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityDeleteMutation, useUserActivityInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import * as Haptics from "expo-haptics";
import tw from "@/lib/tw";
import { useTranslations } from "use-intl";
import { usePathname, useRouter } from "expo-router";

const ICON_SIZE = 24;

interface MediaActionUserActivityWatchProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserActivityWatch = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserActivityWatchProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { session, user } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations();
	const {
		data: activity,
		isLoading,
		isError,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});
	const insertActivity = useUserActivityInsertMutation();
	const deleteActivity = useUserActivityDeleteMutation();

	const handleWatch = async () => {
		if (activity || !user?.id) return;
		await insertActivity.mutateAsync({
			userId: user?.id,
			mediaId: media.media_id!,
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
		<Pressable
		ref={ref}
		onPress={() => {
			if (session) {
				if (process.env.EXPO_OS === 'ios') {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				}
				activity ? handleUnwatch() : handleWatch();
			} else {
				router.push({
					pathname: '/auth',
					params: {
						redirect: pathname,
					},
				});
			}
		}}
		disabled={
			session ? (
				isLoading || isError || activity === undefined || insertActivity.isPending || deleteActivity.isPending
			) : false
		}
		{...props}
		>
		{isError ? (
			<AlertCircleIcon size={ICON_SIZE} />
		) : (
			<View style={[{ backgroundColor: activity ? colors.accentBlue : undefined, borderColor: activity ? colors.accentBlue : colors.foreground, width: ICON_SIZE, height: ICON_SIZE }, tw`rounded-full border-2 items-center justify-center`]}>
				<Icons.Check color={colors.foreground} size={ICON_SIZE * 0.7}/>
			</View>
		)}
		</Pressable>
	);
});
MediaActionUserActivityWatch.displayName = 'MediaActionUserActivityWatch';

export default MediaActionUserActivityWatch;
