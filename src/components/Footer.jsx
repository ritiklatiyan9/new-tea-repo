import { Link } from 'react-router-dom';
import { Leaf, Instagram, Facebook, ArrowRight, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import chailogo from '../assets/chailogo.webp'
import { useMarqueeDuration } from '../hooks/useMarqueeDuration';

const OFFER_ITEMS = [
    { icon: '🎁', text: 'Buy 1 KG of tea & get FREE 1 KG Sugar!' },
    { icon: '🍵', text: 'Mix & match 4 × 250 g packets to qualify' },
    { icon: '🚚', text: 'Free offer auto-applied in your cart' },
    { icon: '✨', text: 'Limited time — shop now and enjoy the sweetness' },
];

function OfferRibbon() {
    const repeated = [...OFFER_ITEMS, ...OFFER_ITEMS, ...OFFER_ITEMS];
    const [trackRef, duration] = useMarqueeDuration(3);
    return (
        <div className="bg-[#385040] text-white py-2.5 overflow-hidden relative">
            <div ref={trackRef} className="flex whitespace-nowrap animate-ticker" style={{ animationDuration: `${duration}s` }}>
                {repeated.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-semibold tracking-wide">
                        <span>{item.icon}</span>
                        <span>{item.text}</span>
                        <span className="text-white/40 mx-2">|</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Footer() {
    const shopLinks = [
        // { label: 'Green Tea', path: '/shop' },
        { label: 'Black Tea', path: '/shop' },
        // { label: 'Herbal Blends', path: '/shop' },
        // { label: 'Accessories', path: '/shop' },
        { label: 'Shipping Policy', path: '/shipping-policy' },
    ];

    const companyLinks = [
        { label: 'Our Story', path: '/about' },
        { label: 'Sustainability', path: '/sustainability' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contact', path: '/contact' },
        { label: 'Track Order', path: '/track-order' },
        { label: 'Submit Complaint', path: '/complaint' },
    ];

    return (
        <footer className="bg-[#1A1A1A] text-white relative overflow-hidden">
            {/* Offer ticker ribbon */}
            <OfferRibbon />

            {/* Decorative gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-tea-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />



            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-24 h-24  rounded-xl flex items-center justify-center">
                                <img src={chailogo} alt="" />
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight">
                                <span className="text-white">Chai Adda</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Bringing tranquility to your daily ritual, one cup at a time. Premium hand-picked tea leaves from the Assam finest garden.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { Icon: Instagram, href: "https://www.instagram.com/chaiadda.co?igsh=eHFhMWM2NGM1cDZv&utm_source=qr" },
                                { Icon: Facebook, href: "https://www.facebook.com/share/184ioRP2Ne/?mibextid=wwXIfr" }
                            ].map(({ Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-tea-primary hover:text-white transition-all duration-300"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Shop</h4>
                        <ul className="space-y-3">
                            {shopLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-tea-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-tea-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Get in Touch</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li>Namanmzn1996@gmail.com</li>
                            <li>+91 9873270675</li>
                            <li>Mon - Sat: 9:00 AM - 6:00 PM</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Chai Adda. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
