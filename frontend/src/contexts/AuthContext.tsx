import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { studentService } from '../services/student.service';
import { teacherService } from '../services/teacher.service';
import { SignInRequest, SignUpRequest } from '../types/auth';
import { User } from '../types/user';
import { Student } from '../types/student';
import { Teacher } from '../types/teacher';
import { extractErrorMessage, extractErrorStatus } from '../utils/error.utils';

interface AuthContextType {
    user: User | null;
    student: Student | null;
    teacher: Teacher | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: SignInRequest) => Promise<void>;
    register: (data: SignUpRequest) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserData = async (email: string) => {
        try {
            const userData = await userService.getUserByEmail(email);
            setUser(userData);

            // If user is a student, fetch student data
            if (userData.role === 'STUDENT') {
                try {
                    const studentData = await studentService.getStudentByUserId(userData.id);
                    setStudent(studentData);
                    setTeacher(null);
                } catch (error: unknown) {
                    console.error('[AuthContext] Failed to fetch student data:', error);
                    console.error('[AuthContext] Student fetch error details:', {
                        message: extractErrorMessage(error),
                        status: extractErrorStatus(error)
                    });
                    // Student profile might not be created yet
                    setStudent(null);
                    setTeacher(null);
                }
            } else if (userData.role === 'TEACHER') {
                try {
                    const teacherData = await teacherService.getTeacherByUserId(userData.id);
                    setTeacher(teacherData);
                    setStudent(null);
                } catch (error: unknown) {
                    console.error('[AuthContext] Failed to fetch teacher data:', error);
                    console.error('[AuthContext] Teacher fetch error details:', {
                        message: extractErrorMessage(error),
                        status: extractErrorStatus(error)
                    });
                    // Teacher profile might not be created yet
                    setTeacher(null);
                    setStudent(null);
                }
            } else {
                setStudent(null);
                setTeacher(null);
            }
        } catch (error: unknown) {
            console.error('[AuthContext] Failed to fetch user data:', error);
            console.error('[AuthContext] User fetch error details:', {
                message: extractErrorMessage(error),
                status: extractErrorStatus(error)
            });
            throw error;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedEmail = localStorage.getItem('userEmail');
                if (storedEmail) {
                    try {
                        await fetchUserData(storedEmail);
                        setIsAuthenticated(true);
                    } catch (error: unknown) {
                        const errorStatus = extractErrorStatus(error);
                        if (errorStatus === 401) {
                            try {
                                await authService.refreshToken();
                                await fetchUserData(storedEmail);
                                setIsAuthenticated(true);
                            } catch (refreshError) {
                                console.error('[AuthContext] Token refresh failed:', refreshError);
                                localStorage.removeItem('userEmail');
                                setIsAuthenticated(false);
                            }
                        } else {
                            localStorage.removeItem('userEmail');
                            setIsAuthenticated(false);
                        }
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('[AuthContext] Initialization error:', error);
                setIsAuthenticated(false);
            }
            
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const refreshUserData = async () => {
        if (user?.email) {
            await fetchUserData(user.email);
        }
    };

    const login = async (credentials: SignInRequest) => {
        try {
            const loginResponse = await authService.login(credentials);
            localStorage.setItem('userEmail', loginResponse.user.email);
            setIsAuthenticated(true);
            await fetchUserData(loginResponse.user.email);
        } catch (error: unknown) {
            console.error('[AuthContext] Login failed:', error);
            const errorObj = error as { message?: string; response?: { data?: unknown; status?: number } };
            console.error('[AuthContext] Login error details:', {
                message: errorObj?.message,
                response: errorObj?.response?.data,
                status: errorObj?.response?.status
            });
            throw error;
        }
    };

    const register = async (data: SignUpRequest) => {
        try {
            await authService.register(data);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
        } finally {
            localStorage.removeItem('userEmail');
            setUser(null);
            setStudent(null);
            setTeacher(null);
            setIsAuthenticated(false);
        }
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
            student,
            teacher,
            isAuthenticated,
            isLoading,
            login,
            register,
            logout,
            forgotPassword,
            resetPassword,
            refreshUserData
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