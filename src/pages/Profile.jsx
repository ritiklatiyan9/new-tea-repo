import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Save, X, Loader2, MessageSquare, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/adminAPI';
import { toast } from 'sonner';
import SEOHelmet from '@/components/SEOHelmet';

const initialsOf = (name) =>
    (name || 'Tea Lover')
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'complaints'
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [loadingComplaints, setLoadingComplaints] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (activeTab === 'complaints') fetchComplaints();
    }, [activeTab]);

    const fetchComplaints = async () => {
        setLoadingComplaints(true);
        try {
            const response = await adminAPI.getUserComplaints();
            const data = response?.data || response;
            setComplaints(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load complaints');
            setComplaints([]);
        } finally {
            setLoadingComplaints(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);

        const result = await updateProfile(data);
        setIsLoading(false);
        if (result.success) setIsEditing(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({ name: user?.name || '', email: user?.email || '' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const tabBtn = (tab, icon, label) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition-colors ${activeTab === tab
                ? 'bg-[#22382B] text-white shadow-lg shadow-[#22382B]/20'
                : 'hover:bg-[#F2EDE3] text-gray-600'
                }`}
        >
            {icon}
            <span className="font-bold text-sm">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-[#F2EDE3]">
            <SEOHelmet
                title="My Profile | Chai Adda"
                description="Manage your Chai Adda profile and preferences."
                url="https://www.chaiadda.co.in/profile"
                noindex={true}
            />
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">

                {/* Header */}
                <motion.div variants={itemVariants} className="mb-8 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#385040]/20 bg-white/50 text-[#385040]/80 text-[10px] font-sans font-bold uppercase tracking-[0.3em]">
                        Chai Adda Member
                    </span>
                    <h1 className="font-display font-bold text-4xl sm:text-5xl text-[#22382B] mt-4">My Account</h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* Sidebar Card */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl shadow-[#22382B]/5 border border-gray-100 sticky top-28 overflow-hidden">
                            {/* Decorative banner */}
                            <div className="h-24 bg-gradient-to-br from-[#2A4233] via-[#385040] to-[#22382B] relative">
                                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C4D6B0 0%, transparent 40%)' }} />
                            </div>

                            <div className="flex flex-col items-center text-center px-6 pb-6 -mt-12">
                                {/* Initials avatar */}
                              

                                <h2 className="font-display font-bold text-xl text-[#22382B] mt-4">{user?.name || 'Tea Lover'}</h2>
                                <p className="text-xs text-gray-500  mt-10 font-medium mt-1 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" />  Email : {user?.email}
                                </p>
                                <span className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user?.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-[#F2EDE3] text-[#385040] border border-[#385040]/15'}`}>
                                    {user?.role === 'admin' ? 'Administrator' : 'Tea Enthusiast'}
                                </span>

                                {/* Navigation Tabs */}
                                <div className="w-full flex flex-col gap-2 mt-6">
                                    {tabBtn('profile', <User className="w-5 h-5" />, 'Profile Details')}
                                    {tabBtn('complaints', <MessageSquare className="w-5 h-5" />, 'My Complaints')}
                                    {user?.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="w-full py-3 px-4 rounded-xl flex items-center gap-3 text-amber-600 hover:bg-amber-50 transition-colors">
                                            <LayoutDashboard className="w-5 h-5" />
                                            <span className="font-bold text-sm">Admin Panel</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-xl shadow-[#22382B]/5 border border-gray-100 min-h-[400px]">
                            {activeTab === 'profile' ? (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="font-display font-bold text-2xl text-[#22382B]">Profile Details</h3>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-6 py-2.5 bg-[#22382B] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#385040] transition-colors"
                                            >
                                                Edit Details
                                            </button>
                                        ) : (
                                            <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#385040] uppercase tracking-wider ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#385040] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    disabled={!isEditing}
                                                    className="w-full bg-[#F2EDE3]/60 border border-gray-200 rounded-xl py-4 pl-12 pr-4 font-medium text-[#22382B] focus:outline-none focus:border-[#385040] focus:ring-1 focus:ring-[#385040] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#385040] uppercase tracking-wider ml-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#385040] transition-colors" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    disabled={!isEditing}
                                                    className="w-full bg-[#F2EDE3]/60 border border-gray-200 rounded-xl py-4 pl-12 pr-4 font-medium text-[#22382B] focus:outline-none focus:border-[#385040] focus:ring-1 focus:ring-[#385040] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Account status row */}
                                        <div className="flex items-center gap-3 rounded-xl bg-[#F2EDE3]/60 border border-gray-100 px-4 py-3">
                                            <ShieldCheck className="w-5 h-5 text-[#385040] shrink-0" />
                                            <p className="text-xs text-gray-500">Your account is secured. Update your details anytime.</p>
                                        </div>

                                        <AnimatePresence>
                                            {isEditing && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                                                    <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="w-full py-4 bg-[#22382B] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#385040] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#22382B]/20 flex items-center justify-center gap-2"
                                                    >
                                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="font-display font-bold text-2xl text-[#22382B]">My Complaints</h3>
                                        <div className="text-sm text-gray-500">{complaints.length} Total</div>
                                    </div>

                                    {loadingComplaints ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#385040]" />
                                        </div>
                                    ) : complaints.length === 0 ? (
                                        <div className="text-center py-12 bg-[#F2EDE3]/50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <MessageSquare className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h4 className="font-bold text-[#22382B] mb-1">No complaints found</h4>
                                            <p className="text-gray-500 text-sm mb-6">You haven't submitted any complaints yet.</p>
                                            <Link to="/complaint" className="px-6 py-2.5 bg-[#22382B] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#385040] transition-colors">
                                                Submit a Complaint
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {complaints.map((complaint) => (
                                                <motion.div
                                                    key={complaint._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${complaint.status === 'open' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                complaint.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                    'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                                }`}>
                                                                {complaint.status}
                                                            </span>
                                                            <span className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <h4 className="font-bold text-lg text-[#22382B] mb-2">{complaint.subject}</h4>
                                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 bg-[#F2EDE3]/50 p-3 rounded-lg">{complaint.message}</p>

                                                    {complaint.adminResponse && (
                                                        <div className="border-t border-gray-100 pt-4 mt-4">
                                                            <p className="text-xs font-bold text-[#385040] uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <MessageSquare className="w-4 h-4" /> Admin Response
                                                            </p>
                                                            <div className="text-gray-800 text-sm leading-relaxed">{complaint.adminResponse}</div>
                                                            {complaint.resolvedAt && (
                                                                <p className="text-xs text-gray-400 mt-2">Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
