import * as React from "react";
import { Link, LinkProps, usePathname } from "expo-router";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import Animated from "react-native-reanimated";

interface FilmNavProps extends React.ComponentPropsWithRef<Animated.View> {
	slug: string;
}

const FilmNav = React.forwardRef<
	Animated.View,
	FilmNavProps
>(({ slug, ...props }, ref) => {
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
		<Animated.View ref={ref} className={`flex-row flex-wrap bg-muted p-1 rounded-md`} {...props}>
			{routes.map((route, index) => (
				<Link key={index} href={route.href} className={cn("flex-1 p-2 rounded-md", pathname === route.href ? 'bg-background' : '')}>
					<Text className={cn("text-center font-medium", pathname === route.href ? 'text-accent-yellow' : 'text-muted-foreground')}>{route.title}</Text>
				</Link>
			))}
		</Animated.View>
	)
});

export default FilmNav;