import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useAuth } from "@/providers/AuthProvider";
import { Profile } from "@recomendapp/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable } from "react-native";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import tw from "@/lib/tw";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SearchBar } from "@/components/ui/searchbar";
import { PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import Fuse from "fuse.js";
import { Icons } from "@/constants/Icons";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useUserRecosMovieInsertMutation } from "@/api/users/userMutations";
import { CardUser } from "@/components/cards/CardUser";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/Toast";
import { useUserRecosMovieSendQuery } from "@/api/users/userQueries";

const COMMENT_MAX_LENGTH = 180;

const RecoSendMovie = () => {
	const t = useTranslations();
	const router = useRouter();
	const toast = useToast();
	const { mode } = useTheme();
	const { session } = useAuth();
	const { movie_id } = useLocalSearchParams();
	const movieId = Number(movie_id);

	// Form
	const sendRecoMovieFormSchema = z.object({
		comment: z.string()
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/)
			.optional()
			.nullable(),
	});
	type SendRecoMovieFormValues = z.infer<typeof sendRecoMovieFormSchema>;
	const defaultValues: Partial<SendRecoMovieFormValues> = {
		comment: '',
	};
	const form = useForm<SendRecoMovieFormValues>({
		resolver: zodResolver(sendRecoMovieFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Mutations
	const { mutateAsync: sendReco, isPending: isSendingReco } = useUserRecosMovieInsertMutation();

	// SharedValues
	const footerHeight = useSharedValue(0);

	// States
	const [search, setSearch] = useState('');
	const [results, setResults] = useState<typeof friends>([]);
	const [selected, setSelected] = useState<Profile[]>([]);
	const resultsRender = results?.map((item) => ({ item: item, isSelected: selected.some((selectedItem) => selectedItem.id === item.friend.id) }))
	const canSave = useMemo(() => {
		return selected.length > 0;
	}, [selected]);

	// Queries
	const {
		data: friends,
		isRefetching,
		refetch,
	} = useUserRecosMovieSendQuery({
		userId: session?.user?.id,
		movieId: movieId,
	});

	// Search
	const fuse = useMemo(() => {
		return new Fuse(friends || [], {
			keys: ['friend.username', 'friend_full_name'],
			threshold: 0.5,
		});
	}, [friends]);
	useEffect(() => {
		if (search && search.length > 0) {
			setResults(fuse?.search(search).map(result => result.item));
		} else {
			setResults(friends);
		}
	}, [search, friends, fuse]);

	// Handlers
	const handleToggleUser = useCallback((user: Profile) => {
		setSelected((prev) => {
			const isSelected = prev.some((p) => p.id === user.id);
			if (isSelected) {
				return prev.filter((p) => p.id !== user.id);
			}
			return [...prev, user];
		});
	}, []);
	const handleSubmit = useCallback(async (values: SendRecoMovieFormValues) => {
		if (!session?.user.id) return;
		if (selected.length === 0) return;
		await sendReco({
			senderId: session.user.id,
			movieId: movieId,
			receivers: selected,
			comment: values.comment?.trim() || undefined,
		}, {
			onSuccess: () => {
				toast.success(upperFirst(t('common.messages.sent', { count: selected.length, gender: 'female' })));
				router.dismiss();
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
			}
		});
	}, [session, selected, movieId, sendReco, toast, router, t]);
	const handleCancel = useCallback(() => {
		if (canSave) {
			Alert.alert(
				upperFirst(t('common.messages.are_u_sure')),
				upperFirst(t('common.messages.do_you_really_want_to_cancel_change', { count: 2 })),
				[
					{
						text: upperFirst(t('common.messages.continue_editing')),
					},
					{
						text: upperFirst(t('common.messages.ignore')),
						onPress: () => router.dismiss(),
						style: 'destructive',
					},
				], { userInterfaceStyle: mode }
			);
		} else {
			router.back();
		}
	}, [canSave, router, t, mode]);

	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		return {
			marginBottom: withTiming(footerHeight.value, { duration: 200 }),
		};
	});

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.send_to_friend')),
				headerRight: () => (
					<Button
					variant="outline"
					icon={Icons.Reco}
					size="icon"
					onPress={form.handleSubmit(handleSubmit)}
					disabled={isSendingReco || !canSave}
					style={tw`rounded-full`}
					/>
				),
				unstable_headerLeftItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.close')),
						onPress: handleCancel,
						icon: {
							name: "xmark",
							type: "sfSymbol",
						},
					},
				],
				unstable_headerRightItems: (props) => [
					{
						type: "button",
						label: upperFirst(t('common.messages.send')),
						onPress: form.handleSubmit(handleSubmit),
						disabled: isSendingReco || !canSave,
						icon: {
							name: "paperplane.fill",
							type: "sfSymbol",
						},
					},
				],
			}}
		/>
		<View style={[{ paddingHorizontal: PADDING, paddingVertical: PADDING_VERTICAL }]}>
			<SearchBar
			autoCorrect={false}
			autoComplete="off"
			autoCapitalize="none"
			onSearch={setSearch}
			placeholder={upperFirst(t('common.messages.search_user', { count: 1 }))}
			/>
		</View>
		<AnimatedLegendList
		data={resultsRender}
		renderItem={({ item: { item, isSelected } }) => (
			<Pressable onPress={() => handleToggleUser(item.friend)} style={[{ marginHorizontal: PADDING_HORIZONTAL }, tw`flex-row items-center justify-between`]}>
				<CardUser user={item.friend} linked={false} style={tw`border-0 p-0 h-auto bg-transparent`} />
				<View style={tw`flex-row items-center gap-2`}>
					{item.already_sent && (
					<Badge variant="accent-yellow">
						{upperFirst(t('common.messages.already_sent'))}
					</Badge>
					)}
					{item.as_watched && (
					<Badge variant="destructive">
						{upperFirst(t('common.messages.already_watched'))}
					</Badge>
					)}
					<Checkbox
					checked={isSelected}
					onCheckedChange={() => handleToggleUser(item.friend)}
					/>
				</View>
			</Pressable>
		)}
		ListEmptyComponent={
			isSendingReco ? <Icons.Loader />
			: (
				<View style={tw`p-4`}>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			)
		}
		keyExtractor={({ item }) => item.friend.id!.toString()}
		refreshing={isRefetching}
		onRefresh={refetch}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			tw`gap-2`,
			{ paddingBottom: PADDING_VERTICAL },
		]}
		style={animatedFooterStyle}
		keyboardShouldPersistTaps='handled'
		/>
		<SelectionFooter
		data={selected}
		visibleHeight={footerHeight}
		renderItem={({ item }) => (
			<CardUser user={item} variant="icon" linked={false} onPress={() => handleToggleUser(item)} width={50} height={50} />
		)}
		keyExtractor={(item) => item.id!.toString()}
		>
			<Controller
			name="comment"
			control={form.control}
			render={({ field: { onChange, onBlur, value } }) => (
				<Input
				placeholder={upperFirst(t('common.messages.add_comment', { count: 1 }))}
				autoCapitalize="sentences"
				value={value || ''}
				onChangeText={onChange}
				onBlur={onBlur}
				disabled={isSendingReco}
				error={form.formState.errors.comment?.message}
				/>
			)}
			/>
		</SelectionFooter>
	</>
	)
};

export default RecoSendMovie;