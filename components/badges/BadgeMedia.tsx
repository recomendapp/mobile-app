import { MediaType } from "@recomendapp/types";
import * as React from "react"
import { useTranslations } from "use-intl";
import { Badge } from "../ui/Badge";

interface BadgeMediaProps
	extends React.ComponentPropsWithoutRef<typeof Badge> {
		type?: MediaType | null;
	}

const BadgeMedia = React.forwardRef<
	React.ComponentRef<typeof Badge>,
	BadgeMediaProps
>(({ type, variant, ...props }, ref) => {
	const t = useTranslations();
	return (
		<Badge ref={ref} variant={variant ?? 'accent-yellow'} {...props}>
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