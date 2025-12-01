import { useAuth } from '../contexts/AuthContext';
import StudentProfile from './StudentProfile';
import TeacherProfile from './TeacherProfile';
import { Loader2 } from 'lucide-react';
import Layout from '../components/layout';

export default function Profile() {
    const { user, student, teacher, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Layout title="Profile" subtitle="Loading...">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    if (user?.role === 'TEACHER' && teacher) {
        return <TeacherProfile />;
    }

    if (user?.role === 'STUDENT' && student) {
        return <StudentProfile />;
    }

    return (
        <Layout title="Profile" subtitle="Profile not found">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-gray-600">Unable to load profile. Please try again later.</p>
            </div>
        </Layout>
    );
}

