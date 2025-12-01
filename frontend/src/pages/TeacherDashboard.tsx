import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Clock, GraduationCap, Layers, Trophy, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { studentService } from '../services/student.service';
import { groupService } from '../services/group.service';
import { homeworkService } from '../services/homework.service';
import { achievementService } from '../services/achievement.service';
import { Student } from '../types/student';
import { Group } from '../types/group';
import { HomeworkAssignmentDetail } from '../types/homework';
import { StudentAchievement } from '../types/achievement';

interface DashboardData {
    students: Student[];
    groups: Group[];
    assignments: HomeworkAssignmentDetail[];
}

interface RecentStudentAchievement extends StudentAchievement {
    studentId: string;
    studentName: string;
}

export default function TeacherDashboard() {
    const { teacher, user, isLoading } = useAuth();
    const [data, setData] = useState<DashboardData>({
        students: [],
        groups: [],
        assignments: []
    });
    const [recentAchievements, setRecentAchievements] = useState<RecentStudentAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!teacher?.id) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const [students, groups, assignments] = await Promise.all([
                    studentService.getStudentsByTeacher(teacher.id),
                    groupService.getGroupsByTeacher(teacher.id),
                    homeworkService.getAssignmentsByTeacher(teacher.id)
                ]);
                setData({ students, groups, assignments });

                // Fetch recent achievements for all students
                const allAchievements: RecentStudentAchievement[] = [];
                for (const student of students) {
                    try {
                        // Get all student achievements and filter recent ones
                        const allStudentAchievements = await achievementService.getStudentAchievements(student.id);
                        // Get achievements from last 30 days
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        
                        const recentAchievements = allStudentAchievements.filter(achievement => {
                            const earnedDate = new Date(achievement.earnedAt);
                            return earnedDate >= thirtyDaysAgo;
                        });
                        
                        const achievementsWithStudentInfo = recentAchievements.map(achievement => ({
                            ...achievement,
                            studentId: student.id,
                            studentName: `${student.firstName} ${student.lastName}`
                        }));
                        allAchievements.push(...achievementsWithStudentInfo);
                    } catch (err) {
                        console.error(`Failed to load achievements for student ${student.id}:`, err);
                    }
                }
                
                // Sort by earned date (most recent first) and take top 4
                const sortedAchievements = allAchievements
                    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
                    .slice(0, 4);
                
                setRecentAchievements(sortedAchievements);
            } catch (err: any) {
                console.error('[TeacherDashboard] Failed to load dashboard data', err);
                setError(err?.message || 'Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [teacher?.id]);

    const metrics = useMemo(() => {
        const activeAssignments = data.assignments.filter(
            (assignment) => assignment.status !== 'COMPLETED'
        );

        const upcomingAssignments = [...activeAssignments]
            .filter((assignment) => assignment.dueDate)
            .sort(
                (a, b) =>
                    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
            .slice(0, 5);

        const recentStudents = [...data.students]
            .filter((student) => student.lastActivityAt)
            .sort(
                (a, b) =>
                    new Date(b.lastActivityAt || '').getTime() -
                    new Date(a.lastActivityAt || '').getTime()
            )
            .slice(0, 5);

        return {
            totalStudents: teacher?.totalStudents ?? data.students.length,
            totalGroups: teacher?.totalGroups ?? data.groups.length,
            activeAssignmentsCount: activeAssignments.length,
            upcomingAssignments,
            recentStudents
        };
    }, [data.assignments, data.groups.length, data.students, teacher?.totalGroups, teacher?.totalStudents]);

    const teacherName =
        teacher?.firstName ||
        user?.firstName ||
        'Teacher';

    if (isLoading || loading) {
        return (
            <Layout title="Teacher Dashboard" subtitle="Loading your data...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                </div>
            </Layout>
        );
    }

    if (!teacher) {
        return (
            <Layout title="Teacher Dashboard" subtitle="Teacher profile required">
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-6">
                    We could not find your teacher profile. Please complete your teacher profile or contact support.
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Teacher Dashboard" subtitle="Error loading data">
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-6">
                    {error}
                </div>
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
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                    emptyMessage="No upcoming deadlines. Great job staying ahead!"
                >
                    <div className="space-y-4">
                        {metrics.upcomingAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {assignment.homeworkTitle}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">
                                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                                    </p>
                                    <span className="inline-flex items-center text-xs text-gray-500">
                                        {assignment.assignedGroupIds.length > 0
                                            ? `${assignment.assignedGroupIds.length} groups`
                                            : `${assignment.assignedStudentIds.length} students`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Recent Student Achievements"
                    icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                    emptyMessage="No recent student achievements."
                >
                    <div className="space-y-3">
                        {recentAchievements.map((achievement) => (
                            <div
                                key={`${achievement.studentId}-${achievement.achievementId}-${achievement.earnedAt}`}
                                className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex-shrink-0">
                                    {achievement.iconUrl ? (
                                        <img
                                            src={achievement.iconUrl}
                                            alt={achievement.name}
                                            className="w-14 h-14 object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Trophy className="w-8 h-8 text-yellow-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">
                                        {achievement.studentName}
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 mt-1">
                                        {achievement.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Achieved: {new Date(achievement.earnedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                title="Group Overview"
                icon={<Layers className="w-5 h-5 text-purple-500" />}
                emptyMessage="You haven't created any groups yet."
                className="mt-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {data.groups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                        >
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
                        </div>
                    ))}
                </div>
            </SectionCard>
        </Layout>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    helperText?: string;
}

function StatCard({ icon, label, value, helperText }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
                <div className="bg-gray-50 rounded-xl p-3">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {helperText && (
                        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface SectionCardProps {
    title: string;
    icon: React.ReactNode;
    emptyMessage: string;
    children?: React.ReactNode;
    className?: string;
}

function SectionCard({ title, icon, emptyMessage, children, className }: SectionCardProps) {
    const hasContent = Array.isArray(children)
        ? children.length > 0
        : !!children;

    return (
        <div className={`bg-gray-50 border border-gray-100 rounded-2xl p-6 ${className || ''}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                    {icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>

            {hasContent && children ? (
                children
            ) : (
                <div className="bg-white border border-dashed border-gray-200 text-gray-500 text-sm rounded-xl p-6 text-center">
                    {emptyMessage}
                </div>
            )}
        </div>
    );
}


