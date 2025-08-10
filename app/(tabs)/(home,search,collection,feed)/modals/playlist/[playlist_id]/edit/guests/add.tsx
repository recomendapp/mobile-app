import { Button } from "@/components/ui/Button";
import { User } from "@/types/type.db";
import { Stack, useRouter } from "expo-router";
import { upperFirst } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslations } from "use-intl";

const ModalPlaylistEditGuestsAdd = () => {
	const t = useTranslations();
	const router = useRouter();

	// States
	const [ isLoading, setIsLoading ] = useState(false);
	const [ selectedUsers, setSelectedUsers ] = useState<User[]>([]);
	const canSave = useMemo((): boolean => {
		return selectedUsers.length > 0;
	}, [selectedUsers]);

	// Handlers
	const handleSubmit = useCallback(() => {
		if (!canSave) return;
	}, [canSave]);
	const handleCancel = useCallback(() => {
		if (canSave) {
			Alert.alert(
				upperFirst(t('common.messages.are_u_sure')),
				upperFirst(t('common.messages.do_you_really_want_to_cancel_change', { count: 2 })),
				[
					{
						text: upperFirst(t('common.messages.continue_editing')),
					},
					{
						text: upperFirst(t('common.messages.ignore')),
						onPress: () => router.dismiss(),
						style: 'destructive',
					},
				]
			);
		} else {
			router.dismiss();
		}
	}, [canSave, router, t]);
	return (
	<>
		<Stack.Screen
			options={{
				headerTitle: upperFirst(t('common.messages.add_guest', { count: 2 })),
				headerLeft: router.canDismiss() ? () => (
					<Button
					variant="ghost"
					size="fit"
					disabled={isLoading}
					onPress={handleCancel}
					>
						{upperFirst(t('common.messages.cancel'))}
					</Button>
				) : undefined,
				headerRight: () => (
					<Button
					variant="ghost"
					size="fit"
					loading={isLoading}
					onPress={handleSubmit}
					disabled={!canSave || isLoading}
					>
						{upperFirst(t('common.messages.save'))}
					</Button>
				),
			}}
		/>
	</>
	)
};

export default ModalPlaylistEditGuestsAdd;