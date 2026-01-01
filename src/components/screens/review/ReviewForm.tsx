import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { MediaMovie, MediaTvSeries, UserActivityMovie, UserActivityTvSeries, UserReviewMovie, UserReviewTvSeries } from "@recomendapp/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { upperFirst } from "lodash";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Stack, useNavigation } from "expo-router";
import { Button } from "@/components/ui/Button";
import { CardMovie } from "@/components/cards/CardMovie";
import { CardTvSeries } from "@/components/cards/CardTvSeries";
import { View } from "@/components/ui/view";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toolbar } from "../../RichText/Toolbar";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/Toast";
import { EnrichedTextInputInstance, OnChangeSelectionEvent, OnChangeStateEvent, OnLinkDetected } from "react-native-enriched";
import { EnrichedTextInput } from "@/components/RichText/EnrichedTextInput";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { usePreventRemove } from "@react-navigation/native";
import { Alert } from "react-native";

const MAX_TITLE_LENGTH = 50;

interface ReviewFormBaseProps {
	onSave?: (review: { title: string; body: string }) => void | Promise<void>;
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
	const toast = useToast();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation();
	const { colors, bottomOffset } = useTheme();
	const t = useTranslations();
	const [title, setTitle] = useState(review?.title ?? '');
	const [defaultBody, setDefaultBody] = useState<string | undefined>(undefined);
	const [body, setBody] = useState<string | null>(null);
	const headerHeight = useSharedValue(0);
	const toolbarHeight = useSharedValue(0);
	const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
	const [isSaving, setIsSaving] = useState(false);
	const hasChanges = useMemo(() => {
		const bodyChanged = review ? (body !== null && body !== review.body) : (body !== null && body !== undefined && body.length > 0);
		return title !== (review?.title || '') || bodyChanged;
	}, [title, body, review]);
	// EDITOR
	const ref = useRef<EnrichedTextInputInstance>(null);
	const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();
	const [selectionState, setSelectionState] = useState<OnChangeSelectionEvent | null>();
	const [linkState, setLinkState] = useState<OnLinkDetected | null>(null);
	// HANDLER
	const handleSave = useCallback(async () => {
		setIsSaving(true);
		try {
			if (!activity?.rating) {
				setIsSaving(false);
				return toast.error(upperFirst(t('common.messages.a_rating_is_required_to_add_a_review')));
			}
			if (!body) {
				setIsSaving(false);
				return toast.error(upperFirst(t('common.messages.review_cannot_be_empty')));
			}
			await onSave?.({
				title: title,
				body: body,
			});
		} catch {
			setIsSaving(false);
		}
	}, [activity?.rating, onSave, title, t, toast, body]);

	const scrollViewStyle = useAnimatedStyle(() => {
		const closedPadding = bottomOffset + PADDING_VERTICAL;

		const openPadding = (-keyboardHeight.value) + toolbarHeight.value + (PADDING_VERTICAL * 2);

		const animatedPadding = interpolate(
			progress.value,
			[0, 1],
			[closedPadding, openPadding],
			Extrapolation.CLAMP
		);

		return {
			paddingBottom: animatedPadding,
		};
	});

	usePreventRemove((hasChanges && !isSaving), ({ data }) => {
		Alert.alert(
			upperFirst(t('common.messages.are_u_sure')),
			upperFirst(t('common.messages.do_you_really_want_to_cancel_change', { count: 2 })),
			[
				{
					text: upperFirst(t('common.messages.continue_editing')),
				},
				{
					text: upperFirst(t('common.messages.ignore')),
					onPress: () => navigation.dispatch(data.action),
					style: 'destructive',
				},
			]
		);
	});

	/**
	 * Issue workaround:
	 * EnrichedTextInput has a bug where the scroll is not properly set when a long default value is set.
	 * See: https://github.com/software-mansion/react-native-enriched/issues/305
	 */
	useEffect(() => {
		if (!review) return;
		const timeout = setTimeout(() => {
			setDefaultBody(review.body);
		}, 500);
		return () => clearTimeout(timeout);
	}, [review]);

	return (
	<>
		<Stack.Screen
		options={{
			headerRight: () => (
				<Button
				variant="ghost"
				size="fit"
				onPress={handleSave}
				textStyle={{ color: colors.accentYellow }}
				>
					{review ? upperFirst(t('common.messages.save')) : upperFirst(t('common.messages.publish'))}
				</Button>
			),
			unstable_headerRightItems: (props) => [
				{
					type: "button",
					label: review ? upperFirst(t('common.messages.save')) : upperFirst(t('common.messages.publish')),
					onPress: handleSave,
					icon: {
						name: "checkmark",
						type: "sfSymbol",
					},
				},
			],
		}}
		/>
		<Animated.View
		style={[
			{
				flex: 1,
				gap: GAP,
				paddingTop: PADDING_VERTICAL,
				paddingLeft: insets.left + PADDING_HORIZONTAL,
				paddingRight: insets.right + PADDING_HORIZONTAL,
			},
			scrollViewStyle
		]}
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
				{type === 'movie' ? (
					<CardMovie movie={movie} linked={false} showActionRating />
				) : type === 'tv_series' && (
					<CardTvSeries tvSeries={tvSeries} linked={false} showActionRating />
				)}
			</View>
			<EnrichedTextInput
			ref={ref}
			defaultValue={defaultBody}
			onChangeState={(e) => setStylesState(e.nativeEvent)}
			onChangeHtml={(html) => setBody(html.nativeEvent.value)}
			onChangeSelection={(e) => setSelectionState(e.nativeEvent)}
			onLinkDetected={(e) => setLinkState(e)}
			style={{ flex: 1, fontSize: 16 }}
			placeholder={upperFirst(t('common.messages.write_your_review_here'))}
			/>
		</Animated.View>
		<Toolbar
		editorRef={ref}
		onLayout={(e) => {
			toolbarHeight.value = e.nativeEvent.layout.height
		}}
		stylesState={stylesState}
		selectionState={selectionState}
		linkState={linkState}
		/>
	</>
	);
};

export default ReviewForm;