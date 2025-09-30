import BottomSheetShareLayout from "@/components/bottom-sheets/sheets/share/v2/BottomSheetShareLayout";
import { ShareMovie } from "@/components/share/v2/ShareMovie";
import { ShareViewRef } from "@/components/share/type";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icons } from "@/constants/Icons";
import { useMediaMovieQuery } from "@/features/media/mediaQueries";
import tw from "@/lib/tw";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { ScrollView } from "react-native";

const ShareMovieScreen = () => {
	const { movie_id, movie_title } = useLocalSearchParams();
	const movieId = Number(movie_id); 
	const movieTitle = movie_title;
	const { colors } = useTheme();
	const { customerInfo } = useAuth();
	const {
		data: movie,
		isLoading,
	} = useMediaMovieQuery({
		movieId: movieId,
	});
	const loading = movie === undefined || isLoading;

	// States

	// REFs
	const shareViewRef = useRef<ShareViewRef>(null);

	if (loading) return (
		<View style={tw`flex-1 justify-center items-center`}>
			<Icons.Loader />
		</View>
	)
	if (!movie) return <Redirect href={'..'} />
	return (
	<>
		<BottomSheetShareLayout
		path={movie.url || `/film/${movie.slug || movie.id}`}
		contentRef={shareViewRef}
        >
            <ShareMovie
			ref={shareViewRef}
			movie={movie}
			isPremium={!!customerInfo?.entitlements.active['premium']}
			/>
        </BottomSheetShareLayout>
	</>
	);
};

export default ShareMovieScreen;