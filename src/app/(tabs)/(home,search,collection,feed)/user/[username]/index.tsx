import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import UserAvatar from "@/components/user/UserAvatar";
import { Icons } from "@/constants/Icons";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Profile } from "@recomendapp/types";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalPathString, Link, Stack, useLocalSearchParams, useRouter } from "expo-router"
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { HeaderTitle, useHeaderHeight } from "@react-navigation/elements";
import { View } from "@/components/ui/view";
import ProfileWidgetPlaylists from "@/components/screens/user/ProfileWidgetPlaylists";
import { Skeleton } from "@/components/ui/Skeleton";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import ProfileWidgetActivitiesMovie from "@/components/screens/user/ProfileWidgetActivitiesMovie";
import ProfileWidgetActivitiesTvSeries from "@/components/screens/user/ProfileWidgetActivitiesTvSeries";
import { ActivityIndicator, Pressable, RefreshControl } from "react-native";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetUser from "@/components/bottom-sheets/sheets/BottomSheetUser";
import { useCallback, useMemo } from "react";
import Animated from "react-native-reanimated";
import { authKeys } from "@/api/auth/authKeys";
import { useUserActivitiesMovieQuery, useUserActivitiesTvSeriesQuery, useUserPlaylistsQuery, useUserProfileQuery } from "@/api/users/userQueries";

