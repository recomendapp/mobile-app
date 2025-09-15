import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useAuth } from "@/providers/AuthProvider";
import { User } from "@recomendapp/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollViewProps } from "react-native";
import { useTranslations } from "use-intl";
import { z } from "zod";
import * as Burnt from "burnt";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import tw from "@/lib/tw";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SearchBar } from "@/components/ui/searchbar";
import { PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { useUserRecosTvSeriesSendQuery } from "@/features/user/userQueries";
import { useTheme } from "@/providers/ThemeProvider";
import AnimatedContentContainer from "@/components/ui/AnimatedContentContainer";
import Fuse from "fuse.js";
import { Icons } from "@/constants/Icons";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useUserRecosTvSeriesInsertMutation } from "@/features/user/userMutations";
import { CardUser } from "@/components/cards/CardUser";
import { Checkbox } from "@/components/ui/checkbox";

const COMMENT_MAX_LENGTH = 180;

const RecoSendTvSeries = () => {
	const t = useTranslations();
	const router = useRouter();
	const { colors, inset } = useTheme();
	const { session } = useAuth();
	const { tv_series_id, tv_series_name } = useLocalSearchParams();
	const tvSeriesId = Number(tv_series_id);
	const tvSeriesName = tv_series_name;

	// Form
	const sendRecoTvSeriesFormSchema = z.object({
		comment: z.string()
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/)
			.optional()
			.nullable(),
	});
	type SendRecoTvSeriesFormValues = z.infer<typeof sendRecoTvSeriesFormSchema>;
	const defaultValues: Partial<SendRecoTvSeriesFormValues> = {
		comment: '',
	};
	const form = useForm<SendRecoTvSeriesFormValues>({
		resolver: zodResolver(sendRecoTvSeriesFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Mutations
	const sendReco = useUserRecosTvSeriesInsertMutation();

	// SharedValues
	const footerHeight = useSharedValue(0);

	// States
	const [search, setSearch] = useState('');
	const [results, setResults] = useState<typeof friends>([]);
	const [selected, setSelected] = useState<User[]>([]);
	const canSave = useMemo(() => {
		return selected.length > 0 && form.formState.isValid;
	}, [selected, form.formState.isValid]);

	// Queries
	const {
		data: friends,
		isRefetching,
		refetch,
	} = useUserRecosTvSeriesSendQuery({
		userId: session?.user?.id,
		tvSeriesId: tvSeriesId,
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
	const handleToggleUser = useCallback((user: User) => {
		setSelected((prev) => {
			const isSelected = prev.some((p) => p.id === user.id);
			if (isSelected) {
				return prev.filter((p) => p.id !== user.id);
			}
			return [...prev, user];
		});
	}, []);
	const handleSubmit = async (values: SendRecoTvSeriesFormValues) => {
		if (!session?.user.id) return;
		if (selected.length === 0) return;
		await sendReco.mutateAsync({
			senderId: session.user.id,
			tvSeriesId: tvSeriesId,
			receivers: selected,
			comment: values.comment?.trim() || undefined,
		}, {
			onSuccess: () => {
				Burnt.toast({
					title: upperFirst(t('common.messages.sent', { count: selected.length, gender: 'female' })),
					preset: 'done',
				});
				router.dismiss();
			},
			onError: (error) => {
				Burnt.toast({
					title: upperFirst(t('common.messages.error')),
					message: upperFirst(t('common.messages.an_error_occurred')),
					preset: 'error',
					haptic: 'error',
				});
			}
		});
	};
	const handleCancel = () => {
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
				]
			);
		} else {
			router.dismiss();
		}
	};

	// Render
	const renderItems = useCallback(({ item: { item, isSelected} }: { item: { item: { friend: User, as_watched: boolean, already_sent: boolean }, isSelected: boolean }}) => {
		return (
			<CardUser user={item.friend} linked={false} style={[{ marginHorizontal: PADDING_HORIZONTAL }]} onPress={() => handleToggleUser(item.friend)}>
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
			</CardUser>
		)
	}, [handleToggleUser]);
	const renderScroll = useCallback((props: ScrollViewProps) => {
        return <AnimatedContentContainer {...props} />;
    }, []);

	// AnimatedStyles
	const animatedFooterStyle = useAnimatedStyle(() => {
		const paddingBottom =  PADDING_VERTICAL + (selected.length > 0 ? footerHeight.value : inset.bottom);
		return {
			paddingBottom: withTiming(paddingBottom, { duration: 200 }),
		};
	});

	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.send_to_friend')),
				headerLeft: router.canDismiss() ? () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={sendReco.isPending}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				) : undefined,
				headerStyle: {
					backgroundColor: colors.muted,
				},
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
		data={results?.map((item) => ({
			item: item,
			isSelected: selected.some((selectedItem) => selectedItem.id === item.friend.id),
		})) || []}
		renderItem={renderItems}
		ListEmptyComponent={
			sendReco.isPending ? <Icons.Loader />
			: (
				<View style={tw`p-4`}>
					<Text textColor="muted" style={tw`text-center`}>
						{upperFirst(t('common.messages.no_results'))}
					</Text>
				</View>
			)
		}
		keyExtractor={({ item }) => item.friend.id.toString()}
		refreshing={isRefetching}
		onRefresh={refetch}
		onEndReachedThreshold={0.5}
		contentContainerStyle={[
			tw`gap-2`,
			animatedFooterStyle
		]}
		renderScrollComponent={renderScroll}
		/>
		<SelectionFooter
		data={selected}
		height={footerHeight}
		renderItem={({ item }) => (
			<CardUser user={item} variant="icon" linked={false} onPress={() => handleToggleUser(item)} width={50} height={50} />
		)}
		keyExtractor={(item) => item.id.toString()}
		>
			<Controller
			name="comment"
			control={form.control}
			render={({ field: { onChange, onBlur, value } }) => (
			<>
				<Input
				icon={Icons.Comment}
				placeholder={upperFirst(t('common.messages.add_comment', { count: 1 }))}
				autoCapitalize="sentences"
				value={value || ''}
				onChangeText={onChange}
				onBlur={onBlur}
				disabled={sendReco.isPending}
				error={form.formState.errors.comment?.message}
				/>
				<Button
				variant="accent-yellow"
				onPress={form.handleSubmit(handleSubmit)}
				disabled={sendReco.isPending}
				>
					{upperFirst(t('common.messages.add'))}
				</Button>
			</>
			)}
			/>
		</SelectionFooter>
	</>
	)
};

export default RecoSendTvSeries;