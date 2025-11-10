import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, SignInRequest, SignUpRequest } from '../services/auth.service';

interface User {
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: SignInRequest) => Promise<void>;
    register: (data: SignUpRequest) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authService.setAuthToken(token);
            // You might want to validate the token here or fetch user data
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (credentials: SignInRequest) => {
        try {
            const token = await authService.login(credentials);
            localStorage.setItem('token', token);
            authService.setAuthToken(token);
            setIsAuthenticated(true);
            // You might want to fetch user data here
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (data: SignUpRequest) => {
        try {
            await authService.register(data);
            // After successful registration, log in the user
            await login({
                email: data.email,
                password: data.password
            });
            // You might want to fetch user data here
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        authService.setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const forgotPassword = async (email: string) => {
        await authService.forgotPassword(email);
    };

    const resetPassword = async (token: string, newPassword: string) => {
        await authService.resetPassword(token, newPassword);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            register,
            logout,
            forgotPassword,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}