import { useEffect, useState } from "react";

interface useNowProps {
    updateInterval?: number;
}

const useNow = ({
    updateInterval = 1000,
} : useNowProps) => {
    const [now, setNow] = useState(new Date);
    useEffect(() => {
        const interval = setInterval(
            () => setNow(new Date()),
            updateInterval,
        );
        return () => clearInterval(interval);
    });
    return now;
};

export default useNow;
export type { useNowProps };