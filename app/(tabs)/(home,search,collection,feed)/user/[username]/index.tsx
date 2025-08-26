import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/text";
import UserAvatar from "@/components/user/UserAvatar";
import { Icons } from "@/constants/Icons";
import { userKeys } from "@/features/user/userKeys";
import { useUserProfileQuery } from "@/features/user/userQueries"
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Profile } from "@/types/type.db";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalPathString, Link, Stack, useLocalSearchParams, useRouter } from "expo-router"
import { upperFirst } from "lodash";
import { Pressable, RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useTranslations } from "use-intl";
import { HeaderTitle } from "@react-navigation/elements";
import { View } from "@/components/ui/view";
import { GridView } from "@/components/ui/GridView";
import ProfileWidgetPlaylists from "@/components/screens/user/ProfileWidgetPlaylists";
import { Skeleton } from "@/components/ui/Skeleton";
import { PADDING_VERTICAL } from "@/theme/globals";
import ProfileWidgetActivitiesMovie from "@/components/screens/user/ProfileWidgetActivitiesMovie";
import ProfileWidgetActivitiesTvSeries from "@/components/screens/user/ProfileWidgetActivitiesTvSeries";

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
							{[
								{
									label: t('common.messages.follower', { count: 2 }),
									onPress: () => router.push(`/user/${profile?.username}/followers`),
								},
								{
									label: t('common.messages.followee', { count: 2 }),
									onPress: () => router.push(`/user/${profile?.username}/followees`),
								},
							].map((item, index) => (
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
	const { username } = useLocalSearchParams<{ username: string }>();
	const { session } = useAuth();
	const { colors, bottomTabHeight } = useTheme();
	const router = useRouter();
	const queryClient = useQueryClient();

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

	const refresh = () => {
		refetch();
		profile?.id && queryClient.invalidateQueries({
			queryKey: userKeys.detail(profile?.id)
		});
	};

	return (
	<>
		<Stack.Screen
			options={{
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
				headerRight: () => profile?.id === session?.user.id ? (
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.settings}
					onPress={() => router.push('/settings')}
					/>
				) : (
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={() => console.log('open sheet user')}
					/>
				)
			}}
		/>
		<ScrollView
		refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} />}
		contentContainerStyle={[
			tw`gap-2`,
			{
				paddingBottom: bottomTabHeight + PADDING_VERTICAL,
			}
		]}>
			<ProfileHeader profile={profile} skeleton={loading} />
			{!loading ? (
				profile?.visible ? (
					<>
					<ProfileWidgetActivitiesMovie profile={profile} labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
					<ProfileWidgetActivitiesTvSeries profile={profile} labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
					{/* <ProfileWidgetActivities profile={profile} labelStyle={tw`px-4`} containerStyle={tw`px-4`} /> */}
					<ProfileWidgetPlaylists profile={profile} labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
					</>
				) : <ProfilePrivateAccountCard />
			) : null}
		</ScrollView>
	</>
	)
};

export default ProfileScreen;