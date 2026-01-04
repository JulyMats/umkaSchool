import { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, TrendingUp, Layers, UserCog } from 'lucide-react';
import Layout from '../components/layout';
import { LoadingState, ErrorState, StatCard } from '../components/common';
import { adminService, AdminDashboardStats } from '../services/admin.service';

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <Layout title="Admin Dashboard" subtitle="Loading statistics...">
                <LoadingState message="Loading dashboard statistics..." />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Admin Dashboard" subtitle="Error loading data">
                <ErrorState message={error} onRetry={() => window.location.reload()} />
            </Layout>
        );
    }

    return (
        <Layout
            title="Admin Dashboard"
            subtitle="Overview of system statistics"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    label="Total Teachers"
                    value={stats?.totalTeachers || 0}
                    helperText="All registered teachers"
                />
                <StatCard
                    icon={<Users className="w-6 h-6 text-emerald-500" />}
                    label="Total Students"
                    value={stats?.totalStudents || 0}
                    helperText="All registered students"
                />
                
                <StatCard
                    icon={<UserCheck className="w-6 h-6 text-blue-500" />}
                    label="Active Teachers"
                    value={stats?.activeTeachers || 0}
                    helperText="Currently active teachers"
                />
                <StatCard
                    icon={<UserCheck className="w-6 h-6 text-emerald-500" />}
                    label="Active Students"
                    value={stats?.activeStudents || 0}
                    helperText="Currently active students"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Layers className="w-6 h-6 text-blue-500" />}
                    label="Total Groups"
                    value={stats?.totalGroups || 0}
                    helperText="All student groups"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
                    label="New Users (Day)"
                    value={stats?.newUsersLastDay || 0}
                    helperText="Registered in last 24 hours"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-amber-500" />}
                    label="New Users (Month)"
                    value={stats?.newUsersLastMonth || 0}
                    helperText="Registered in last 30 days"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-indigo-500" />}
                    label="New Users (Year)"
                    value={stats?.newUsersLastYear || 0}
                    helperText="Registered in last 12 months"
                />
            </div>
        </Layout>
    );
}

