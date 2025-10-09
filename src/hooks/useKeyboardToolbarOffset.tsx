import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const useKeyboardToolbarOffset = () => {
	return useBottomTabBarHeight();
};