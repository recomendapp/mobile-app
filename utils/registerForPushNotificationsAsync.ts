import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const registerForPushNotificationsAsync = async () => {
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
    if (finalStatus !== 'granted') {
		  console.error('Permission not granted to get push token for push notification!')
      //   handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      //   handleRegistrationError('Project ID not found');
      console.error('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      //   handleRegistrationError(`${e}`);
      console.error(`Error getting push token: ${e}`);
    }
  } else {
    console.error('Must use physical device for push notifications');
    // handleRegistrationError('Must use physical device for push notifications');
  }
};
export default registerForPushNotificationsAsync;
