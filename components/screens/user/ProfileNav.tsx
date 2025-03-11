import { Link, LinkProps, usePathname } from "expo-router";
import { View } from "react-native";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";

interface NavProfileProps {
	username: string;
}

const NavProfile = ({
	username
} : NavProfileProps) => {
	const { colors } = useTheme();
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
		<View style={[{ backgroundColor: colors.muted }, tw.style('flex-row flex-wrap p-1 rounded-md')]}>
			{routes.map((route, index) => (
				<Link
				key={index}
				href={route.href}
				style={[
					tw.style('flex-1 p-2 rounded-md text-center font-medium'),
					{ color: pathname === route.href ? colors.accentYellow : colors.mutedForeground },
					pathname === route.href && { backgroundColor: colors.background },
				]}
				>
				{route.title}
				</Link>
			))}
		</View>
	)
};

export default NavProfile;