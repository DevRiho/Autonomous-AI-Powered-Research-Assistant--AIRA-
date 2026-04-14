import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Set up Axios Interceptor
axios.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed',
                requiresVerification: error.response?.data?.requiresVerification
            };
        }
    };

    const register = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { email, password });
            // Do not setting user state here because they need to verify
            return { success: true, requiresVerification: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify', { email, code });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Verification failed. Incorrect code.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateProfile = async (fullName, interests) => {
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', { fullName, interests });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Profile update failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyEmail, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
