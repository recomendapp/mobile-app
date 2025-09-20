import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ThemeProvider } from "./ThemeProvider";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetManager } from "@/components/bottom-sheets/BottomSheetManager";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreenProvider } from "./SplashScreenProvider";
import { LocaleProvider } from "./LocaleProvider";
import { NotificationsProvider } from "./NotificationsProvider";
import { ToastProvider } from "@/components/ui/toast";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
	<KeyboardProvider>
		<GestureHandlerRootView style={{ flex: 1 }}>	
			<SafeAreaProvider>
				<SplashScreenProvider>
					<LocaleProvider>
						<ThemeProvider>
							<ToastProvider>
								<ActionSheetProvider>
									<SupabaseProvider>
										<ReactQueryProvider>
											<AuthProvider>
												<NotificationsProvider>
													{children}
													<BottomSheetManager />
												</NotificationsProvider>
											</AuthProvider>
										</ReactQueryProvider>
									</SupabaseProvider>
								</ActionSheetProvider>
							</ToastProvider>
						</ThemeProvider>
					</LocaleProvider>
				</SplashScreenProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	</KeyboardProvider>
	)
};

export { Providers };