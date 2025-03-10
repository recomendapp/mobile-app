import { ThemedText } from "@/components/ui/ThemedText"
import { useUserProfileQuery } from "@/features/user/userQueries"
import { ExternalPathString, Link, Slot, useLocalSearchParams } from "expo-router"
import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import { Button, buttonTextVariants } from "@/components/ui/button";
import UserAvatar from "@/components/user/UserAvatar";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/context/AuthProvider";
import { Pressable, View, Text, ActivityIndicator, ScrollView } from "react-native";
import ProfileNav from "@/components/screens/user/ProfileNav";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash";
import * as SeparatorPrimitive from '@rn-primitives/separator';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshControl } from "react-native-gesture-handler";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/features/user/userKeys";
import { useBottomTabOverflow } from "@/components/TabBarBackground";

const ProfileLayout = () => {
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
		<ThemedSafeAreaView className="flex-1">
			{(loading || profile) ? (
				<ScrollView
				contentContainerClassName={`flex-1 gap-4 p-2 pb-[${tabBarHeight}px]`}
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
							<SeparatorPrimitive.Root className="bg-muted h-0.5 rounded-full"/>
							<ProfilePrivateAccountCard />
							</>
						)
					) : null}
				</ScrollView>
			) : (
				<ScrollView
				contentContainerClassName="flex-1 justify-center items-center"
				refreshControl={
					<RefreshControl
					  refreshing={isRefetching}
					  onRefresh={refresh}
					/>
				}
				>
					<Icons.user className="text-foreground" size={50} />
					<ThemedText>{upperFirst(t('common.errors.user_not_found'))}</ThemedText>
				</ScrollView>
			)}
		</ThemedSafeAreaView>
	)
};


const ProfileHeader = () => {
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
		<View className="gap-2">
			<View className="flex-row  gap-4 shrink-0 items-start justify-between">
				<UserAvatar className="w-32 h-32" full_name={profile?.full_name} avatar_url={profile?.avatar_url} skeleton={loading} />
				<View className="flex gap-4 items-end">
					<View className="flex-row items-center gap-2 ">
						{!loading ? <Button variant={'action'}><Text className={buttonTextVariants({variant: 'action'})}>followers</Text></Button> : <Skeleton className={'w-20 h-8'}/>}
						{!loading ? <Button variant={'action'}><Text className={buttonTextVariants({variant: 'action'})}>following</Text></Button> : <Skeleton className={'w-20 h-8'}/>}
						{user?.id == profile?.id && (
							<Link href="/settings/profile" asChild>
								<Button variant={'action'}>
									<Icons.settings className="text-foreground"/>
								</Button>
							</Link>
						)}
					</View>
					<ButtonUserFollow profileId={profile?.id} skeleton={loading} />
				</View>
			</View>
			<View className="gap-2">
				{!loading ?<View className="flex-row items-center gap-2">
					 <ThemedText className="text-xl font-semibold">
						{profile?.full_name}
						{/* {profile?.premium && (
							<Icons.premium className='ml-1 '/>
						)} */}
					</ThemedText>
					<ThemedText className="text-xl text-muted-foreground">@{profile?.username}</ThemedText>
				</View> : <Skeleton className={'w-32 h-8'}/>}
				{profile?.bio ? <ThemedText>{profile.bio}</ThemedText> : null}
				{profile?.website ?
					<Link href={profile.website as ExternalPathString} target="_blank" asChild>
						<Pressable className="flex-row gap-2 items-center">
							<Icons.link width={15} className="text-foreground"/>
							<ThemedText>{profile.website.replace(/(^\w+:|^)\/\//, '')}</ThemedText>
						</Pressable>
					</Link>
				: null}
			</View>
		</View>
	)
};

const ProfilePrivateAccountCard = () => {
	const { t } = useTranslation();
	return (
	<View className='flex gap-4 justify-center items-center px-4 py-8 border-y-2'>
		<Icons.lock className="text-foreground" />
		<View>
			<ThemedText className="text-center">{upperFirst(t('common.messages.this_account_is_private'))}</ThemedText>
			<ThemedText className='text-center text-muted-foreground'>{upperFirst(t('common.messages.follow_to_see_activities'))}</ThemedText>
		</View>
	</View>
	);
};


export default ProfileLayout;