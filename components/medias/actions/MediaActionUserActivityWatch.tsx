import React from "react"
import { Pressable, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { Icons } from "@/constants/Icons";
import { AlertCircleIcon } from "lucide-react-native";
import { useUserActivityDeleteMutation, useUserActivityInsertMutation } from "@/features/user/userMutations";
import { useTheme } from "@/providers/ThemeProvider";
import { Media } from "@/types/type.db";
import * as Burnt from "burnt";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import tw from "@/lib/tw";

const ICON_SIZE = 30;

interface MediaActionUserActivityWatchProps
	extends React.ComponentProps<typeof Pressable> {
		media: Media;
	}

const MediaActionUserActivityWatch = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	MediaActionUserActivityWatchProps
>(({ media, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();
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
					title: upperFirst(t('errors.an_error_occurred')),
					preset: 'error',
				});
			}
		};
	};

	const handleUnwatch = async () => {
		if (!activity) return;
		await deleteActivity.mutateAsync({
			activityId: activity.id,
		}), {
			onError: () => {
				Burnt.toast({
					title: upperFirst(t('errors.an_error_occurred')),
					preset: 'error',
				});
			}
		};
	};

	return (
		<Pressable
		ref={ref}
		onPress={() => {
			if (process.env.EXPO_OS === 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			activity ? handleUnwatch() : handleWatch();
		}}
		disabled={isLoading || isError || activity === undefined || insertActivity.isPending || deleteActivity.isPending}
		{...props}
		>
		{isError ? (
			<AlertCircleIcon size={ICON_SIZE} />
		) : (
			<View style={[{ backgroundColor: activity ? colors.accentBlue : undefined, borderColor: activity ? colors.accentBlue : colors.foreground, width: ICON_SIZE, height: ICON_SIZE }, tw`rounded-full border-2 items-center justify-center`]}>
				<Icons.Check color={colors.foreground} />
			</View>
		)}
		</Pressable>
	);
});
MediaActionUserActivityWatch.displayName = 'MediaActionUserActivityWatch';

export default MediaActionUserActivityWatch;
