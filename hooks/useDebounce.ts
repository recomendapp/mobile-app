import { useEffect, useState } from "react";

const useDebounce = <T extends unknown>(
	value: T,
	delay: number = 250,
): T => {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
  
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);
	return debouncedValue;
};
export default useDebounce;