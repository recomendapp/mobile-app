import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useAuth } from "@/providers/AuthProvider";
import { Playlist, User } from "@/types/type.db";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollViewProps } from "react-native";
import { useTranslations } from "use-intl";
import { z } from "zod";
import * as Burnt from "burnt";
import { SelectionFooter } from "@/components/ui/SelectionFooter";
import { Pressable } from "react-native-gesture-handler";
import { ImageWithFallback } from "@/components/utils/ImageWithFallback";
import tw from "@/lib/tw";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SearchBar } from "@/components/ui/searchbar";
import { PADDING, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { useUserRecosSendQuery } from "@/features/user/userQueries";
import { useTheme } from "@/providers/ThemeProvider";
import AnimatedContentContainer from "@/components/ui/AnimatedContentContainer";
import Fuse from "fuse.js";
import { Icons } from "@/constants/Icons";
import { Badge } from "@/components/ui/Badge";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { useUserRecosInsertMutation } from "@/features/user/userMutations";
import { CardUser } from "@/components/cards/CardUser";
import { Checkbox } from "@/components/ui/checkbox";

const COMMENT_MAX_LENGTH = 180;

const MediaRecoSend = () => {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { colors, inset } = useTheme();
	const { session } = useAuth();
	const { media_id, media_title } = useLocalSearchParams();
	const mediaId = Number(media_id);
	const mediaTitle = media_title;

	// Form
	const sendRecoFormSchema = z.object({
		comment: z.string()
			.max(COMMENT_MAX_LENGTH, { message: upperFirst(t('common.form.length.char_max', { count: COMMENT_MAX_LENGTH }))})
			.regex(/^(?!\s+$)(?!.*\n\s*\n)[\s\S]*$/)
			.optional()
			.nullable(),
	});
	type SendRecoFormValues = z.infer<typeof sendRecoFormSchema>;
	const defaultValues: Partial<SendRecoFormValues> = {
		comment: '',
	};
	const form = useForm<SendRecoFormValues>({
		resolver: zodResolver(sendRecoFormSchema),
		defaultValues,
		mode: 'onChange',
	});

	// Mutations
	const sendReco = useUserRecosInsertMutation();

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
	} = useUserRecosSendQuery({
		userId: session?.user?.id,
		mediaId: mediaId!,
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
	const handleSubmit = async (values: SendRecoFormValues) => {
		try {
			if (selected.length === 0) return;
			await sendReco.mutateAsync({
				senderId: session?.user.id!,
				mediaId: mediaId,
				receivers: selected,
				comment: values.comment?.trim() || undefined,
			}, {
				onError: (error) => {
					throw error;
				}
			})
			Burnt.toast({
				title: upperFirst(t('common.messages.sent', { count: selected.length, gender: 'female' })),
				preset: 'done',
			});
			router.dismiss();
		} catch (error) {
			let errorMessage: string = upperFirst(t('common.messages.an_error_occurred'));
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (typeof error === 'string') {
				errorMessage = error;
			}
			Burnt.toast({
				title: errorMessage,
				preset: 'error',
				haptic: 'error',
			});
		}
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

export default MediaRecoSend;