import { SettingsNav } from "@/components/nav/SettingsNav";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { UserNav } from "@/components/user/UserNav";
import { Slot } from "expo-router";
import { View } from "react-native";

const SettingsLayout = () => {
	return (
		<ThemedSafeAreaView className="flex-1">
			<View className='flex-1 gap-4'>
				<View className="flex-row justify-between items-center gap-2 p-2">
					<ThemedText className="text-4xl font-bold">Settings</ThemedText>
					<UserNav />
				</View>
				<SettingsNav />
				<View className="p-2">
					<Slot />
				</View>
			</View>
		</ThemedSafeAreaView>
	)
};

export default SettingsLayout;