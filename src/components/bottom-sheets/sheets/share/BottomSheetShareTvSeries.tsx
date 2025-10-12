import { forwardRef, useRef } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import { MediaTvSeries } from "@recomendapp/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ShareViewRef } from "@/components/share/type";
import BottomSheetShareLayout from "./BottomSheetShareLayout"; // Importer le layout
import { useAuth } from "@/providers/AuthProvider";
import { ShareTvSeries } from "@/components/share/ShareTvSeries";

interface BottomSheetShareTvSeriesProps extends BottomSheetProps {
    tvSeries: MediaTvSeries;
}

const BottomSheetShareTvSeries = forwardRef<
    React.ComponentRef<typeof TrueSheet>,
    BottomSheetShareTvSeriesProps
>(({
    tvSeries,
    ...props
}, ref) => {
    const { customerInfo } = useAuth();
    const shareViewRef = useRef<ShareViewRef>(null);
    return (
        <BottomSheetShareLayout
        ref={ref}
        path={tvSeries.url || `/tv-series/${tvSeries.slug || tvSeries.id}`}
        contentRef={shareViewRef} 
        {...props}
        >
            <ShareTvSeries
			ref={shareViewRef}
			tvSeries={tvSeries}
			isPremium={!!customerInfo?.entitlements.active['premium']}
			/>
        </BottomSheetShareLayout>
    );
});

BottomSheetShareTvSeries.displayName = "BottomSheetShareTvSeries";

export default BottomSheetShareTvSeries;