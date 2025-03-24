const useRandomBackdrop = (backdrops: (string | null | undefined)[]) => {
	const images = backdrops.filter((backdrop) => backdrop !== undefined) as string[];
	if (!images.length) return undefined;
	const randomBackdrop = images[Math.floor(Math.random() * images.length)];
	return randomBackdrop;
};

export default useRandomBackdrop;