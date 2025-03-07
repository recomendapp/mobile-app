import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
  search: { initialRouteName: 'search/index' },
  collection: { initialRouteName: 'collection/index' },
};

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}/>
  );
}