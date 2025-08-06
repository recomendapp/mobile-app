import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import WidgetProfileActivities from "@/components/screens/user/WidgetProfileActivities";
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
import WidgetProfilePlaylists from "@/components/screens/user/WidgetProfilePlaylists";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBottomTabOverflow } from "@/components/TabBar/TabBarBackground.ios";

const PADDING_BOTTOM = 8;

const ProfileHeader = ({
	profile,
	loading,
} : {
	profile?: Profile | null;
	loading: boolean;
}) => {
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
				<UserAvatar style={tw`w-24 h-24`} full_name={profile?.full_name} avatar_url={profile?.avatar_url} skeleton={loading} />
				<View style={tw`flex-1 gap-2`}>
					{!loading ? <Text style={tw`font-medium`}>
						{profile?.full_name}
					</Text> : <Skeleton style={tw`w-12 h-5`} />}
					<GridView
					data={[
						{
							label: t('common.messages.follower', { count: 2 }),
							value: profile?.followers_count,
						},
						{
							label: t('common.messages.followee', { count: 2 }),
							value: profile?.following_count,
						},
					]}
					renderItem={(item) => (
						<Pressable style={tw`gap-0.5`}>
							{!loading ? <Text style={tw`font-semibold`}>
								{item.value}
							</Text> : <Skeleton style={tw`w-8 h-5`} />}
							{!loading ? <Text style={[{ color: colors.mutedForeground }, tw.style('text-sm')]}>
								{item.label}
							</Text> : <Skeleton style={tw`w-20 h-5`} />}
						</Pressable>
					)}
					/>
				</View>
			</View>
			<View>
				{profile?.bio && <Text style={tw`text-sm`}>{profile.bio}</Text>}
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
	const tabarHeight = useBottomTabOverflow();
	const { colors, inset } = useTheme();
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
					onPress={() => router.push('/settings/profile')}
					/>
				) : (
					<Button
					variant="ghost"
					size="icon"
					icon={Icons.EllipsisVertical}
					onPress={() => console.log('More options')}
					/>
				)
			}}
		/>
		<ScrollView
		refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} />}
		contentContainerStyle={[
			tw`gap-2`,
			{
				paddingBottom: tabarHeight + inset.bottom + PADDING_BOTTOM,
			}
		]}>
			<ProfileHeader profile={profile} loading={loading} />
			{!loading ? (
				profile?.visible ? (
					<>
					<WidgetProfileActivities profile={profile} labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
					<WidgetProfilePlaylists profile={profile} labelStyle={tw`px-4`} containerStyle={tw`px-4`} />
					</>
				) : <ProfilePrivateAccountCard />
			) : null}
		</ScrollView>
	</>
	)
};

export default ProfileScreen;