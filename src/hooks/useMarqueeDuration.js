import { useEffect, useRef, useState } from 'react';

// Measures the rendered width of one content set and derives an animation
// duration from it, so ribbons with different content still scroll at the
// same visual speed (px/sec) instead of just sharing a duration.
export function useMarqueeDuration(repeatCount, pxPerSecond = 55) {
    const ref = useRef(null);
    const [duration, setDuration] = useState(30);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const measure = () => {
            const setWidth = el.scrollWidth / repeatCount;
            if (setWidth > 0) setDuration(setWidth / pxPerSecond);
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [repeatCount, pxPerSecond]);

    return [ref, duration];
}
