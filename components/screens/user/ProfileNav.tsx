import { Link, LinkProps, usePathname } from "expo-router";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface NavProfileProps {
	username: string;
}

const NavProfile = ({
	username
} : NavProfileProps) => {
	const pathname = usePathname();

	const routes: { title: string; href: LinkProps['href'] }[] = [
		{
			title: 'Profile',
			href: `/user/${username}`,
		},
		{
			title: 'Collection',
			href: `/user/${username}/collection`,
		},
		{
			title: 'Playlists',
			href: `/user/${username}/playlists`,
		}
	]

	return (
		<View className={`flex-row flex-wrap bg-muted p-1 rounded-md`}>
			{routes.map((route, index) => (
				<Link key={index} href={route.href} className={cn("flex-1 p-2 rounded-md", pathname === route.href ? 'bg-background' : '')}>
					<Text className={cn("text-center font-medium", pathname === route.href ? 'text-accent-yellow' : 'text-muted-foreground')}>{route.title}</Text>
				</Link>
			))}
		</View>
	)
};

export default NavProfile;