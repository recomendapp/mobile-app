import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AuthProvider } from "./AuthProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ThemeProvider } from "./ThemeProvider";

type ProvidersProps = {
	children: React.ReactNode;
};

const Providers = ({ children } : ProvidersProps) => {
	return (
	<ActionSheetProvider>
		<ThemeProvider>
			<SupabaseProvider locale='en-US'>
				<ReactQueryProvider>
					<AuthProvider>
						{children}
					</AuthProvider>
				</ReactQueryProvider>
			</SupabaseProvider>
		</ThemeProvider>
	</ActionSheetProvider>
	)
};

export { Providers };