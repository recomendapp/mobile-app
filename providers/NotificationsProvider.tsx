import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Notification from "expo-notifications";
import registerForPushNotificationsAsync from "@/utils/registerForPushNotificationsAsync";
import { useAuth } from "./AuthProvider";
import { useSupabaseClient } from "./SupabaseProvider";
import { Platform } from "react-native";

type NotificationsContextType = {
  expoPushToken: string | null;
  notifications: Notification.Notification[] | null;
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
  const { session } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification.Notification[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationsListener = useRef<Notification.EventSubscription | null>(null);
  const responseListener = useRef<Notification.EventSubscription | null>(null);

  const handleSaveToken = async (token: string) => {
    try {
      if (!session) return;
      const { error } = await supabase
        .from("user_notification_tokens")
        .upsert({
          user_id: session.user.id,
          token: token,
          device_type: Platform.OS,
          provider: "expo",
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    } catch (err) {
      console.error("Error saving push token:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  useEffect(() => {
    if (!session) return;
    registerForPushNotificationsAsync().then(
      async (token) => {
        console.log("🔔 Push token:", token);
        setExpoPushToken(token);
        await handleSaveToken(token);
      },
      (err) => {
        console.error("Error getting push token:", err);
        setError(err);
      }
    );
    notificationsListener.current = Notification.addNotificationReceivedListener((notification) => {
      console.log("🔔 Notification received:", notification);
      setNotifications((prev) => (prev ? [...prev, notification] : [notification]));
    });

    responseListener.current = Notification.addNotificationResponseReceivedListener((response) => {
      console.log(
        "🔔 Notification response received: ",
        JSON.stringify(response, null, 2),
        JSON.stringify(response.notification.request.content.data, null, 2)
      );
    });

    return () => {
      if (notificationsListener.current) {
        notificationsListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [session]);


  return (
    <NotificationsContext.Provider
    value={{
      expoPushToken: expoPushToken,
      notifications: notifications,
      error: error,
    }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
