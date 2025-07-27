import { RecomendLogo } from "@/lib/icons/RecomendLogo";
import { AlertCircleIcon, ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon, BookmarkIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ClapperboardIcon, CompassIcon, EditIcon, EllipsisIcon, EllipsisVerticalIcon, EyeIcon, EyeOffIcon, FilterIcon, HeartIcon, HomeIcon, InfoIcon, LibraryIcon, LinkIcon, ListPlusIcon, ListVideoIcon, Loader2Icon, LockIcon, LogOutIcon, LucideProps, MailIcon, PlusIcon, SearchIcon, Send, SendIcon, SettingsIcon, StarIcon, StoreIcon, TextIcon, TrashIcon, UserIcon, UsersIcon, XIcon, ZapIcon } from "lucide-react-native";
import { Premium } from "@/lib/icons/Premium";
import tw from "@/lib/tw";
import { ActivityIndicator } from "react-native";

export const Icons = {
	site: {
		logo: RecomendLogo,
	},
	spinner: Loader2Icon,
	// loader: ({ style, ...props }: LucideProps) => (
	// 	<Icons.spinner style={[tw.style(''), style]} {...props} />
	// ),
	Loader: ActivityIndicator,
	premium: Premium,
	home: HomeIcon,
	Search: SearchIcon,
	explore: CompassIcon,
	Feed: ZapIcon,
	shop: StoreIcon,
	library: LibraryIcon,
	User: UserIcon,
	Users: UsersIcon,
	logout: LogOutIcon,
	settings: SettingsIcon,
	info: InfoIcon,
	link: LinkIcon,
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
	Playlist: ListVideoIcon,
	Edit: EditIcon,
	Star: StarIcon,
	Mail: MailIcon,
	Password: LockIcon,
	Lock: LockIcon,
};