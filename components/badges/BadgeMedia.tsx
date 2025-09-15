import { MediaType } from "@recomendapp/types";
import * as React from "react"
import { useTranslations } from "use-intl";
import { Badge } from "../ui/Badge";

interface BadgeMediaProps
	extends React.ComponentProps<typeof Badge> {
		type?: MediaType | null;
	}

const BadgeMedia = React.forwardRef<
	HTMLDivElement,
	BadgeMediaProps
>(({ type, variant, className, ...props }, ref) => {
	const t = useTranslations();
	return (
		<Badge variant={variant ?? 'accent-yellow'} className={className} {...props}>
		{type === 'movie'
			? t('common.messages.film', { count: 1 })
			: type === 'tv_series'
			? t('common.messages.tv_series', { count: 1 })
			: type === 'person'
			? t('common.messages.cast_and_crew')
			: type
		}
		</Badge>
	);
})
BadgeMedia.displayName = 'BadgeMedia'

export { BadgeMedia }