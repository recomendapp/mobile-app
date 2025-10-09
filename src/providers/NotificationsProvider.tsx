import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthProvider";
import { useSupabaseClient } from "./SupabaseProvider";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import { useRouter } from "expo-router";
import { NotificationPayload } from "@recomendapp/types";
import { NovuProvider } from "@novu/react-native";
import { useNovuSubscriberHash } from "@/features/utils/utilsQueries";
import { useQueryClient } from "@tanstack/react-query";
import { utilsKey } from "@/features/utils/utilsKey";
import { useToast } from "@/components/Toast";

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
  const { data: subscriberHash } = useNovuSubscriberHash(session?.user.id);

  const notificationsListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const handleRegisterForPushNotificationsAsync = useCallback(async () => {
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
  }, []);
  const handleSaveToken = useCallback(async (token: string) => {
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
  }, [session, supabase]);
  
  const handleRedirect = useCallback((data: NotificationPayload) => {
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
  }, [router]);
  const handleResponse = useCallback((response: Notifications.NotificationResponse) => {
    // iOS APNs : data in response.notification.request.trigger.payload.data
    // Android FCM : data in response.notification.request.content.data
    const data = (
      response.notification.request.content.data ||
      (response.notification.request.trigger as any).payload.data
    ) as NotificationPayload;
    if (data) {
      handleRedirect(data);
    }
  }, [handleRedirect]);

  const handleToast = useCallback((notification: Notifications.Notification) => {
    const data = (
      notification.request.content.data ||
      (notification.request.trigger as any).payload.data
    ) as NotificationPayload;
    toast.info(notification.request.content.title || "New Notification", {
      description: notification.request.content.body ?? undefined,
      onPress: (data && data.type) ? () => handleRedirect(data) : undefined,
    });
  }, [handleRedirect, toast]);

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
        queryKey: utilsKey.notifications()
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

  const contextValue = useMemo(() => ({
    isMounted,
    permissionStatus,
    pushToken,
    notifications,
    error
  }), [isMounted, permissionStatus, pushToken, notifications, error]);

  const defaultProvider = useMemo(() => (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  ), [contextValue, children]);

  if (!session || !subscriberHash) return defaultProvider;

  return (
    <NovuProvider
    applicationIdentifier={process.env.EXPO_PUBLIC_NOVU_APPLICATION_IDENTIFIER!}
    subscriberId={session.user.id}
    subscriberHash={subscriberHash}
    // useCache={true}
    >
      {defaultProvider}
    </NovuProvider>
  )
};
