import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Leaf, ShieldCheck, Package, Sparkles } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, firebaseEnabled } from '@/config/firebase';
import chailogo from '@/assets/chailogo.webp';
import SEOHelmet from '@/components/SEOHelmet';

const pouch = '/two.png'; // served from public/

const FloatingInput = ({ icon: Icon, type = 'text', label, value, onChange, id, showPasswordToggle }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const finalType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="relative group">
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 ml-4 transition-colors duration-300 ${isFocused || value ? 'text-[#385040]' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <input
                type={finalType}
                id={id}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full bg-white border-2 rounded-2xl py-3.5 sm:py-4 pl-12 pr-12 outline-none transition-all duration-300 font-medium text-[#22382B] ${isFocused ? 'border-[#385040] shadow-[0_0_0_4px_rgba(56,80,64,0.1)]' : 'border-gray-200 hover:border-gray-300'}`}
            />
            <label
                htmlFor={id}
                className={`absolute left-12 transition-all duration-300 pointer-events-none ${isFocused || value ? '-top-2.5 text-xs bg-white px-2 text-[#385040] font-bold' : 'top-1/2 -translate-y-1/2 text-gray-500 font-medium'}`}
            >
                {label}
            </label>
            {showPasswordToggle && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#385040] transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            )}
        </div>
    );
};

const FEATURES = [
    { icon: Sparkles, text: 'Exclusive member discounts' },
    { icon: Leaf, text: 'Curated monthly estate blends' },
    { icon: Package, text: 'Track every order in real time' },
];

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle } = useAuth();
    const from = location.state?.from?.pathname || '/shop';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await login(formData);
            if (result.success) navigate(from, { replace: true });
            else setError(result.error);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const res = await loginWithGoogle(idToken);
            if (res.success) navigate(from, { replace: true });
            else setError(res.error);
        } catch (err) {
            if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
                setError('Google sign-in failed. Please try again.');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-[100svh] bg-[#F2EDE3] flex items-stretch">
            <SEOHelmet
                title="Login | Chai Adda"
                description="Login to your Chai Adda account."
                url="https://www.chaiadda.co.in/login"
                noindex={true}
            />

            {/* ── Brand panel (desktop) ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#2A4233] via-[#385040] to-[#1E3227]"
            >
                {/* Decorative glows + rings */}
                <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(196,214,176,0.25)_0%,transparent_70%)] blur-2xl" />
                <div className="absolute -bottom-32 -right-16 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(200,169,110,0.22)_0%,transparent_70%)] blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-white/[0.06]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-dashed border-white/[0.07] hero-ring-spin" />

                {/* Product pouch accent */}
                <img src={pouch} alt="" aria-hidden="true"
                    className="absolute -bottom-10 -right-8 w-[300px] xl:w-[360px] object-contain opacity-90 drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)] hero-card-float" />

                <div className="relative z-10 w-full flex flex-col justify-center gap-10 p-12 xl:p-16 pt-32 text-white">
                    <div>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.06] text-[#C4D6B0] text-[10px] font-sans font-bold uppercase tracking-[0.3em] mb-6">
                            <Leaf size={11} /> Est. 1974 · Assam
                        </span>
                        <h2 className="font-display font-light text-6xl xl:text-7xl leading-[0.95] mb-6">
                            Welcome<br />Back
                        </h2>
                        <p className="text-lg text-white/70 max-w-sm font-serif italic leading-relaxed">
                            "There is something in the nature of tea that leads us into a world of quiet contemplation of life."
                        </p>
                    </div>

                    <div className="space-y-3.5">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                                    <f.icon className="w-4 h-4 text-[#C4D6B0]" />
                                </div>
                                <span className="font-sans text-sm font-medium tracking-wide text-white/85">{f.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Form panel ── */}
            <div className="flex-1 flex items-center justify-center px-5 pt-32 pb-16 sm:px-10 lg:px-16 xl:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile brand */}
                    <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
                        <img src={chailogo} alt="Chai Adda" className="w-11 h-11 object-contain" />
                        <span className="font-sans font-black text-lg text-[#22382B] tracking-wide">CHAI ADDA</span>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 mt-6 rounded-full border border-[#385040]/20 bg-white/60 text-[#385040]/80 text-[10px] font-sans font-bold uppercase tracking-[0.3em] mb-4">
                            Member Login
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#22382B] mb-2">Sign In</h1>
                        <p className="text-gray-500 text-sm">Welcome back — enter your details to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <FloatingInput
                            icon={Mail}
                            type="email"
                            id="email"
                            label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <div>
                            <FloatingInput
                                icon={Lock}
                                type="password"
                                id="password"
                                label="Password"
                                showPasswordToggle
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="flex justify-end mt-2">
                                <Link to="/forgot-password" className="text-xs font-bold text-[#385040] hover:text-[#B08848] transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-900/90 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-[#385040] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#22382B]/20 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>

                        {firebaseEnabled && (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-300/70" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">or</span>
                                    <div className="h-px flex-1 bg-gray-300/70" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading}
                                    className="w-full h-14 rounded-2xl border-2 border-gray-200 bg-white flex items-center justify-center gap-3 font-bold text-[#22382B] hover:border-[#385040] hover:bg-[#385040]/[0.03] transition-all disabled:opacity-70"
                                >
                                    {googleLoading ? (
                                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#385040] rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </form>

                    <p className="text-gray-500 text-sm text-center mt-8">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-[#385040] hover:text-[#B08848] transition-colors">
                            Create Account
                        </Link>
                    </p>

                    <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-gray-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Secured sign-in · Your data stays private
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
