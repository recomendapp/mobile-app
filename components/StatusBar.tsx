import { useTheme } from "@/context/ThemeProvider";
import { StatusBar as StatusBarNative, StatusBarProps } from "expo-status-bar";

const StatusBar = (props: StatusBarProps) => {
  const { colors } = useTheme();
  return <StatusBarNative style="dark" {...props} />;
};

export default StatusBar;