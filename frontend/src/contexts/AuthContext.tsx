import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, SignInRequest, SignUpRequest } from '../services/auth.service';
import { userService, User } from '../services/user.service';
import { studentService, Student } from '../services/student.service';
import { teacherService, Teacher } from '../services/teacher.service';

interface AuthContextType {
    user: User | null;
    student: Student | null;
    teacher: Teacher | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: SignInRequest) => Promise<void>;
    register: (data: SignUpRequest) => Promise<void>;
    logout: () => void;
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
                } catch (error: any) {
                    console.error('[AuthContext] Failed to fetch student data:', error);
                    console.error('[AuthContext] Student fetch error details:', {
                        message: error?.message,
                        response: error?.response?.data,
                        status: error?.response?.status
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
                } catch (error: any) {
                    console.error('[AuthContext] Failed to fetch teacher data:', error);
                    console.error('[AuthContext] Teacher fetch error details:', {
                        message: error?.message,
                        response: error?.response?.data,
                        status: error?.response?.status
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
        } catch (error: any) {
            console.error('[AuthContext] Failed to fetch user data:', error);
            console.error('[AuthContext] User fetch error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
            throw error;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            console.log('[AuthContext] Initializing auth...');
            const token = localStorage.getItem('token');
            const storedEmail = localStorage.getItem('userEmail');
            
            console.log('[AuthContext] Token exists:', !!token);
            console.log('[AuthContext] Stored email:', storedEmail);
            
            if (token) {
                authService.setAuthToken(token);
                setIsAuthenticated(true);
                console.log('[AuthContext] Token set, isAuthenticated = true');
                
                // If we have stored email, fetch user data
                if (storedEmail) {
                    try {
                        console.log('[AuthContext] Fetching user data for email:', storedEmail);
                        await fetchUserData(storedEmail);
                        console.log('[AuthContext] User data fetched successfully');
                    } catch (error: any) {
                        console.error('[AuthContext] Failed to fetch user data on initialization:', error);
                        console.error('[AuthContext] Error details:', {
                            message: error?.message,
                            response: error?.response?.data,
                            status: error?.response?.status
                        });
                        // If fetching fails, clear everything and require re-login
                        localStorage.removeItem('token');
                        localStorage.removeItem('userEmail');
                        setIsAuthenticated(false);
                    }
                } else {
                    console.warn('[AuthContext] No stored email found. User needs to log in again.');
                }
            } else {
                console.log('[AuthContext] No token found');
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
            const token = await authService.login(credentials);
            console.log('[AuthContext] Login successful, token received');
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', credentials.email); // Store email for later use
            console.log('[AuthContext] Token and email stored in localStorage');
            authService.setAuthToken(token);
            setIsAuthenticated(true);
            // Fetch user data after login
            await fetchUserData(credentials.email);
            console.log('[AuthContext] Login complete, user data loaded');
        } catch (error: any) {
            console.error('[AuthContext] Login failed:', error);
            console.error('[AuthContext] Login error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
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
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        authService.setAuthToken(null);
        setUser(null);
        setStudent(null);
        setTeacher(null);
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