import {toast, Toaster as SNToaster} from 'sonner-native'
import { useTheme } from '@/providers/ThemeProvider'
import { useCallback } from 'react'
import { ExternalToast, ToastAction } from './types'
import { Button } from '../ui/Button'
import * as Haptics from 'expo-haptics'

export const Toaster = () => {
	const { colors } = useTheme();
	return (
		<SNToaster
		pauseWhenPageIsHidden
		closeButton
		styles={{
			toast: {
				backgroundColor: colors.muted
			},
			title: {
				color: colors.foreground
			},
			description: {
				color: colors.foreground
			}, 
		}}
		/>
	);
};

type HapticType = "none" | "success" | "error" | "warning";

type ExternalToastCustom = ExternalToast & {
	haptic?: HapticType;
};


export function useToast() {
	const { colors } = useTheme();
	const { success, error, info, warning } = toast;

	const triggerHaptic = useCallback((type: HapticType) => {
		if (type === 'none') return;

		switch (type) {
			case 'success':
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				break;
			case 'error':
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				break;
			case 'warning':
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
				break;
		}
	}, []);

	const renderAction = useCallback((action?: React.ReactNode | ToastAction) => {
		if (!action) return undefined;

		const isToastAction = (obj: any): obj is ToastAction => {
			return obj && typeof obj === 'object' && 'label' in obj && 'onClick' in obj;
		};

		if (isToastAction(action)) {
			return (
				<Button onPress={action.onClick}>
					{action.label}
				</Button>
			);
		}

		return action;
	}, []);

	const withAction = useCallback(
		(fn: Function, defaultHaptic: HapticType) =>
			(message: string, opts?: ExternalToastCustom) => {
				const hapticType = opts?.haptic ?? defaultHaptic;
				if (hapticType !== 'none') triggerHaptic(hapticType);

				const { haptic, ...restOpts } = opts || {};
				return fn(message, { ...restOpts, action: renderAction(restOpts?.action) });
			},
		[renderAction, triggerHaptic]
	);

	return {
		...toast,
		success: withAction(success, 'success'),
		error: withAction(error, 'error'),
		info: withAction(info, 'none'),
		warning: withAction(warning, 'warning'),
	}
}
