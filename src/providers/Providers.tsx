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
import { PropsWithChildren } from "react";
import { ToastProvider } from "@/components/Toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ApiProvider } from "./ApiProvider";
import { useUIBackgroundsQuery } from "@/api/ui/uiQueries";

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
												<ApiProvider>
													<BottomSheetModalProvider>
														<NotificationsProvider>
															<ProvidersInner>
																{children}
															</ProvidersInner>
															<BottomSheetManager />
														</NotificationsProvider>
													</BottomSheetModalProvider>
												</ApiProvider>
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

const ProvidersInner = ({ children } : PropsWithChildren) => {
	useUIBackgroundsQuery(); // Preload UI backgrounds
	return children;
	// return (
	// 	<Splash>
	// 		{children}
	// 	</Splash>
	// );
};

export { Providers };