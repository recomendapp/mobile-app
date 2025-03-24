import * as React from "react"
import { UserActivity } from "@/types/type.db";
import { Text, View } from "react-native";
import tw from "@/lib/tw";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Icons } from "@/constants/Icons";
import { capitalize, upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import { useUserActivityUpdateMutation } from "@/features/user/userMutations";
import * as Burnt from 'burnt';
import BottomSheetMedia from "@/components/bottom-sheets/sheets/BottomSheetMedia";
import { Row } from "@tanstack/react-table";
import { LinkProps } from "expo-router";
import { ThemedText } from "@/components/ui/ThemedText";
import { AnimatedImageWithFallback } from "@/components/ui/AnimatedImageWithFallback";
import { useTheme } from "@/context/ThemeProvider";

interface DataTableItemProps
	extends React.ComponentPropsWithRef<typeof View> {
		item: Row<UserActivity>;
	}

export const DataTableItem = React.forwardRef<
	React.ElementRef<typeof View>,
	DataTableItemProps
>(({ item, style, ...props }, ref) => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	const router = useRouter();
	const { openSheet, createConfirmSheet } = useBottomSheetStore();
	const updateActivity = useUserActivityUpdateMutation();


	const handleUnlike = React.useCallback(async (id: number) => {
		await updateActivity.mutateAsync({
			activityId: id,
			isLiked: false,
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: capitalize(t('common.word.deleted')),
					preset: 'done',
				});
			},
			onError: () => {
				Burnt.toast({
					title: capitalize(t('common.errors.an_error_occurred')),
					preset: 'error',
				});
			}
		});
	}, []);
	const handleOpenSheet = React.useCallback((data: UserActivity) => {
		openSheet(BottomSheetMedia, {
			media: data.media,
			additionalItemsBottom: [
				{
					icon: Icons.Delete,
					label: upperFirst(t('common.word.delete')),
					onPress: () => createConfirmSheet({
						title: capitalize(t('common.library.collection.likes.modal.delete_confirm.title')),
						onConfirm: () => handleUnlike(data.id),
					})
				}
			]
		});
	}, []);

	return (
		<TouchableWithoutFeedback
		onPress={() => router.push(item.original.media?.url as LinkProps['href'])}
		onLongPress={() => handleOpenSheet(item.original)}
		>
			<View
			ref={ref}
			style={[
				tw`flex-row items-center gap-2`,
				style,
			]}
			{...props}
			>
				<AnimatedImageWithFallback
				alt={item?.original.media?.title ?? ''}
				source={{ uri: item?.original.media?.avatar_url ?? '' }}
				style={[
					{ aspectRatio: 2 / 3, height: 'fit-content' },
					tw.style('rounded-md w-16'),
				]}
				/>
				<View className="justify-center">
					<ThemedText numberOfLines={1} style={tw``} >
						{item.original.media?.title}
					</ThemedText>
					<Text style={{ color: colors.mutedForeground }} numberOfLines={1}>
						{item.original.media?.main_credit?.map((director, index) => director.title).join(', ')}
					</Text>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
})
DataTableItem.displayName = 'DataTableItem';

  