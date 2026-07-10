import { Leaf, ShieldCheck, Coffee, Star } from 'lucide-react';
import { useMarqueeDuration } from '../hooks/useMarqueeDuration';

export default function TopRibbon() {
    const [trackRef, duration] = useMarqueeDuration(2);
    const announcements = [
        { text: "50 Years of Legacy", icon: Star },
        { text: "From One Estate, One Promise", icon: Leaf },
        { text: "Pure Assam Heritage", icon: Leaf },
        { text: "Once you sip it, you never go back", icon: Coffee },
        { text: "Trusted by Generations", icon: ShieldCheck },
    ];

    return (
        <div className="bg-[#B08848] text-white py-2.5 overflow-hidden whitespace-nowrap border-b border-white/5 fixed top-0 left-0 right-0 z-[60]">
            <div ref={trackRef} className="inline-flex gap-8 sm:gap-24 items-center px-4 animate-marquee" style={{ animationDuration: `${duration}s` }}>
                {announcements.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="flex items-center gap-3">
                            <Icon className="w-3.5 h-3.5 text-white fill-white" strokeWidth={3} />
                            <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em]">
                                {item.text}
                            </span>
                        </div>
                    );
                })}
                {/* Duplicate set for seamless loop */}
                <div aria-hidden="true" className="inline-flex gap-8 sm:gap-24 items-center">
                    {announcements.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={`dup-${index}`} className="flex items-center gap-3">
                                <Icon className="w-3.5 h-3.5 text-white fill-white" strokeWidth={3} />
                                <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em]">
                                    {item.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
