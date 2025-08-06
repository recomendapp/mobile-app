import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useUserReviewInsertMutation, useUserReviewUpdateMutation } from "@/features/user/userMutations";
import tw from "@/lib/tw";
import { Media, UserReview } from "@/types/type.db";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { RichText, Toolbar } from "@10play/tentap-editor";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
import { CardMedia } from "@/components/cards/CardMedia";
import { ThemedText } from "@/components/ui/ThemedText";
import { upperFirst } from "lodash";
import { useUserActivityQuery } from "@/features/user/userQueries";
import * as Burnt from "burnt";
import useEditor from "@/lib/10tap/editor";
import { useSharedValue } from "react-native-reanimated";
import { BetterInput } from "@/components/ui/BetterInput";
import isPostgrestError from "@/utils/isPostgrestError";
import { useTranslations } from "use-intl";

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
	const { colors, inset } = useTheme();
	const t = useTranslations();
	const bottomTabBarHeight = useBottomTabOverflow();
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
	// const [headerHeight, setHeaderHeight] = useState(0);
	const headerHeight = useSharedValue(0);
	const [isEditorFocused, setIsEditorFocused] = useState(false);
	// EDITOR
	const editor = useEditor({
		initialContent: review?.body,
	});

	// HANDLER
	const handleSave = async () => {
		console.log('handleSave called', review?.id);
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
			if (error instanceof Error) {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: error.message,
					preset: 'error',
					haptic: 'error',
				});
			} else if (isPostgrestError(error)) {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: error.details,
					preset: 'error',
					haptic: 'error',
				});
			} else {
				console.log('error', error);
			}
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
	<View
	style={[
		{
			paddingTop: inset.top,
			paddingBottom: bottomTabBarHeight + inset.bottom,
		},
		tw`flex-1 gap-2`
	]}
	>
		<View
		style={tw`px-2 gap-2`}
		onLayout={(e) => {
			headerHeight.value = e.nativeEvent.layout.height + 8;
		}}
		>
			<View style={tw`flex-row justify-between items-center gap-2`}>
				<ThemedText style={tw`text-2xl font-bold`}>
					{review
						? 'Modifier la critique'
						: 'Nouvelle critique'}
				</ThemedText>
				<View style={tw`flex-row items-center gap-2`}>
					{isEditorFocused ? (
						<TouchableOpacity onPress={() => setIsEditorFocused(false)}>
							<Text style={[{ color: colors.accentYellow }, tw`text-lg`]}>OK</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity onPress={handleSave}>
							<Text style={[{ color: colors.accentYellow }, tw`text-lg`]}>{upperFirst(t('common.messages.save'))}</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
			{/* TITLE */}
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
			showAction={{
				rating: true,
			}}
			/>
		</View>
		<View style={tw`flex-1`}>
			<RichText
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
				keyboardVerticalOffset={headerHeight.get() + inset.top}
			>
				<Toolbar editor={editor} hidden={false} />
			</KeyboardAvoidingView>
		</View>
	</View>
	);
};

export default ReviewForm;