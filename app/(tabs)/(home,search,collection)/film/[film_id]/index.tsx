import { ThemedText } from "@/components/ui/ThemedText";
import { useMediaMovieDetailsQuery } from "@/features/media/mediaQueries";
import { useUserProfileQuery } from "@/features/user/userQueries"
import { getIdFromSlug } from "@/hooks/getIdFromSlug";
import { useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

const ProfileScreen = () => {
	const { i18n, t } = useTranslation();
	const { film_id } = useLocalSearchParams();
	const { id: movieId} = getIdFromSlug(film_id as string);
	const {
		data: movie,
		isLoading,
		isError,
		isRefetching,
		refetch,
	} = useMediaMovieDetailsQuery({
		id: movieId,
		locale: i18n.language,
	});

	if (!movie) {
		return (
			<ActivityIndicator />
		)
	}

	return (
	<>
		<ThemedText>Film page : {movie.title}</ThemedText>
		<View className="h-[1000px]"/>
	</>
	)
};

export default ProfileScreen;