import { ThemedText } from "@/components/ui/ThemedText"
import { useUserProfileQuery } from "@/features/user/userQueries"
import { ExternalPathString, Link, Slot, useLocalSearchParams } from "expo-router"
import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import { Button, buttonTextVariants } from "@/components/ui/Button";
import UserAvatar from "@/components/user/UserAvatar";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/context/AuthProvider";
import { Pressable, View, Text, ActivityIndicator, ScrollView } from "react-native";
import ProfileNav from "@/components/screens/user/ProfileNav";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash";
// import * as SeparatorPrimitive from '@rn-primitives/separator';
import { Skeleton } from "@/components/ui/Skeleton";
import { RefreshControl } from "react-native-gesture-handler";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import { useBottomTabOverflow } from "@/components/TabBarBackground";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";

const ProfileLayout = () => {
	const { colors } = useTheme();
	const tabBarHeight = useBottomTabOverflow();
	const { t } = useTranslation();
	const { username } = useLocalSearchParams();
	const queryClient = useQueryClient();
	const {
		data: profile,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useUserProfileQuery({
		username: username as string,
	});

	const loading = isLoading || profile === undefined;

	const refresh = () => {
		refetch();
		profile?.id && queryClient.invalidateQueries({
			queryKey: userKeys.detail(profile?.id)
		});
	};

	return (
		<ThemedSafeAreaView style={tw.style("flex-1")}>
			{(loading || profile) ? (
				<ScrollView
				contentContainerStyle={tw.style(`flex-1 gap-4 p-2 pb-[${tabBarHeight}px]`)}
				refreshControl={
					<RefreshControl
					  refreshing={isRefetching}
					  onRefresh={refresh}
					/>
				}
				nestedScrollEnabled
				>
					<ProfileHeader />
					{!loading ? (
						profile?.visible ? (
							<>
							<ProfileNav username={username as string} />
							<Slot />
							</>
						) : (
							<>
							{/* <SeparatorPrimitive.Root className="bg-muted h-0.5 rounded-full"/> */}
							<ProfilePrivateAccountCard />
							</>
						)
					) : null}
				</ScrollView>
			) : (
				<ScrollView
				contentContainerStyle={tw.style("flex-1 justify-center items-center")}
				refreshControl={
					<RefreshControl
					  refreshing={isRefetching}
					  onRefresh={refresh}
					/>
				}
				>
					<Icons.user color={colors.foreground} size={50} />
					<ThemedText>{upperFirst(t('common.errors.user_not_found'))}</ThemedText>
				</ScrollView>
			)}
		</ThemedSafeAreaView>
	)
};


const ProfileHeader = () => {
	const { colors } = useTheme();
	const { user } = useAuth();
	const { username } = useLocalSearchParams();
	const {
		data: profile,
		isLoading,
		isError,
	} = useUserProfileQuery({
		username: username as string,
	});

	const loading = isLoading || profile === undefined;

	return (
		<View style={tw.style('gap-2')}>
			<View style={tw.style('flex-row gap-4 shrink-0 items-start justify-between')}>
				<UserAvatar style={tw.style('w-32 h-32')} full_name={profile?.full_name} avatar_url={profile?.avatar_url} skeleton={loading} />
				<View style={tw.style('flex gap-4 items-end')}>
					<View style={tw.style('flex-row items-center gap-2')}>
						{!loading ? <Button variant={'action'}><Text className={buttonTextVariants({variant: 'action'})}>followers</Text></Button> : <Skeleton style={tw.style('w-20 h-8')}/>}
						{!loading ? <Button variant={'action'}><Text className={buttonTextVariants({variant: 'action'})}>following</Text></Button> : <Skeleton style={tw.style('w-20 h-8')}/>}
						{user?.id == profile?.id && (
							<Link href="/settings/profile" asChild>
								<Button variant={'action'}>
									<Icons.settings color={colors.foreground}/>
								</Button>
							</Link>
						)}
					</View>
					<ButtonUserFollow profileId={profile?.id} skeleton={loading} />
				</View>
			</View>
			<View style={tw.style('gap-2')}>
				{!loading ?<View style={tw.style('flex-row items-center gap-2')}>
					 <ThemedText style={tw.style('text-xl font-semibold')}>
						{profile?.full_name}
						{/* {profile?.premium && (
							<Icons.premium style={tw.style('ml-1')}/>
						)} */}
					</ThemedText>
					<ThemedText style={[{ color: colors.mutedForeground }, tw.style('text-xl')]}>@{profile?.username}</ThemedText>
				</View> : <Skeleton style={tw.style('w-32 h-8')}/>}
				{profile?.bio ? <ThemedText>{profile.bio}</ThemedText> : null}
				{profile?.website ?
					<Link href={profile.website as ExternalPathString} target="_blank" asChild>
						<Pressable style={tw.style('flex-row gap-2 items-center')}>
							<Icons.link color={colors.foreground} width={15}/>
							<ThemedText>{profile.website.replace(/(^\w+:|^)\/\//, '')}</ThemedText>
						</Pressable>
					</Link>
				: null}
			</View>
		</View>
	)
};

const ProfilePrivateAccountCard = () => {
	const { colors } = useTheme();
	const { t } = useTranslation();
	return (
	<View style={tw.style('flex gap-4 justify-center items-center px-4 py-8 border-y-2')}>
		<Icons.lock color={colors.foreground} />
		<View>
			<ThemedText >{upperFirst(t('common.messages.this_account_is_private'))}</ThemedText>
			<ThemedText style={[{ color: colors.mutedForeground }]}>{upperFirst(t('common.messages.follow_to_see_activities'))}</ThemedText>
		</View>
	</View>
	);
};


export default ProfileLayout;