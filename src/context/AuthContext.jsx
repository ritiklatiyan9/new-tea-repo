import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';
import axios from 'axios';
import { toast } from 'sonner';
import { guestCartService } from '../services/guestCartService';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(false); // No blocking load
    const [error, setError] = useState(null);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Start by assuming authenticated if token exists
                    // Optionally verify with backend: await authAPI.getCurrentUser();
                    // For now, we'll try to decode or just fetch profile if needed.
                    // If no /me endpoint, we just trust the token until a request 401s.
                    // But to be robust, let's try to restore user state from localStorage if you save user there,
                    // or just set isAuthenticated=true.

                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error("Auth check failed", err);
                    logout();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        console.log("Attempting login with:", credentials.email);
        try {
            const response = await authAPI.login(credentials);
            console.log("Login API Response:", response.data);
            const { accessToken, refreshToken, user } = response.data; // Adjust based on actual API response structure

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                setIsAuthenticated(true);
            }

            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            if (user) {
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
            }

            toast.success("Welcome back!");
            return { success: true };
        } catch (err) {
            console.error("Login error:", err);
            const errorMsg = err.response?.data?.message || 'Login failed';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (credential) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.googleLogin(credential);
            const { accessToken, refreshToken, user } = response.data;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                setIsAuthenticated(true);
            }
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (user) {
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
            }

            toast.success("Welcome!");
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Google sign-in failed';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        console.log("Attempting register for:", userData.email);
        try {
            const response = await authAPI.register(userData);
            console.log("Register API Response:", response.data);
            // Assuming register auto-logs in, or just returns success.
            // If it returns token/user:
            const { accessToken, refreshToken, user } = response.data;
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                setIsAuthenticated(true);
            }

            toast.success("Account created successfully!");
            return { success: true };
        } catch (err) {
            console.error("Registration error:", err);
            const errorMsg = err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        console.log("Initiating logout...");
        try {
            await authAPI.logout();
            console.log("Logout API request successful");
            toast.success("Logged out successfully");
        } catch (err) {
            console.error("Logout error (proceeding anyway):", err);
            // toast.error("Logout issue"); // Optional
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            guestCartService.clearCart();
            // window.location.href = '/login'; // Optional: force redirect or let UI handle it
        }
    };

    const updateProfile = async (formData) => {
        setLoading(true);
        try {
            const response = await authAPI.updateProfile(formData);
            const { user } = response.data;
            if (user) {
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                toast.success("Profile updated successfully!");
                return { success: true };
            }
        } catch (err) {
            console.error("Update profile error:", err);
            const errorMsg = err.response?.data?.message || 'Failed to update profile';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // ... (other imports)

    // ... inside AuthProvider

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile
    };



    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
