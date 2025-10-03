import { forwardRef, useRef } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import { MediaMovie } from "@recomendapp/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ShareViewRef } from "@/components/share/type";
import BottomSheetShareLayout from "./BottomSheetShareLayout"; // Importer le layout
import { ShareMovie } from "@/components/share/ShareMovie";
import { useAuth } from "@/providers/AuthProvider";

interface BottomSheetShareMovieProps extends BottomSheetProps {
    movie: MediaMovie;
}

const BottomSheetShareMovie = forwardRef<
    React.ComponentRef<typeof TrueSheet>,
    BottomSheetShareMovieProps
>(({
    movie,
    ...props
}, ref) => {
    const { customerInfo } = useAuth();
    const shareViewRef = useRef<ShareViewRef>(null);
    return (
        <BottomSheetShareLayout
            ref={ref}
            path={movie.url || `/film/${movie.slug || movie.id}`}
            contentRef={shareViewRef} 
            {...props}
        >
            <ShareMovie
			ref={shareViewRef}
			movie={movie}
			isPremium={!!customerInfo?.entitlements.active['premium']}
			/>
        </BottomSheetShareLayout>
    );
});

BottomSheetShareMovie.displayName = "BottomSheetShareMovie";

export default BottomSheetShareMovie;