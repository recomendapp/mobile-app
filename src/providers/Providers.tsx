import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ThemeProvider } from "./ThemeProvider";
import { BottomSheetManager } from "@/components/bottom-sheets/BottomSheetManager";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { SplashScreenProvider, useSplashScreen } from "./SplashScreenProvider";
import { LocaleProvider } from "./LocaleProvider";
import { NotificationsProvider } from "./NotificationsProvider";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Splash } from "@/components/Splash/Splash";
import { PropsWithChildren } from "react";
import { Toaster } from "@/components/Toast";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
	<KeyboardProvider>
		<GestureHandlerRootView style={{ flex: 1 }}>	
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<SplashScreenProvider>
					<LocaleProvider>
						<ThemeProvider>
							<ActionSheetProvider>
								<SupabaseProvider>
									<ReactQueryProvider>
										<AuthProvider>
											<NotificationsProvider>
												<ProvidersInner>
													{children}
													<Toaster />
												</ProvidersInner>
												<BottomSheetManager />
											</NotificationsProvider>
										</AuthProvider>
									</ReactQueryProvider>
								</SupabaseProvider>
							</ActionSheetProvider>
						</ThemeProvider>
					</LocaleProvider>
				</SplashScreenProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	</KeyboardProvider>
	)
};

const ProvidersInner = ({ children } : PropsWithChildren<{}>) => {
	const { ready } = useSplashScreen();
	return (
		<Splash isReady={ready}>
			{children}
		</Splash>
	);
};

export { Providers };