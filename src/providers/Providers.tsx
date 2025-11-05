import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ThemeProvider } from "./ThemeProvider";
import { BottomSheetManager } from "@/components/bottom-sheets/BottomSheetManager";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { SplashScreenProvider } from "./SplashScreenProvider";
import { LocaleProvider } from "./LocaleProvider";
import { NotificationsProvider } from "./NotificationsProvider";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Splash } from "@/components/Splash/Splash";
import { PropsWithChildren } from "react";
import { ToastProvider } from "@/components/Toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { UIBackgroundsOptions } from "@/api/options";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
	<GestureHandlerRootView style={{ flex: 1 }}>	
		<KeyboardProvider>
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<SplashScreenProvider>
					<LocaleProvider>
						<ThemeProvider>
							<ToastProvider>
								<ActionSheetProvider>
									<SupabaseProvider>
										<ReactQueryProvider>
											<AuthProvider>
												<BottomSheetModalProvider>
													<NotificationsProvider>
														<ProvidersInner>
															{children}
														</ProvidersInner>
														<BottomSheetManager />
													</NotificationsProvider>
												</BottomSheetModalProvider>
											</AuthProvider>
										</ReactQueryProvider>
									</SupabaseProvider>
								</ActionSheetProvider>
							</ToastProvider>
						</ThemeProvider>
					</LocaleProvider>
				</SplashScreenProvider>
			</SafeAreaProvider>
		</KeyboardProvider>
	</GestureHandlerRootView>
	)
};

const ProvidersInner = ({ children } : PropsWithChildren<{}>) => {
	useQuery(UIBackgroundsOptions()); // Preload UI backgrounds
	return (
		<Splash>
			{children}
		</Splash>
	);
};

export { Providers };