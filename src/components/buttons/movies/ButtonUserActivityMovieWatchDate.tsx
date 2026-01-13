import { useAuth } from "@/providers/AuthProvider";
import { Icons } from "@/constants/Icons";
import { MediaMovie } from "@recomendapp/types";
import { Button } from "@/components/ui/Button";
import { useUserActivityMovieUpdateMutation } from "@/api/users/userMutations";
import { upperFirst } from "lodash";
import { useTranslations } from "use-intl";
import { useToast } from "@/components/Toast";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "@/providers/ThemeProvider";
import tw from "@/lib/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { forwardRef, useState } from "react";
import { useUserActivityMovieQuery } from "@/api/users/userQueries";

interface ButtonUserActivityMovieWatchDateProps
	extends React.ComponentProps<typeof Button> {
		movie: MediaMovie;
	}

const ButtonUserActivityMovieWatchDate = forwardRef<
	React.ComponentRef<typeof Button>,
	ButtonUserActivityMovieWatchDateProps
>(({ movie, variant = "outline", size = "icon", style, onPress: onPressProps, ...props }, ref) => {
	const { session } = useAuth();
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const toast = useToast();
	const t = useTranslations();
	// States
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
	// Requests
	const {
		data: activity,
	} = useUserActivityMovieQuery({
		userId: session?.user.id,
		movieId: movie.id,
	});
	// Mutations
	const { mutateAsync: updateActivity } = useUserActivityMovieUpdateMutation();
	// Handlers
	const showDatePicker = () => {
		setDatePickerVisibility(true);
	};
	
	const hideDatePicker = () => {
		setDatePickerVisibility(false);
	};
	const handleUpdateDate = async (date: Date) => {
		if (!session) return;
		if (!activity) return;
		await updateActivity({
			activityId: activity.id,
			watchedDate: date,
		}, {
			onSuccess: () => {
				hideDatePicker();
				toast.success(upperFirst(t('common.messages.saved', { gender: 'male', count: 1 })));
			},
			onError: (error) => {
				toast.error(upperFirst(t('common.messages.error')), { description: upperFirst(t('common.messages.an_error_occurred')) });
				throw error;
			}
		});
	};

	if (!activity) return null;

	return (
	<>
		<Button
		ref={ref}
		variant={variant}
		size={size}
		icon={Icons.Calendar}
		onPress={(e) => {
			showDatePicker();
			onPressProps?.(e);
		}}
		style={{
			...tw`rounded-full`,
			...style,
		}}
		{...props}
		/>
		<DateTimePickerModal
		isVisible={isDatePickerVisible}
		mode="date"
		date={activity.watched_date ? new Date(activity.watched_date) : undefined}
		display="inline"
		onConfirm={handleUpdateDate}
		onCancel={hideDatePicker}
		textColor={colors.foreground}
		accentColor={colors.accentYellow}
		pickerStyleIOS={{
			backgroundColor: colors.muted,
		}}
		buttonTextColorIOS={colors.foreground}
		pickerContainerStyleIOS={{
			backgroundColor: colors.muted,
		}}
		// themeVariant={mode}
		confirmTextIOS={upperFirst(t('common.messages.save'))}
		cancelTextIOS={upperFirst(t('common.messages.cancel'))}
		customCancelButtonIOS={({ onPress, label, ...props }) => (
			<Button onPress={onPress} size="lg" variant="muted" textStyle={tw`text-lg`}>{label}</Button>
		)}
		customConfirmButtonIOS={({ onPress, label, ...props }) => (
			<Button onPress={onPress} size="lg" variant="accent-yellow" style={tw`rounded-none`} textStyle={tw`text-lg`}>{label}</Button>
		)}
		modalStyleIOS={{
			paddingBottom: insets.bottom,
		}}
		/>
	</>
	);
});
ButtonUserActivityMovieWatchDate.displayName = 'ButtonUserActivityMovieWatchDate';

export default ButtonUserActivityMovieWatchDate;
