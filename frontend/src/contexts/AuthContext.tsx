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
            console.log('[AuthContext] fetchUserData called with email:', email);
            const userData = await userService.getUserByEmail(email);
            console.log('[AuthContext] User data received:', { id: userData.id, email: userData.email, role: userData.role });
            setUser(userData);

            // If user is a student, fetch student data
            if (userData.role === 'STUDENT') {
                try {
                    console.log('[AuthContext] User is a student, fetching student data for userId:', userData.id);
                    const studentData = await studentService.getStudentByUserId(userData.id);
                    console.log('[AuthContext] Student data received:', { id: studentData.id, firstName: studentData.firstName, lastName: studentData.lastName });
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
                    console.log('[AuthContext] User is a teacher, fetching teacher data for userId:', userData.id);
                    const teacherData = await teacherService.getTeacherByUserId(userData.id);
                    console.log('[AuthContext] Teacher data received:', { id: teacherData.id, firstName: teacherData.firstName, lastName: teacherData.lastName });
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
                console.log('[AuthContext] User is not a student, role:', userData.role);
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
            console.log('[AuthContext] Initializing auth...');
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            const storedEmail = localStorage.getItem('userEmail');
            
            console.log('[AuthContext] Token exists:', !!token);
            console.log('[AuthContext] Refresh token exists:', !!refreshToken);
            console.log('[AuthContext] Stored email:', storedEmail);
            
            if (token && refreshToken) {
                authService.setAuthToken(token);
                setIsAuthenticated(true);
                console.log('[AuthContext] Token set, isAuthenticated = true');
                
                // If we have stored email, fetch user data
                if (storedEmail) {
                    try {
                        console.log('[AuthContext] Fetching user data for email:', storedEmail);
                        await fetchUserData(storedEmail);
                        console.log('[AuthContext] User data fetched successfully');
                    } catch (error: unknown) {
                        console.error('[AuthContext] Failed to fetch user data on initialization:', error);
                        const errorStatus = extractErrorStatus(error);
                        if (errorStatus === 401) {
                            try {
                                console.log('[AuthContext] Token expired, attempting refresh...');
                                const refreshResponse = await authService.refreshToken(refreshToken);
                                localStorage.setItem('token', refreshResponse.jwtToken);
                                localStorage.setItem('refreshToken', refreshResponse.refreshToken);
                                authService.setAuthToken(refreshResponse.jwtToken);
                                setUser({
                                    id: refreshResponse.user.id,
                                    firstName: refreshResponse.user.firstName,
                                    lastName: refreshResponse.user.lastName,
                                    email: refreshResponse.user.email,
                                    role: refreshResponse.user.role as 'STUDENT' | 'TEACHER' | 'ADMIN'
                                });
                                await fetchUserData(refreshResponse.user.email);
                            } catch (refreshError) {
                                console.error('[AuthContext] Token refresh failed:', refreshError);
                                localStorage.removeItem('token');
                                localStorage.removeItem('refreshToken');
                                localStorage.removeItem('userEmail');
                                setIsAuthenticated(false);
                            }
                        } else {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('userEmail');
                            setIsAuthenticated(false);
                        }
                    }
                } else {
                    console.warn('[AuthContext] No stored email found. User needs to log in again.');
                }
            } else {
                console.log('[AuthContext] No tokens found');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userEmail');
            }
            
            setIsLoading(false);
            console.log('[AuthContext] Initialization complete');
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
            console.log('[AuthContext] Login attempt for email:', credentials.email);
            const loginResponse = await authService.login(credentials);
            console.log('[AuthContext] Login successful, tokens received');
            
            localStorage.setItem('token', loginResponse.jwtToken);
            localStorage.setItem('refreshToken', loginResponse.refreshToken);
            localStorage.setItem('userEmail', loginResponse.user.email);
            
            // Set auth token for API requests
            authService.setAuthToken(loginResponse.jwtToken);
            
            // Set user from login response
            setUser({
                id: loginResponse.user.id,
                firstName: loginResponse.user.firstName,
                lastName: loginResponse.user.lastName,
                email: loginResponse.user.email,
                role: loginResponse.user.role as 'STUDENT' | 'TEACHER' | 'ADMIN'
            });
            
            setIsAuthenticated(true);
            
            await fetchUserData(loginResponse.user.email);
            console.log('[AuthContext] Login complete, user data loaded');
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
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userEmail');
            authService.setAuthToken(null);
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