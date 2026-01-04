import { useAuth } from '../contexts/AuthContext';
import StudentProfile from './StudentProfile';
import TeacherProfile from './TeacherProfile';
import AdminProfile from './AdminProfile';
import Layout from '../components/layout';
import { LoadingState, ErrorState } from '../components/common';

export default function Profile() {
    const { user, student, teacher, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Layout title="Profile" subtitle="Loading...">
                <LoadingState message="Loading your profile..." size="lg" className="h-64" />
            </Layout>
        );
    }

    if (user?.role === 'ADMIN') {
        return <AdminProfile />;
    }

    if (user?.role === 'TEACHER' && teacher) {
        return <TeacherProfile />;
    }

    if (user?.role === 'STUDENT' && student) {
        return <StudentProfile />;
    }

    return (
        <Layout title="Profile" subtitle="Profile not found">
            <ErrorState 
                message="Unable to load profile. Please try again later or contact support if the problem persists." 
                onRetry={() => window.location.reload()}
                retryLabel="Refresh Page"
            />
        </Layout>
    );
}

