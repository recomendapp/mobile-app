import { useAuth } from "@/providers/AuthProvider";
import { useUserActivityQuery } from "@/features/user/userQueries";
import { upperFirst } from "lodash";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/Skeleton";
import { Link } from "expo-router";
import { FileEditIcon } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { ThemedText } from "../ui/ThemedText";
import { TouchableOpacity, View } from "react-native";

const ButtonMyReview = ({
	mediaId,
 } : {
	mediaId: number;
}) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { colors } = useTheme();
	const {
	  data: activity,
	  isLoading,  
	} = useUserActivityQuery({
		userId: user?.id,
		mediaId: mediaId,
	});

	if (!user) return;

	if (isLoading || activity === undefined) {
		return (
			<Skeleton className="w-36 h-10 rounded-full"/>
		);
	}
  
	return (
		<Link
		href={activity?.review ? `/review/${activity?.review?.id}` : `/review/create/${mediaId}`}
		asChild
		>
			<TouchableOpacity>
				<View
				style={[
					{ backgroundColor: colors.accentBlue },
					tw`flex-1 flex-row rounded-full px-4 py-1 gap-2 items-center justify-between font-semibold`,
				]}
				>

					<FileEditIcon color={colors.foreground} />
					<ThemedText>
						{activity?.review ? (
							upperFirst(t('common.messages.my_review', { count: 1 }))
						) : (
							upperFirst(t('common.messages.write_review'))
						)}
					</ThemedText>
				</View>
			</TouchableOpacity>
		</Link>
	);
};

export default ButtonMyReview;
