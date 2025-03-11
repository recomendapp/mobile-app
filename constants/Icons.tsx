import { RecomendLogo } from "@/lib/icons/RecomendLogo";
import { CompassIcon, HomeIcon, InfoIcon, LibraryIcon, Loader2Icon, LogOutIcon, LucideProps, SearchIcon, SettingsIcon, StoreIcon, UserIcon, ZapIcon } from "lucide-react-native";
import { Link } from "@/lib/icons/Link";
import { Settings } from "@/lib/icons/Settings";
import { Premium } from "@/lib/icons/Premium";
import { Lock } from "@/lib/icons/Lock";
import { User } from "@/lib/icons/User";
import { ArrowUpNarrowWide } from "@/lib/icons/ArrowUpNarrowWide";
import { ArrowDownNarrowWide } from "@/lib/icons/ArrowDownNarrowWide";
import { ChevronUp } from "@/lib/icons/ChevronUp";
import { ChevronDown } from "@/lib/icons/ChevronDown";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { EllipsisHorizontal } from "@/lib/icons/EllipsisHorizontal";
import { EllipsisVertical } from "@/lib/icons/EllipsisVertical";
import tw from "@/lib/tw";

export const Icons = {
	site: {
		logo: RecomendLogo,
	},
	spinner: Loader2Icon,
	loader: ({ style, ...props }: LucideProps) => (
		<Icons.spinner style={[tw.style('animate-spin'), style]} {...props} />
	),
	premium: Premium,
	home: HomeIcon,
	search: SearchIcon,
	explore: CompassIcon,
	feed: ZapIcon,
	shop: StoreIcon,
	library: LibraryIcon,
	user: User,
	logout: LogOutIcon,
	settings: Settings,
	info: InfoIcon,
	link: Link,
	lock: Lock,
	ArrowUpNarrowWide: ArrowUpNarrowWide,
	ArrowDownNarrowWide: ArrowDownNarrowWide,
	ChevronUp: ChevronUp,
	ChevronDown: ChevronDown,
	ChevronLeft: ChevronLeft,
	ChevronRight: ChevronRight,
	EllipsisHorizontal: EllipsisHorizontal,
	EllipsisVertical: EllipsisVertical,
};