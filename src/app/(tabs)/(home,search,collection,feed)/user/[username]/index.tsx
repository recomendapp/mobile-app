import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import UserAvatar from "@/components/user/UserAvatar";
import { Icons } from "@/constants/Icons";
import { userKeys } from "@/features/user/userKeys";
import { useUserActivitiesMovieInfiniteQuery, useUserActivitiesTvSeriesInfiniteQuery, useUserPlaylistsInfiniteQuery, useUserProfileQuery } from "@/features/user/userQueries"
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Profile } from "@recomendapp/types";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalPathString, Link, Stack, useLocalSearchParams, useRouter } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable, RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { View } from "@/components/ui/view";
import ProfileWidgetPlaylists from "@/components/screens/user/ProfileWidgetPlaylists";
import { Skeleton } from "@/components/ui/Skeleton";
import { GAP, PADDING_HORIZONTAL, PADDING_VERTICAL } from "@/theme/globals";
import ProfileWidgetActivitiesMovie from "@/components/screens/user/ProfileWidgetActivitiesMovie";
import ProfileWidgetActivitiesTvSeries from "@/components/screens/user/ProfileWidgetActivitiesTvSeries";
import { ActivityIndicator } from "react-native";
import useBottomSheetStore from "@/stores/useBottomSheetStore";
import BottomSheetUser from "@/components/bottom-sheets/sheets/BottomSheetUser";
import { useCallback, useMemo } from "react";

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
	const { session } = useAuth();
	const { colors, tabBarHeight, bottomOffset } = useTheme();
	const router = useRouter();
	const queryClient = useQueryClient();
	const openSheet = useBottomSheetStore((state) => state.openSheet);

	const {
		data: profile,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useUserProfileQuery({
		username: username,
	});
	const loading = isLoading || profile === undefined;

	// Hooks
	const { data: widgetActivitiesMovie, isLoading: widgetActivitiesMovieLoading } = useUserActivitiesMovieInfiniteQuery({ userId: profile?.id || undefined });
	const { data: widgetActivitiesTvSeries, isLoading: widgetActivitiesTvSeriesLoading } = useUserActivitiesTvSeriesInfiniteQuery({ userId: profile?.id || undefined });
	const { data: widgetPlaylists, isLoading: widgetPlaylistsLoading } = useUserPlaylistsInfiniteQuery({ userId: profile?.id || undefined });
	const areWidgetsLoading = widgetActivitiesMovieLoading || widgetActivitiesTvSeriesLoading || widgetPlaylistsLoading;
	const hasActivity = !areWidgetsLoading && (widgetActivitiesMovie?.pages.flat().length || widgetActivitiesTvSeries?.pages.flat().length || widgetPlaylists?.pages.flat().length);

	const refresh = () => {
		refetch();
		profile?.id && queryClient.invalidateQueries({
			queryKey: userKeys.detail(profile?.id)
		});
	};

	// Render
	const renderContent = useCallback(() => {
		if (loading) return null;

        if (!profile?.visible) {
            return <ProfilePrivateAccountCard />;
        }

        if (areWidgetsLoading) {
            return <ActivityIndicator />;
        }

        if (!hasActivity) {
            return (
                <View style={tw`items-center justify-center p-8 gap-2`}>
                    <Text style={[{ color: colors.mutedForeground }]}>
                        {upperFirst(t('common.messages.this_user_has_no_activity'))}
                    </Text>
                </View>
            );
        }

		return (
		<>
		<ProfileWidgetActivitiesMovie profile={profile} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
		<ProfileWidgetActivitiesTvSeries profile={profile} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
		<ProfileWidgetPlaylists profile={profile} labelStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} containerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }} />
		</>
		)
	}, [loading, profile, areWidgetsLoading, hasActivity, colors.mutedForeground, t]);

	return (
	<>
		<Stack.Screen
			options={useMemo(() => ({
				title: profile ? `@${profile.username}` : '',
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
					{profile?.id === session?.user.id && (
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
				)
			}), [profile, colors.accentBlue, session?.user.id, router, openSheet])}
		/>
		<ScrollView
		refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} />}
		contentContainerStyle={{
			gap: GAP,
			paddingBottom: bottomOffset + PADDING_VERTICAL,
		}}
		scrollIndicatorInsets={{
			bottom: tabBarHeight,
		}}
		>
			<ProfileHeader profile={profile} skeleton={loading} />
			{renderContent()}
		</ScrollView>
	</>
	)
};

export default ProfileScreen;