import * as Notification from "expo-notifications";
import { useRef, useState } from "react";

export interface PushNotificationState {
	notification?: Notification.Notification;
	expoPushToken?: Notification.ExpoPushToken;
}

const usePushNotifications = (): PushNotificationState => {
	Notification.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
	});

	const [notification, setNotification] = useState<Notification.Notification>();
	const [expoPushToken, setExpoPushToken] = useState<Notification.ExpoPushToken>();
	
	return { notification, expoPushToken };
};

export default usePushNotifications;