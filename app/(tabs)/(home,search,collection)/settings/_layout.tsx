import { NavSettings } from "@/components/nav/NavSettings";
import { ThemedSafeAreaView } from "@/components/ui/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/ThemedText";
import { UserNav } from "@/components/user/UserNav";
import tw from "@/lib/tw";
import { Slot } from "expo-router";
import { View } from "react-native";

const SettingsLayout = () => {
	return (
		<ThemedSafeAreaView style={tw.style('flex-1')}>
			<View style={tw.style('flex-1 gap-4')}>
				<View style={tw.style('flex-row justify-between items-center gap-2 p-2')}>
					<ThemedText style={tw.style('text-4xl font-bold')}>Settings</ThemedText>
					<UserNav />
				</View>
				<NavSettings />
				<View style={tw.style('p-2')}>
					<Slot />
				</View>
			</View>
		</ThemedSafeAreaView>
	)
};

export default SettingsLayout;