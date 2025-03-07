import { iconWithClassName } from "@/lib/icons/iconWithClassName";
import { RecomendLogo } from "@/lib/icons/RecomendLogo";
import { CompassIcon, HomeIcon, InfoIcon, LibraryIcon, LinkIcon, Loader2Icon, LogOutIcon, LucideProps, SearchIcon, SettingsIcon, StoreIcon, UserIcon, ZapIcon } from "lucide-react-native";
import { Link } from "@/lib/icons/Link";
import { Settings } from "@/lib/icons/Settings";
import { cn } from "@/lib/utils";
import { Premium } from "@/lib/icons/Premium";

export const Icons = {
	site: {
		logo: RecomendLogo,
	},
	spinner: Loader2Icon,
	loader: ({ className, ...props }: LucideProps) => (
		<Icons.spinner className={cn('animate-spin', className)} {...props} />
	),
	premium: Premium,
	home: HomeIcon,
	search: SearchIcon,
	explore: CompassIcon,
	feed: ZapIcon,
	shop: StoreIcon,
	library: LibraryIcon,
	user: UserIcon,
	logout: LogOutIcon,
	settings: Settings,
	info: InfoIcon,
	link: Link,
};