import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserReviewInsertMutation, useUserReviewUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { Media, UserReview } from "@/types/type.db";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { RichText, Toolbar } from "@10play/tentap-editor";
import { CardMedia } from "@/components/cards/CardMedia";
import { upperCase, upperFirst } from "lodash";
import { useUserActivityQuery } from "@/features/user/userQueries";
import * as Burnt from "burnt";
import useEditor from "@/lib/10tap/editor";
import { useSharedValue } from "react-native-reanimated";
import { BetterInput } from "@/components/ui/BetterInput";
import isPostgrestError from "@/utils/isPostgrestError";
import { useTranslations } from "use-intl";
import { Stack } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useHeaderHeight } from '@react-navigation/elements';
import { ScrollView } from "react-native-gesture-handler";

const MAX_TITLE_LENGTH = 50;
const MAX_BODY_LENGTH = 5000;

interface ReviewFormProps {
	media: Media;
	review?: UserReview;
	onSave?: () => void;
};

const ReviewForm = ({
	media,
	review,
	onSave,
} : ReviewFormProps) => {
	const { colors, bottomTabHeight } = useTheme();
	const t = useTranslations();
	const { user } = useAuth();
	const [title, setTitle] = useState(review?.title ?? '');
	const updateReview = useUserReviewUpdateMutation();
	const insertReview = useUserReviewInsertMutation({
		userId: user?.id,
		mediaId: media.media_id!,
	});
	const {
		data: activity,
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: media.media_id!,
	});
	const navigationHeaderHeight = useHeaderHeight();
	const headerHeight = useSharedValue(0);
	const [isEditorFocused, setIsEditorFocused] = useState(false);
	// EDITOR
	const editor = useEditor({
		initialContent: review?.body as any,
	});

	// HANDLER
	const handleSave = async () => {
		try {
			const content = await editor.getJSON();
			if (review) {
				await updateReview.mutateAsync({
					id: review.id,
					title: title,
					body: content,
				}, {
					onSuccess: () => {
						onSave?.();
					},
					onError: (error) => {
						throw error;
					}
				});
			} else {
				if (!activity?.rating) {
					throw new Error('La note est obligatoire pour poster une critique');
				}
				await insertReview.mutateAsync({
					activityId: activity.id,
					title: title,
					body: content,
				}, {
					onSuccess: () => {
						onSave?.();
					},
					onError: (error) => {
						throw error;
					}
				});
			}
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (isPostgrestError(error)) {
				errorMessage = error.message;
			}
			Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: errorMessage,
				preset: 'error',
				haptic: 'error',
			});
		}
	}
	
	useEffect(() => {
		if (isEditorFocused) {
			editor.focus();
		} else {
			editor.blur();
		}
	}, [isEditorFocused]);

	useEffect(() => {
		if (review) {
			editor.setContent(review.body);
		}
	}, [review]);

	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
				isEditorFocused ? (
					<Button
					variant="ghost"
					size="fit"
					onPress={() => setIsEditorFocused(false)}
					>
						{upperCase(t('common.messages.ok'))}
					</Button>
				) : review ?(
					<Button
					variant="ghost"
					size="fit"
					onPress={handleSave}
					textStyle={{ color: colors.accentYellow }}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				) : (
					<Button
					variant="ghost"
					size="fit"
					onPress={handleSave}
					textStyle={{ color: colors.accentYellow }}
					>
						{upperFirst(t('common.messages.publish'))}
					</Button>
				)
			)
		}}
		/>
		<ScrollView
		contentContainerStyle={[
			{ paddingBottom: bottomTabHeight + 8 },
			tw`gap-2`
		]}
		>
			<View
			style={tw`px-2 gap-2`}
			onLayout={(e) => {
				headerHeight.value = e.nativeEvent.layout.height + 8;
			}}
			>
				<BetterInput
				value={title}
				onChangeText={(text) => setTitle(text.replace(/\s+/g, ' ').trimStart())}
				placeholder={upperFirst(t('common.messages.title'))}
				maxLength={MAX_TITLE_LENGTH}
				containerStyle={tw`bg-transparent p-0`}
				style={[
					tw`h-auto font-bold`,
					{
						fontSize: 24,
						color: colors.accentYellow,
					}
				]}
				textAlign="center"
				multiline
				/>
				{/* MEDIA */}
				<CardMedia
				media={media}
				linked={false}
				showActionRating
				/>
			</View>
			<View style={tw`flex-1`}>
				<RichText
				scrollEnabled={false}
				editor={editor}
				exclusivelyUseCustomOnMessage={false}
				onMessage={(e) => {
					const data = JSON.parse(e.nativeEvent.data);
					if (data.type === 'stateUpdate') {
						if (data.payload.isFocused !== isEditorFocused) {
							setIsEditorFocused(data.payload.isFocused);
						}
					}
				}}
				style={[
					tw`px-2`,
					{ backgroundColor: colors.background,}
				]}
				/>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={tw`absolute bottom-0`}
					keyboardVerticalOffset={headerHeight.get() + navigationHeaderHeight}
				>
					<Toolbar editor={editor} hidden={false} />
				</KeyboardAvoidingView>
			</View>
		</ScrollView>
	</>
	);
};

export default ReviewForm;