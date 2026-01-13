import { createContext, use, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthProvider";
import { useSupabaseClient } from "./SupabaseProvider";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import { useRouter } from "expo-router";
import { NotificationPayload } from "@recomendapp/types";
import { NovuProvider } from "@novu/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/Toast";
import * as env from '@/env';
import { notificationKeys } from "@/api/notifications/notificationKeys";
import { useNovuSubscriberHashQuery } from "@/api/novu/novuQueries";

type NotificationsContextType = {
  isMounted: boolean;
  permissionStatus: Notifications.PermissionStatus | null;
  pushToken: string | null;
  notifications: Notifications.Notification[] | null;
  error?: Error | null;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = use(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used in NotificationsProvider");
  return ctx;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = useToast();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, pushToken, setPushToken } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [notifications, setNotifications] = useState<Notifications.Notification[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { data: subscriberHash } = useNovuSubscriberHashQuery({ subscriberId: session?.user.id });

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
        }, { onConflict: "provider, token" });
      if (error) throw error;
    } catch (err) {
      console.error("Error saving push token:", err);
    }
  };
  
  const handleRedirect = (data: NotificationPayload) => {
    switch (data.type) {
      case 'reco_sent_movie':
        router.push({
          pathname: '/film/[film_id]',
          params: { film_id: data.media.id },
        });
        break;
      case 'reco_sent_tv_series':
        router.push({
          pathname: '/tv-series/[tv_series_id]',
          params: { tv_series_id: data.media.id },
        });
        break;
      case 'follower_created':
        router.push({
          pathname: '/user/[username]',
          params: { username: data.sender.username },
        });
        break;
      default:
        break;
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

  const handleToast = (notification: Notifications.Notification) => {
    const data = (
      notification.request.content.data ||
      (notification.request.trigger as any).payload.data
    ) as NotificationPayload;
    toast.info(notification.request.content.title || "New Notification", {
      description: notification.request.content.body ?? undefined,
      onPress: (data && data.type) ? () => handleRedirect(data) : undefined,
    });
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
      handleToast(notification);
      // Invalidate notifications queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list()
      });
    });

    // Listener when notification is clicked
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔔 Notification response received:", JSON.stringify(response, null, 2));
      handleResponse(response);
    });

    // Handle notification that opened the app
    (async () => {
      const initialResponse = Notifications.getLastNotificationResponse();
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

  useEffect(() => {
    if (session && subscriberHash && !isMounted) {
      setIsMounted(true);
    }
  }, [session, subscriberHash, isMounted]);

  const defaultProvider = (
    <NotificationsContext.Provider
    value={{
      isMounted,
      permissionStatus,
      pushToken,
      notifications,
      error
    }}
    >
      {children}
    </NotificationsContext.Provider>
  );

  if (!session || !subscriberHash) return defaultProvider;

  return (
    <NovuProvider
    applicationIdentifier={env.NOVU_APPLICATION_IDENTIFIER}
    subscriberId={session.user.id}
    subscriberHash={subscriberHash}
    // useCache={true}
    >
      {defaultProvider}
    </NovuProvider>
  )
};
