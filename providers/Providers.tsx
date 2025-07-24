import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ThemeProvider } from "./ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetManager } from "@/components/bottom-sheets/BottomSheetManager";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreenController from "@/components/SplashScreenController";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
	<GestureHandlerRootView style={{ flex: 1 }}>	
		<SafeAreaProvider>
			<ThemeProvider>
				<ActionSheetProvider>
					<SupabaseProvider>
						<ReactQueryProvider>
							<AuthProvider>										<SplashScreenController>
									{children}
									<BottomSheetManager />
								</SplashScreenController>
							</AuthProvider>
						</ReactQueryProvider>
					</SupabaseProvider>
				</ActionSheetProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	</GestureHandlerRootView>
	)
};

export { Providers };