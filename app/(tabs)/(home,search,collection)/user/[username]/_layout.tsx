import { ThemedText } from "@/components/ui/ThemedText"
import { useUserProfileQuery } from "@/features/user/userQueries"
import { ExternalPathString, Link, Slot, useLocalSearchParams } from "expo-router"
import ButtonUserFollow from "@/components/buttons/ButtonUserFollow";
import { Button, buttonTextVariants } from "@/components/ui/button";
import UserAvatar from "@/components/user/UserAvatar";
import { Icons } from "@/constants/Icons";
import { useAuth } from "@/context/AuthProvider";
import { Pressable, View, Text } from "react-native";
import NavProfile from "@/components/nav/NavProfile";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";

const ProfileLayout = () => {
	const { username } = useLocalSearchParams();
	return (
		<ThemedSafeAreaView className="flex-1">
			<View className="flex-1 gap-4 p-2">
				<ProfileHeader />
				<NavProfile username={username as string} />
				<Slot />
			</View>
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

	return (
		<View className="gap-2">
			<View className="flex-row  gap-4 shrink-0 items-start justify-between">
				<UserAvatar className="w-32 h-32" full_name={profile?.full_name} avatar_url={profile?.avatar_url} skeleton={isLoading || profile === undefined} />
				<View className="flex gap-4 items-end">
					<View className="flex-row items-center gap-2 ">
						<Button variant={'action'}><Text className={buttonTextVariants({variant: 'action'})}>followers</Text></Button>
						<Button variant={'action'}><Text className={buttonTextVariants({variant: 'action'})}>following</Text></Button>
						{user?.id == profile?.id && (
							<Link href="/settings/profile" asChild>
								<Button variant={'action'}>
									<Icons.settings className="text-foreground"/>
								</Button>
							</Link>
						)}
					</View>
					<ButtonUserFollow profileId={profile?.id} />
				</View>
			</View>
			<View className="gap-2">
				<View className="flex-row items-center gap-2">
					<ThemedText className="text-xl font-semibold">
						{profile?.full_name}
						{/* {profile?.premium && (
							<Icons.premium className='ml-1 '/>
						)} */}
					</ThemedText>
					<ThemedText className="text-xl text-muted-foreground">@{profile?.username}</ThemedText>
				</View>
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


export default ProfileLayout;