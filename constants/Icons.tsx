import { RecomendLogo } from "@/lib/icons/RecomendLogo";
import { AlertCircleIcon, ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon, BookmarkIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ClapperboardIcon, CompassIcon, EllipsisIcon, EllipsisVerticalIcon, EyeIcon, EyeOffIcon, FilterIcon, HeartIcon, HomeIcon, InfoIcon, LibraryIcon, LinkIcon, ListPlusIcon, Loader2Icon, LockIcon, LogOutIcon, LucideProps, PlusIcon, SearchIcon, SendIcon, SettingsIcon, StoreIcon, TextIcon, TrashIcon, UserIcon, XIcon, ZapIcon } from "lucide-react-native";
import { Premium } from "@/lib/icons/Premium";
import tw from "@/lib/tw";

export const Icons = {
	site: {
		logo: RecomendLogo,
	},
	spinner: Loader2Icon,
	loader: ({ style, ...props }: LucideProps) => (
		<Icons.spinner style={[tw.style(''), style]} {...props} />
	),
	premium: Premium,
	home: HomeIcon,
	Search: SearchIcon,
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
	like: HeartIcon,
	AlertCircle: AlertCircleIcon,
	Reco: SendIcon,
	Watchlist: BookmarkIcon,
	Likes: HeartIcon,
	Movie: ClapperboardIcon,
	AddPlaylist: ListPlusIcon,
	Delete: TrashIcon,
	Filter: FilterIcon,
	Cancel: XIcon,
	Comment: TextIcon,
	Check: CheckIcon,
	Add: PlusIcon,
};