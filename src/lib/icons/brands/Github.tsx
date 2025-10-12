import { forwardRef } from "react";
import Svg, { Path } from "react-native-svg";
import { BrandIconProps } from "./type";

const Github = forwardRef<Svg, BrandIconProps>((props, ref) => {
	const { variant = 'light', size = 24, ...otherProps } = props;
	const fill = variant === 'dark' ? '#FFFFFF' : '#24292f';
	return (
		<Svg
		ref={ref}
		id="github-icon"
		height={size}
		width={size}
		viewBox="0 0 24 24"
		fill={"none"}
		{...otherProps}
		>
			<Path d="M12.01.2C5.37.2,0,5.61,0,12.3c0,5.35,3.44,9.88,8.21,11.48.6.12.82-.26.82-.58,0-.28-.02-1.24-.02-2.24-3.34.72-4.04-1.44-4.04-1.44-.54-1.4-1.33-1.76-1.33-1.76-1.09-.74.08-.74.08-.74,1.21.08,1.85,1.24,1.85,1.24,1.07,1.84,2.8,1.32,3.5,1,.1-.78.42-1.32.76-1.62-2.66-.28-5.47-1.32-5.47-5.97,0-1.32.48-2.4,1.23-3.24-.12-.3-.54-1.54.12-3.21,0,0,1.01-.32,3.3,1.24.98-.26,1.99-.4,3-.4,1.01,0,2.05.14,3,.4,2.29-1.56,3.3-1.24,3.3-1.24.66,1.66.24,2.9.12,3.21.78.84,1.23,1.92,1.23,3.24,0,4.65-2.8,5.67-5.49,5.97.44.38.82,1.1.82,2.24,0,1.62-.02,2.92-.02,3.33,0,.32.22.7.82.58,4.77-1.6,8.21-6.13,8.21-11.48.02-6.69-5.37-12.1-11.99-12.1Z" fill={fill} />
		</Svg>
	);
});
Github.displayName = "Github";

export { Github };