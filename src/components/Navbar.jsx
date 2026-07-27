import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, ShoppingCart, Search, User, Home, Store, ScrollText, Mail, LogOut, Settings, LayoutDashboard, Package, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cartAPI } from '../services/cartAPI';
import { guestCartService } from '../services/guestCartService';
import chailogo from '../assets/chailogo.webp'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  // Debounced cart count from API
  const debounceRef = useRef(null);
  const updateCartCount = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const { data } = await cartAPI.getCart();
        const items = data.data?.items || [];
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      } catch { setCartCount(0); }
    } else {
      setCartCount(guestCartService.getItemCount());
    }
  }, [isAuthenticated]);

  const debouncedUpdate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(updateCartCount, 300);
  }, [updateCartCount]);

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartUpdated', debouncedUpdate);
    return () => {
      window.removeEventListener('cartUpdated', debouncedUpdate);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [updateCartCount, debouncedUpdate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Store },
    { label: 'Our Story', path: '/about', icon: ScrollText },
    { label: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-12 left-0 right-0 z-50 flex justify-center pt-2 sm:pt-6 px-2 sm:px-4 pointer-events-none"
    >
      <div className={`
        relative bg-white/95 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-2xl px-3 sm:px-6 lg:px-10 py-2.5 sm:py-4 transition-all duration-500 flex items-center justify-between pointer-events-auto w-[96%] sm:w-[90%]
        ${scrolled ? 'max-w-7xl' : 'max-w-6xl'}
      `}>

        {/* Left: Mobile menu toggle + Desktop nav links */}
        <div className="flex items-center gap-2 lg:gap-4 xl:gap-8 min-w-0">
          {/* Mobile Menu Toggle (visible < lg) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors pointer-events-auto"
          >
            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Desktop Navigation Links */}
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="hidden lg:flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase transition-colors group text-black relative py-1"
            >
              {({ isActive }) => (
                <>
                  <link.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-tea-primary' : 'text-black group-hover:text-tea-primary'}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-tea-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 group">
          <div className="w-16 h-12 sm:w-28 sm:h-24 flex items-center justify-center">
            <img src={chailogo} alt="" className="w-full h-full object-contain" style={{ aspectRatio: '1/1', objectFit: 'contain' }} />
          </div>
          <span className="font-sans font-black text-sm sm:text-xl text-black uppercase">
            Chai Adda
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-5">
          {/* Track Order (Desktop Icon) */}
          <Link
            to="/track-order"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 hidden sm:flex items-center justify-center hover:bg-gray-50 transition-all hover:border-tea-primary group"
            title="Track Order"
          >
            <Package className="w-4 h-4 text-black group-hover:text-tea-primary transition-colors" />
          </Link>

          {/* Login Button / Profile Dropdown (Hidden on mobile) */}
          {isAuthenticated ? (
            <div className="relative hidden lg:block" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-gray-200 rounded-full font-bold text-[11px] tracking-widest text-black hover:bg-white transition-all uppercase shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-[#385040] flex items-center justify-center text-white">
                  {user?.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                </div>
                <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1"
                  >
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs font-bold text-[#385040]">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-amber-600 hover:bg-amber-50 transition-colors uppercase tracking-wider border-b border-gray-50">
                        <LayoutDashboard className="w-3 h-3" /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-[#385040] hover:bg-gray-50 transition-colors uppercase tracking-wider">
                      <User className="w-3 h-3" /> Profile
                    </Link>
                    <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-[#385040] hover:bg-gray-50 transition-colors uppercase tracking-wider">
                      <Package className="w-3 h-3" /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider"
                    >
                      <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="px-8 py-2.5 bg-white border border-gray-200 rounded-full font-bold text-[11px] tracking-widest text-black hover:bg-gray-50 transition-colors uppercase hidden lg:block shadow-sm">
              Log In
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all hover:border-tea-primary group">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:text-tea-primary transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-tea-primary text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990] lg:hidden"
              />

              {/* Side Sheet Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[9999] shadow-2xl lg:hidden overflow-y-auto"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Header: Logo + Actions */}
                  <div className="flex items-center justify-between mb-8">
                    {/* Brand Logo */}
                    <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                      <div className="w-16 h-12 flex items-center justify-center">
                        <img src={chailogo} alt="" className="w-full h-full object-contain" style={{ aspectRatio: '1/1', objectFit: 'contain' }} />
                      </div>
                      <span className="font-sans font-black text-lg text-black uppercase">
                        Chai Adda
                      </span>
                    </Link>

                    {/* Actions: Close */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6 text-[#1A1A1A]" />
                      </button>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold uppercase tracking-wider transition-all ${isActive
                            ? 'bg-[#385040] text-white shadow-md'
                            : 'text-[#1A1A1A] hover:bg-gray-50'
                          }`
                        }
                      >
                        <link.icon className={`w-5 h-5 ${({ isActive }) => isActive ? 'text-white' : 'text-[#385040]'}`} />
                        {link.label}
                      </NavLink>
                    ))}
                    {/* Manual Track Order Link for Mobile */}
                    <NavLink
                      to="/track-order"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold uppercase tracking-wider transition-all ${isActive
                          ? 'bg-[#385040] text-white shadow-md'
                          : 'text-[#1A1A1A] hover:bg-gray-50'
                        }`
                      }
                    >
                      <Package className={`w-5 h-5`} />
                      Track Order
                    </NavLink>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-auto pt-8 border-t border-gray-100 space-y-4">
                    {isAuthenticated ? (
                      <>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-amber-100 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-[#FAF9F6] text-[#385040] border border-gray-200 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#F0EEE6] transition-colors"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsOpen(false)}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-[#FAF9F6] text-[#385040] border border-gray-200 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#F0EEE6] transition-colors"
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-red-100 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#385040] transition-colors"
                      >
                        <User className="w-4 h-4" /> Log In
                      </Link>
                    )}

                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        Est. 1974 • Muzaffarnagar
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.nav>
  );
}
