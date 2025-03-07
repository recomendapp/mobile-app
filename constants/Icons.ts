import { RecomendLogo } from "@/lib/icons/RecomendLogo";
import { cn } from "@/lib/utils";
import { CompassIcon, HomeIcon, LibraryIcon, Loader2Icon, LogOutIcon, LucideProps, SearchIcon, SettingsIcon, StoreIcon, UserIcon, ZapIcon } from "lucide-react-native";

export const Icons = {
	site: {
		logo: RecomendLogo,
	},
	spinner: Loader2Icon,
	loader: Loader2Icon,
	home: HomeIcon,
	search: SearchIcon,
	explore: CompassIcon,
	feed: ZapIcon,
	shop: StoreIcon,
	library: LibraryIcon,
	user: UserIcon,
	logout: LogOutIcon,
	settings: SettingsIcon,
};