const ProfileHeader = ({
	profile,
	skeleton,
} : {
	profile?: Profile | null;
	skeleton: boolean;
}) => {
	const router = useRouter();
	const { user } = useAuth();
	const { colors } = useTheme();
	const t = useTranslations();
	const routesFollow = useMemo(() => ([
		{
			label: t('common.messages.follower', { count: 2}),
			onPress: () => router.push(`/user/${profile?.username}/followers`),
		},
		{
			label: t('common.messages.followee', { count: 2 }),
			onPress: () => router.push(`/user/${profile?.username}/followees`),
		},
	]), [profile?.username, router, t]);
	return (
		<View
		style={[
			{ borderColor: colors.border },
			tw`gap-2 p-4 border-b`,

		]}
		>
			<View style={tw`flex-row gap-4 shrink-0 items-start justify-between`}>
				{!skeleton ? <UserAvatar style={tw`w-24 h-24`} full_name={profile?.full_name!} avatar_url={profile?.avatar_url} /> : <UserAvatar skeleton style={tw`w-24 h-24`} />}
				<View style={tw`flex-1 gap-2`}>
					<View style={tw`flex-row items-center justify-between gap-4`}>
						{!skeleton ? <Text style={tw`font-semibold`} numberOfLines={3}>
							{profile?.full_name}
						</Text> : <Skeleton style={tw`w-12 h-5`} />}
						<View style={tw`flex-row items-center gap-4`}>
							{routesFollow.map((item, index) => (
								<Pressable key={index} style={tw`gap-0.5`} onPress={item.onPress}>
									{!skeleton ? <Text style={tw`text-sm`}>
										{item.label}
									</Text> : <Skeleton style={tw`w-20 h-5`} />}
								</Pressable>
							))}
						</View>
					</View>
					<View>
						{profile?.bio && <Text style={tw`text-sm`} numberOfLines={3}>{profile.bio}</Text>}
						{profile?.website && (
							<Link href={profile.website as ExternalPathString} target="_blank" asChild>
								<Pressable style={tw.style('flex-row gap-2 items-center')}>
									<Icons.link color={colors.accentPink} width={15}/>
									<Text numberOfLines={1} style={[{ color: colors.accentPink}, tw`m-w-1/2`]}>{profile.website.replace(/(^\w+:|^)\/\//, '')}</Text>
								</Pressable>
							</Link>
						)}
					</View>
				</View>
			</View>
			{/* ACTION BUTTON */}
			{profile?.id && profile.id !== user?.id && (
				!skeleton ? <ButtonUserFollow profileId={profile.id} /> : <ButtonUserFollow skeleton />
			)}
		</View>
	)
};

const ProfilePrivateAccountCard = () => {
	const { colors } = useTheme();
	const t = useTranslations();
	return (
	<View style={tw.style('flex gap-2 justify-center items-center px-4 py-8 border-y-2')}>
		<Icons.Lock color={colors.foreground} />
		<View style={tw.style('items-center')}>
			<Text>{upperFirst(t('common.messages.this_account_is_private'))}</Text>
			<Text style={[{ color: colors.mutedForeground }]}>{upperFirst(t('common.messages.follow_to_see_activities'))}</Text>
		</View>
	</View>
	);
};

const ProfileScreen = () => {
	const t = useTranslations();
	const { username } = useLocalSearchParams<{ username: string }>();
	const { session, user } = useAuth();
	const { colors, bottomOffset, tabBarHeight, isLiquidGlassAvailable } = useTheme();
	const navigationHeaderHeight = useHeaderHeight();
	const router = useRouter();
	const queryClient = useQueryClient();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const {
		data: profile,
		isLoading,
		isRefetching,
		refetch,
	} = useUserProfileQuery({
		username: username,
	});
	const loading = isLoading || profile === undefined;

	// Hooks
	const { data: widgetActivitiesMovie, isLoading: widgetActivitiesMovieLoading } = useUserActivitiesMovieQuery({ userId: profile?.id, filters: { sortBy: 'watched_date', sortOrder: 'desc' } });
	const { data: widgetActivitiesTvSeries, isLoading: widgetActivitiesTvSeriesLoading } = useUserActivitiesTvSeriesQuery({ userId: profile?.id, filters: { sortBy: 'watched_date', sortOrder: 'desc' } });
	const { data: widgetPlaylists, isLoading: widgetPlaylistsLoading } = useUserPlaylistsQuery({ userId: profile?.id, filters: { sortBy: 'updated_at', sortOrder: 'desc' } });
	const areWidgetsLoading = widgetActivitiesMovieLoading || widgetActivitiesTvSeriesLoading || widgetPlaylistsLoading;
	const hasActivity = !areWidgetsLoading && (widgetActivitiesMovie?.pages.flat().length || widgetActivitiesTvSeries?.pages.flat().length || widgetPlaylists?.pages.flat().length);

	const refresh = useCallback(() => {
		refetch();
		profile?.id === session?.user.id && queryClient.invalidateQueries({
			queryKey: authKeys.user()
		});
	}, [refetch, profile?.id, session?.user.id, queryClient]);

	return (
	<>
		<Stack.Screen
		options={{
			title: profile ? `@${profile.username}` : '',
			headerTransparent: true,
			...(isLiquidGlassAvailable ? {
				headerStyle: { backgroundColor: 'transparent' },
			} : {}),
			headerTitle: (props) => (
				<View style={tw`flex-row items-center gap-1`}>
						<HeaderTitle {...props}>
						{profile ? `@${profile.username}` : ''}
						</HeaderTitle>
						{profile?.premium && <Icons.premium color={colors.accentBlue} size={14} />}
				</View>
			),
			headerTitleAlign: 'center',
			headerRight: () => (
			<>
				{(
					profile?.id === session?.user.id
					|| user?.username === username
				) && (
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.settings}
					onPress={() => router.push('/settings')}
					/>
				)}
				<Button
				variant="ghost"
				size="icon"
				icon={Icons.EllipsisVertical}
				onPress={() => openSheet(BottomSheetUser, {
					user: profile!
				})}
				/>
			</>
			),
			unstable_headerRightItems: (props) => [
				...(profile?.id === session?.user.id ? [
					{
						type: "button",
						label: upperFirst(t('common.messages.setting', { count: 2 })),
						onPress: () => router.push('/settings'),
						tintColor: props.tintColor,
						icon: {
							name: "gearshape",
							type: "sfSymbol",
						},
						visible: profile?.id === session?.user.id,
					}
				] as const : []),
				{
					type: "button",
					label: upperFirst(t('common.messages.menu')),
					onPress: () => openSheet(BottomSheetUser, {
						user: profile!
					}),
					tintColor: props.tintColor,
					icon: {
						name: "ellipsis",
						type: "sfSymbol",
					},
				},
			],
		}}
		/>
		<Animated.ScrollView
		refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} />}
		contentContainerStyle={{
			gap: GAP,
			paddingTop: navigationHeaderHeight,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		>
			<ProfileHeader profile={profile} skeleton={loading} />
			{
				loading ? null
				: !profile?.visible ? <ProfilePrivateAccountCard />
				: areWidgetsLoading ? <ActivityIndicator />
				: !hasActivity ? (
					<View style={tw`items-center justify-center p-8 gap-2`}>
						<Text style={[{ color: colors.mutedForeground }]}>
							{upperFirst(t('common.messages.this_user_has_no_activity'))}
						</Text>
					</View>
				) : (
					<>
					<ProfileWidgetActivitiesMovie profile={profile} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
					<ProfileWidgetActivitiesTvSeries profile={profile} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
					<ProfileWidgetPlaylists profile={profile} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
					</>
				)
			}
		</Animated.ScrollView>
	</>
	)
};

export default ProfileScreen;