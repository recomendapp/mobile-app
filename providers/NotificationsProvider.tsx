import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthProvider";
import { useSupabaseClient } from "./SupabaseProvider";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import { useRouter } from "expo-router";
import * as Burnt from 'burnt';
import { NotificationPayload } from "@recomendapp/types";
// import { NovuProvider } from "@novu/react-native";

type NotificationsContextType = {
  permissionStatus: Notifications.PermissionStatus | null;
  pushToken: string | null;
  notifications: Notifications.Notification[] | null;
  error?: Error | null;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used in NotificationsProvider");
  return ctx;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { session, pushToken, setPushToken } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [notifications, setNotifications] = useState<Notifications.Notification[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationsListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const handleRegisterForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      setPermissionStatus(finalStatus);
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted to get push token for push notification!');
      }
      try {
        const pushTokenString = (
          await Notifications.getDevicePushTokenAsync()
        ).data;
        return pushTokenString;
      } catch (e) {
        throw new Error(`${e}`);
      }
    } else {
      throw new Error('Must use physical device for push notifications');
    }
  };

  const handleSaveToken = async (token: string) => {
    try {
      if (!session) return;
      const provider = (Platform.OS === 'ios' || Platform.OS === 'macos') ? 'apns' : 'fcm';
      const { error } = await supabase
        .from("user_notification_tokens")
        .upsert({
          user_id: session.user.id,
          token: token,
          device_type: Platform.OS,
          provider: provider,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id, provider, token" });
      if (error) throw error;
    } catch (err) {
      console.error("Error saving push token:", err);
    }
  };
  const handleResponse = (response: Notifications.NotificationResponse) => {
    // iOS APNs : data in response.notification.request.trigger.payload.data
    // Android FCM : data in response.notification.request.content.data
    const data = (
      response.notification.request.content.data ||
      (response.notification.request.trigger as any).payload.data
    ) as NotificationPayload;
    if (data) {
      handleRedirect(data);
    }
  };
  const handleRedirect = (data: NotificationPayload) => {
    switch (data.type) {
      case 'reco_sent':
        router.push({
          pathname: '/collection/my-recos',
          params: { recoId: data.id },
        });
        break;
      case 'reco_completed':
        router.push({
          pathname: '/collection/my-recos',
          params: { recoId: data.id },
        });
        break;
      case 'follower_created':
        router.push(`/user/${data.sender.username}`);
        break;
      default:
        // Not handled or no redirect needed
        break;
    }
  };

  useEffect(() => {
    if (!session) return;

    // Register token
    handleRegisterForPushNotificationsAsync().then(
      async (token) => {
        setPushToken(token);
        await handleSaveToken(token);
      },
      (err) => {
        console.error("Error getting push token:", err);
        setError(err);
      }
    );

    // Listener when app is open
    notificationsListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("🔔 Notification received:", notification);
      setNotifications((prev) => (prev ? [...prev, notification] : [notification]));
      Burnt.toast({
        title: notification.request.content.title || "New Notification",
        message: notification.request.content.body ?? undefined,
        preset: 'none',
      });
    });

    // Listener when notification is clicked
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔔 Notification response received:", JSON.stringify(response, null, 2));
      handleResponse(response);
    });

    // Handle notification that opened the app
    (async () => {
      const initialResponse = await Notifications.getLastNotificationResponseAsync();
      if (initialResponse) {
        console.log("🔔 Initial notification response:", JSON.stringify(initialResponse, null, 2));
        handleResponse(initialResponse);
      }
    })();

    return () => {
      notificationsListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [session]);

  const defaultProvider = (
    <NotificationsContext.Provider
    value={{
      permissionStatus: permissionStatus,
      pushToken: pushToken,
      notifications: notifications,
      error: error,
    }}
    >
      {children}
    </NotificationsContext.Provider>
  );

  if (!session) return defaultProvider;

  return (
    <>
    {/* <NovuProvider subscriberId={session.user.id} applicationIdentifier={process.env.EXPO_PUBLIC_NOVU_APPLICATION_IDENTIFIER!}> */}
      {defaultProvider}
    {/* </NovuProvider> */}
    </>
  )
};
