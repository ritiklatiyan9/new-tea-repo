import { useEffect, useRef, useState } from 'react';

// Hides on meaningful downward scroll, reappears immediately on any upward scroll.
// Stays visible near the top of the page regardless of direction.
export function useHideOnScroll(topThreshold = 120) {
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);

    useEffect(() => {
        lastY.current = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const diff = y - lastY.current;

            if (y < topThreshold) {
                setHidden(false);
            } else if (diff > 5) {
                setHidden(true);
            } else if (diff < -5) {
                setHidden(false);
            }
            lastY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [topThreshold]);

    return hidden;
}
