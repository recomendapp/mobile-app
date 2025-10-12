import { forwardRef, useRef } from "react";
import { BottomSheetProps } from "../../BottomSheetManager";
import { Profile, User } from "@recomendapp/types";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { ShareViewRef } from "@/components/share/type";
import BottomSheetShareLayout from "./BottomSheetShareLayout"; // Importer le layout
import { ShareUser } from "@/components/share/ShareUser";
import { useAuth } from "@/providers/AuthProvider";

interface BottomSheetShareUserProps extends BottomSheetProps {
    user: User | Profile;
}

const BottomSheetShareUser = forwardRef<
    React.ComponentRef<typeof TrueSheet>,
    BottomSheetShareUserProps
>(({
    user,
    ...props
}, ref) => {
    const { customerInfo } = useAuth();
    const shareViewRef = useRef<ShareViewRef>(null);
    return (
        <BottomSheetShareLayout
        ref={ref}
        path={`/@${user.username}`}
        contentRef={shareViewRef} 
        {...props}
        >
            <ShareUser
            ref={shareViewRef}
            user={user}
            isPremium={!!customerInfo?.entitlements.active['premium']}
            />
        </BottomSheetShareLayout>
    );
});

BottomSheetShareUser.displayName = "BottomSheetShareUser";

export default BottomSheetShareUser;