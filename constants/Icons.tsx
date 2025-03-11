import { RecomendLogo } from "@/lib/icons/RecomendLogo";
import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, CompassIcon, EllipsisIcon, EllipsisVerticalIcon, EyeIcon, EyeOffIcon, HomeIcon, InfoIcon, LibraryIcon, LinkIcon, Loader2Icon, LockIcon, LogOutIcon, LucideProps, SearchIcon, SettingsIcon, StoreIcon, UserIcon, ZapIcon } from "lucide-react-native";
import { Premium } from "@/lib/icons/Premium";
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
	user: UserIcon,
	logout: LogOutIcon,
	settings: SettingsIcon,
	info: InfoIcon,
	link: LinkIcon,
	lock: LockIcon,
	ArrowUpNarrowWide: ArrowUpNarrowWideIcon,
	ArrowDownNarrowWide: ArrowDownNarrowWideIcon,
	ChevronUp: ChevronUpIcon,
	ChevronDown: ChevronDownIcon,
	ChevronLeft: ChevronLeftIcon,
	ChevronRight: ChevronRightIcon,
	EllipsisHorizontal: EllipsisIcon,
	EllipsisVertical: EllipsisVerticalIcon,
	Eye: EyeIcon,
	EyeOff: EyeOffIcon,
};