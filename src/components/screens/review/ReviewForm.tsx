import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import {  MediaMovie, MediaTvSeries, UserActivityMovie, UserActivityTvSeries, UserReviewMovie, UserReviewTvSeries } from "@recomendapp/types";
import { useEffect, useState } from "react";
import { upperFirst } from "lodash";
import * as Burnt from "burnt";
import useEditor from "@/lib/10tap/editor";
import { useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Stack } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useHeaderHeight } from '@react-navigation/elements';
import { CardMovie } from "@/components/cards/CardMovie";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import { View } from "@/components/ui/view";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toolbar } from "../../RichText/Toolbar";
import { Input } from "@/components/ui/Input";
import { RichText } from "@/components/RichText/RichText";

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
	const insets = useSafeAreaInsets();	
	const { colors, bottomTabHeight } = useTheme();
	const t = useTranslations();
	const [title, setTitle] = useState(review?.title ?? '');
	const navigationHeaderHeight = useHeaderHeight();
	const headerHeight = useSharedValue(0);
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
				message: upperFirst(t('common.messages.a_rating_is_required_to_add_a_review')),
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
		if (review) {
			editor.setContent(review.body);
		}
	}, [review]);

	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
				review ?(
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
		<KeyboardAwareScrollView
		contentContainerStyle={[
			{
				gap: GAP,
				paddingTop: PADDING_VERTICAL,
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
			},
			tw`flex-1`
		]}
		bottomOffset={navigationHeaderHeight}
		>
			<View
			style={{ gap: GAP }}
			onLayout={(e) => {
				headerHeight.value = e.nativeEvent.layout.height + 8;
			}}
			>
				<Input
				value={title}
				onChangeText={(text) => setTitle(text.replace(/\s+/g, ' ').trimStart())}
				placeholder={upperFirst(t('common.messages.title'))}
				maxLength={MAX_TITLE_LENGTH}
				inputContainerStyle={tw`bg-transparent border-0 rounded-none`}
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
			<RichText
			scrollEnabled={false}
			editor={editor}
			exclusivelyUseCustomOnMessage={false}
			/>
		</KeyboardAwareScrollView>
		<Toolbar editor={editor} />
	</>
	);
};

export default ReviewForm;