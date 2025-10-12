import { forwardRef, useRef } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import { MediaPerson } from "@recomendapp/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ShareViewRef } from "@/components/share/type";
import BottomSheetShareLayout from "./BottomSheetShareLayout"; // Importer le layout
import { useAuth } from "@/providers/AuthProvider";
import { SharePerson } from "@/components/share/SharePerson";

interface BottomSheetSharePersonProps extends BottomSheetProps {
    person: MediaPerson;
}

const BottomSheetSharePerson = forwardRef<
    React.ComponentRef<typeof TrueSheet>,
    BottomSheetSharePersonProps
>(({
    person,
    ...props
}, ref) => {
    const { customerInfo } = useAuth();
    const shareViewRef = useRef<ShareViewRef>(null);
    return (
        <BottomSheetShareLayout
        ref={ref}
        path={person.url || `/person/${person.slug || person.id}`}
        contentRef={shareViewRef} 
        {...props}
        >
            <SharePerson
            ref={shareViewRef}
            person={person}
            isPremium={!!customerInfo?.entitlements.active['premium']}
            />
        </BottomSheetShareLayout>
    );
});

BottomSheetSharePerson.displayName = "BottomSheetSharePerson";

export default BottomSheetSharePerson;