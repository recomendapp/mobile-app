import { Link, LinkProps, usePathname } from "expo-router";
import tw from "@/lib/tw";
import { useTheme } from "@/providers/ThemeProvider";
import Animated from "react-native-reanimated";

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
		<Animated.View style={[{ backgroundColor: colors.muted }, tw.style('flex-row flex-wrap p-1 rounded-md')]}>
			{routes.map((route, index) => (
				<Link
				key={index}
				href={route.href}
				style={[
					tw.style('flex-1 p-2 rounded-md'),
					pathname === route.href && { backgroundColor: colors.background },
				]}
				>
					<Animated.Text
					style={[
						tw.style('text-center font-medium'),
						{ color: pathname === route.href ? colors.accentYellow : colors.mutedForeground },
					]}
					>
						{route.title}
					</Animated.Text>
				</Link>
			))}
		</Animated.View>
	)
};

export default NavProfile;