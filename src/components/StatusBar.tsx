import { useTheme } from "@/providers/ThemeProvider";
import { StatusBar as StatusBarNative, StatusBarProps } from "expo-status-bar";

const StatusBar = (props: StatusBarProps) => {
  const { colors } = useTheme();
  return <StatusBarNative style={'light'} {...props} />;
};

export default StatusBar;