import { useMemo } from 'react';

const useRandomBackdrop = (backdrops: (string | null | undefined)[]) => {
  const randomBackdrop = useMemo(() => {
    const images = backdrops.filter((backdrop) => backdrop !== undefined) as string[];
	if (!images.length) return undefined;
	return images[Math.floor(Math.random() * images.length)];
  }, [backdrops]);

  return randomBackdrop;
};

export default useRandomBackdrop;