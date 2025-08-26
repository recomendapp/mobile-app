import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import {  MediaMovie, MediaTvSeries, UserActivityMovie, UserActivityTvSeries, UserReview, UserReviewMovie, UserReviewTvSeries } from "@recomendapp/types";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { RichText, Toolbar } from "@10play/tentap-editor";
import { upperCase, upperFirst } from "lodash";
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
import { CardMovie } from "@/components/cards/CardMovie";
import { CardTvSeries } from "@/components/cards/CardTvSeries";

const MAX_TITLE_LENGTH = 50;
const MAX_BODY_LENGTH = 5000;

interface ReviewFormBaseProps {
	onSave?: (review: { title: string; body: object }) => void;
};

type ReviewFormMovieProps = {
	type: 'movie';
	activity?: UserActivityMovie | null;
	movie: MediaMovie;
	review?: UserReviewMovie;
	tvSeries?: never;
};

type ReviewFormTvSeriesProps = {
	type: 'tv_series';
	activity?: UserActivityTvSeries | null;
	tvSeries: MediaTvSeries;
	review?: UserReviewTvSeries;
	movie?: never;
}

type ReviewFormProps = ReviewFormBaseProps &
	(ReviewFormMovieProps | ReviewFormTvSeriesProps);

const ReviewForm = ({
	type,
	activity,
	tvSeries,
	movie,
	review,
	onSave,
} : ReviewFormProps) => {
	const { colors, bottomTabHeight } = useTheme();
	const t = useTranslations();
	const [title, setTitle] = useState(review?.title ?? '');
	const navigationHeaderHeight = useHeaderHeight();
	const headerHeight = useSharedValue(0);
	const [isEditorFocused, setIsEditorFocused] = useState(false);
	// EDITOR
	const editor = useEditor({
		initialContent: review?.body as any,
	});

	// HANDLER
	const handleSave = async () => {
		const content = await editor.getJSON();
		if (!activity?.rating) {
			return Burnt.toast({
				title: upperFirst(t('common.messages.error')),
				message: upperFirst(t('common.messages.rating_required')),
				preset: 'error',
				haptic: 'error',
			});
		}
		onSave?.({
			title: title,
			body: content,
		})
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
				{type === 'movie' ? (
					<CardMovie movie={movie} linked={false} showActionRating />
				) : type === 'tv_series' && (
					<CardTvSeries tvSeries={tvSeries} linked={false} showActionRating />
				)}
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