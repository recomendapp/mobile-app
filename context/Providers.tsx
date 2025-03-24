import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ThemeProvider } from "./ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetManager } from "@/components/bottom-sheets/BottomSheetManager";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
	<GestureHandlerRootView style={{ flex: 1 }}>
		<ActionSheetProvider>
			<ThemeProvider>
				<SupabaseProvider locale='en-US'>
					<ReactQueryProvider>
						<AuthProvider>
							{children}
							<BottomSheetManager />
						</AuthProvider>
					</ReactQueryProvider>
				</SupabaseProvider>
			</ThemeProvider>
		</ActionSheetProvider>
	</GestureHandlerRootView>
	)
};

export { Providers };