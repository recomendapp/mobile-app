// import { useAuth } from "@/providers/AuthProvider";
// import { useTheme } from "@/providers/ThemeProvider";
// import { useUserReviewInsertMutation, useUserReviewUpdateMutation } from "@/features/user/userMutations";
// import tw from "@/lib/tw";
// import { Media, UserReview } from "@/types/type.db";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
// import { RichText, Toolbar } from "@10play/tentap-editor";
// import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground";
// import { CardMedia } from "@/components/cards/CardMedia";
// import { ThemedText } from "@/components/ui/ThemedText";
// import { upperFirst } from "lodash";
// import { useUserActivityQuery } from "@/features/user/userQueries";
// import * as Burnt from "burnt";
// import useEditor from "@/lib/10tap/editor";

// interface ReviewFormProps {
// 	media: Media;
// 	review?: UserReview;
// 	onSave?: () => void;
// };

// const ReviewForm = ({
// 	media,
// 	review,
// 	onSave,
// } : ReviewFormProps) => {
// 	const { colors, inset } = useTheme();
// 	const { t } = useTranslation();
// 	const bottomTabBarHeight = useBottomTabOverflow();
// 	const { user } = useAuth();
// 	const router = useRouter();
// 	const [title, setTitle] = useState(review?.title);
// 	// const [body, setBody] = useState<JSONContent | undefined>(review?.body ?? undefined);
// 	const updateReview = useUserReviewUpdateMutation();
// 	const insertReview = useUserReviewInsertMutation({
// 		userId: user?.id,
// 		mediaId: media.media_id!,
// 	});
// 	const {
// 		data: activity,
// 	} = useUserActivityQuery({
// 		userId: user?.id,
// 		mediaId: media.media_id!,
// 	});
// 	const [headerHeight, setHeaderHeight] = useState(0);
// 	const [isEditorFocused, setIsEditorFocused] = useState(false);
// 	// EDITOR
// 	const editor = useEditor({
// 		initialContent: review?.body,
// 	});

// 	// HANDLER
// 	const handleSave = async () => {
// 		try {
// 			const content = await editor.getJSON();
// 			if (review) {
// 				await updateReview.mutateAsync({
// 					id: review.id,
// 					title: title,
// 					body: content,
// 				}, {
// 					onSuccess: () => {
// 						onSave?.();
// 					},
// 					onError: (error) => {
// 						throw error;
// 					}
// 				});
// 			} else {
// 				if (!activity?.rating) {
// 					throw new Error('La note est obligatoire pour poster une critique');
// 				}
// 				await insertReview.mutateAsync({
// 					activityId: activity.id,
// 					title: title,
// 					body: content,
// 				}, {
// 					onSuccess: () => {
// 						onSave?.();
// 					},
// 					onError: (error) => {
// 						throw error;
// 					}
// 				});
// 			}
// 		} catch (error) {
// 			if (error instanceof Error) {
// 				Burnt.toast({
// 					title: upperFirst(t('common.messages.error')),
// 					message: error.message,
// 					preset: 'error',
// 				});
// 			} else {
// 				console.log('error', error);
// 			}
// 		}
// 	}
	
// 	useEffect(() => {
// 		if (isEditorFocused) {
// 			editor.focus();
// 		} else {
// 			editor.blur();
// 		}
// 	}, [isEditorFocused]);

// 	useEffect(() => {
// 		if (review) {
// 			editor.setContent(review.body);
// 		}
// 	}, [review]);

// 	return (
// 	<View
// 	style={[
// 		{
// 			paddingTop: inset.top,
// 			paddingBottom: bottomTabBarHeight + inset.bottom,
// 		},
// 		tw`flex-1 gap-2`
// 	]}
// 	>
// 		<View
// 		style={tw`px-2 gap-2`}
// 		onLayout={(e) => {
// 			setHeaderHeight(e.nativeEvent.layout.height + 8);
// 		}}
// 		>
// 			<View style={tw`flex-row justify-between items-center gap-2`}>
// 				<ThemedText style={tw`text-2xl font-bold`}>
// 					{review
// 						? 'Modifier la critique'
// 						: 'Nouvelle critique'}
// 				</ThemedText>
// 				<View style={tw`flex-row items-center gap-2`}>
// 					{isEditorFocused ? (
// 						<TouchableOpacity onPress={() => setIsEditorFocused(false)}>
// 							<Text style={[{ color: colors.accentYellow }, tw`text-lg`]}>OK</Text>
// 						</TouchableOpacity>
// 					) : (
// 						<TouchableOpacity onPress={handleSave}>
// 							<Text style={[{ color: colors.accentYellow }, tw`text-lg`]}>{upperFirst(t('common.word.save'))}</Text>
// 						</TouchableOpacity>
// 					)}
// 				</View>
// 			</View>
// 			{/* MEDIA */}
// 			<CardMedia
// 			media={media}
// 			linked={false}
// 			showAction={{
// 				rating: true,
// 			}}
// 			/>
// 		</View>
// 		<View style={tw`flex-1`}>
// 			<View style={tw`flex-1 px-2`}>
// 				<RichText
// 				editor={editor}
// 				exclusivelyUseCustomOnMessage={false}
// 				onMessage={(e) => {
// 					const data = JSON.parse(e.nativeEvent.data);
// 					if (data.type === 'stateUpdate') {
// 						if (data.payload.isFocused !== isEditorFocused) {
// 							setIsEditorFocused(data.payload.isFocused);
// 						}
// 					}
// 				}}
// 				/>
// 			</View>
// 			<KeyboardAvoidingView
// 				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
// 				style={tw`absolute bottom-0`}
// 				keyboardVerticalOffset={(headerHeight ?? 0) + inset.top}
// 			>
// 				<Toolbar editor={editor} hidden={false} />
// 			</KeyboardAvoidingView>
// 		</View>
// 	</View>
// 	);
// };

// export default ReviewForm;