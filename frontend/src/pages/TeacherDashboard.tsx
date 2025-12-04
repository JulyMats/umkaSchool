import { useMemo } from 'react';
import { CalendarCheck, Clock, Layers, Trophy, Users } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState, ErrorState, StatCard, SectionCard } from '../components/common';
import { Card } from '../components/ui';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { calculateDashboardMetrics } from '../utils/teacher.utils';
import { AssignmentCard, AchievementCard } from '../components/features/teacher';

export default function TeacherDashboard() {
    const { teacher, user, isLoading } = useAuth();
    const { data, recentAchievements, loading, error } = useTeacherDashboard(teacher?.id);

    const metrics = useMemo(() => {
        return calculateDashboardMetrics(
            data.assignments,
            data.students,
            data.groups,
            teacher?.totalStudents,
            teacher?.totalGroups
        );
    }, [data.assignments, data.students, data.groups, teacher?.totalStudents, teacher?.totalGroups]);

    const teacherName =
        teacher?.firstName ||
        user?.firstName ||
        'Teacher';

    if (isLoading || loading) {
        return (
            <Layout title="Teacher Dashboard" subtitle="Loading your data...">
                <LoadingState message="Loading your dashboard..." />
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Teacher Dashboard" subtitle="Teacher profile required">
                <ErrorState 
                    message="We could not find your teacher profile. Please complete your teacher profile or contact support."
                />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Teacher Dashboard" subtitle="Error loading data">
                <ErrorState message={error} onRetry={() => window.location.reload()} />
            </Layout>
        );
    }

    return (
        <Layout
            title={`Welcome back, ${teacherName}!`}
            subtitle="Monitor your classroom at a glance"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    label="Total Students"
                    value={metrics.totalStudents}
                    helperText="Students assigned to you"
                />
                <StatCard
                    icon={<Layers className="w-6 h-6 text-purple-500" />}
                    label="Active Groups"
                    value={metrics.totalGroups}
                    helperText="Groups under your management"
                />
                <StatCard
                    icon={<CalendarCheck className="w-6 h-6 text-green-500" />}
                    label="Active Assignments"
                    value={metrics.activeAssignmentsCount}
                    helperText="Assignments in progress"
                />
                <StatCard
                    icon={<Clock className="w-6 h-6 text-amber-500" />}
                    label="Upcoming Deadlines"
                    value={metrics.upcomingAssignments.length}
                    helperText="Due within the next week"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <SectionCard
                    title="Upcoming Deadlines"
                    icon={<Clock className="w-6 h-6 text-amber-500" />}
                    emptyMessage="No upcoming deadlines. Great job staying ahead!"
                >
                    <div className="space-y-4">
                        {metrics.upcomingAssignments.map((assignment) => (
                            <AssignmentCard key={assignment.id} assignment={assignment} />
                        ))}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Recent Student Achievements"
                    icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                    emptyMessage="No recent student achievements."
                >
                    <div className="space-y-3">
                        {recentAchievements.map((achievement) => (
                            <AchievementCard
                                key={`${achievement.studentId}-${achievement.achievementId}-${achievement.earnedAt}`}
                                achievement={achievement}
                            />
                        ))}
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                title="Group Overview"
                icon={<Layers className="w-6 h-6 text-purple-500" />}
                emptyMessage="You haven't created any groups yet."
                className="mt-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {data.groups.map((group) => (
                        <Card key={group.id} variant="white" className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {group.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Code: {group.code}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
                                    <Users className="w-4 h-4" />
                                    {group.studentCount} students
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {group.description || 'No description provided.'}
                            </p>
                        </Card>
                    ))}
                </div>
            </SectionCard>
        </Layout>
    );
}



