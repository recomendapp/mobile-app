import * as React from "react";
import { Link, LinkProps, usePathname } from "expo-router";
import Animated from "react-native-reanimated";
import tw from "@/lib/tw";
import { useTheme } from "@/context/ThemeProvider";
import { View, Text } from "react-native";

interface FilmNavProps extends React.ComponentPropsWithRef<Animated.View> {
	slug: string;
}

const FilmNav = React.forwardRef<
	Animated.View,
	FilmNavProps
>(({ style, slug, ...props }, ref) => {
	const { colors } = useTheme();
	const pathname = usePathname();

	const routes: { title: string; href: LinkProps['href'] }[] = [
		{
			title: 'Details',
			href: `/film/${slug}`,
		},
		{
			title: 'Reviews',
			href: `/film/${slug}/reviews`,
		},
		{
			title: 'Playlists',
			href: `/film/${slug}/playlists`,
		}
	]

	return (
		<Animated.View
		ref={ref}
		style={[
			{ backgroundColor: colors.muted },
			tw.style('flex-row flex-wrap p-1 rounded-md'),
			style,
		]}
		{...props}
		>
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
});

export default FilmNav;