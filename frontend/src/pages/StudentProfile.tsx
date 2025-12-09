import { useEffect, useState } from 'react';
import { Loader2, Save, User, Mail, Calendar, Users, Edit2, X, Image } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { studentService } from '../services/student.service';
import { UpdateStudentPayload } from '../types/student';
import { userService } from '../services/user.service';
import avatar from '../assets/avatar.png';
import { extractErrorMessage, extractFieldErrors } from '../utils/error.utils';

interface GuardianInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
}

export default function StudentProfile() {
    const { student, user, refreshUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [guardian, setGuardian] = useState<GuardianInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: 'MOTHER'
    });

    const avatarOptions = [
        '/avatars/student1.png',
        '/avatars/student2.png',
        '/avatars/student3.png',
        '/avatars/student4.png',
        '/avatars/student5.png',
        '/avatars/student6.png',
        '/avatars/student7.png',
        '/avatars/student8.png'
    ];

    useEffect(() => {
        if (student) {
            setAvatarUrl(student.avatarUrl || avatarOptions[0]);
            setFirstName(student.firstName || '');
            setLastName(student.lastName || '');
            setEmail(student.email || '');
            setDateOfBirth(student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '');
            if (student.guardian) {
                setGuardian({
                    firstName: student.guardian.firstName || '',
                    lastName: student.guardian.lastName || '',
                    email: student.guardian.email || '',
                    phone: student.guardian.phone || '',
                    relationship: student.guardian.relationship || 'MOTHER'
                });
            }
        }
    }, [student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: UpdateStudentPayload = {
                firstName,
                lastName,
                email,
                dateOfBirth: dateOfBirth || undefined,
                guardian: {
                    firstName: guardian.firstName,
                    lastName: guardian.lastName,
                    email: guardian.email,
                    phone: guardian.phone,
                    relationship: guardian.relationship
                }
            };

            await studentService.updateStudent(student.id, payload);
            
            if (user && avatarUrl !== (student.avatarUrl || '')) {
                await userService.updateUser(user.id, { 
                    firstName,
                    lastName,
                    email,
                    avatarUrl 
                });
            }
            
            await refreshUserData();
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err: unknown) {
            console.error('[StudentProfile] Failed to update profile', err);
            
            const fieldErrors = extractFieldErrors(err);
            let errorMessage = 'Failed to update profile. Please try again.';
            
            if (fieldErrors) {
                errorMessage = `Validation errors: ${Object.entries(fieldErrors)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join(', ')}`;
            } else {
                errorMessage = extractErrorMessage(err, 'Failed to update profile. Please try again.');
            }
            
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (student) {
            setAvatarUrl(student.avatarUrl || avatarOptions[0]);
            setFirstName(student.firstName || '');
            setLastName(student.lastName || '');
            setEmail(student.email || '');
            setDateOfBirth(student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '');
            if (student.guardian) {
                setGuardian({
                    firstName: student.guardian.firstName || '',
                    lastName: student.guardian.lastName || '',
                    email: student.guardian.email || '',
                    phone: student.guardian.phone || '',
                    relationship: student.guardian.relationship || 'MOTHER'
                });
            }
        }
        setIsEditing(false);
        setError(null);
        setSuccess(null);
    };

    if (!student || !user) {
        return (
            <Layout title="Profile" subtitle="Loading your profile...">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    const displayAvatarUrl = student.avatarUrl || avatar;

    return (
        <Layout title="My Profile" subtitle="View and edit your profile information">
            {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
                    <span>{success}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                        <div className="relative">
                            <img
                                src={displayAvatarUrl}
                                alt={`${firstName} ${lastName}`}
                                className="w-24 h-24 rounded-full bg-gray-100 object-cover border-4 border-gray-50"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = avatar;
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {firstName} {lastName}
                            </h2>
                            <p className="text-gray-500 mt-1">Student Account</p>
                        </div>
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Avatar Selection (only when editing) */}
                    {isEditing && (
                        <div className="space-y-4 pb-6 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Image className="w-5 h-5" />
                                Choose Your Avatar
                            </h3>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {avatarOptions.map((avatar) => (
                                    <button
                                        key={avatar}
                                        type="button"
                                        onClick={() => setAvatarUrl(avatar)}
                                        className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200
                                            ${avatarUrl === avatar
                                                ? 'ring-2 ring-blue-400 ring-offset-2 scale-105'
                                                : 'ring-1 ring-gray-200 hover:ring-blue-300 hover:scale-[1.02]'
                                            }`}
                                    >
                                        <img
                                            src={avatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = avatar;
                                            }}
                                        />
                                        {avatarUrl === avatar && (
                                            <div className="absolute inset-0 bg-blue-400/10 flex items-center justify-center">
                                                <span className="text-2xl">✓</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guardian Information */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Guardian Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian First Name
                                </label>
                                <input
                                    type="text"
                                    value={guardian.firstName}
                                    onChange={(e) => setGuardian({ ...guardian, firstName: e.target.value })}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian Last Name
                                </label>
                                <input
                                    type="text"
                                    value={guardian.lastName}
                                    onChange={(e) => setGuardian({ ...guardian, lastName: e.target.value })}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian Email
                                </label>
                                <input
                                    type="email"
                                    value={guardian.email}
                                    onChange={(e) => setGuardian({ ...guardian, email: e.target.value })}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guardian Phone
                                </label>
                                <input
                                    type="tel"
                                    value={guardian.phone}
                                    onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Relationship
                                </label>
                                <select
                                    value={guardian.relationship}
                                    onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value })}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="MOTHER">Mother</option>
                                    <option value="FATHER">Father</option>
                                    <option value="GUARDIAN">Guardian</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info (Read-only) */}
                    {!isEditing && (
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Enrollment Date:</span>
                                    <span className="ml-2 text-gray-900">
                                        {new Date(student.enrollmentDate).toLocaleDateString()}
                                    </span>
                                </div>
                                {student.lastActivityAt && (
                                    <div>
                                        <span className="text-gray-500">Last Activity:</span>
                                        <span className="ml-2 text-gray-900">
                                            {new Date(student.lastActivityAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {student.groupName && (
                                    <div>
                                        <span className="text-gray-500">Group:</span>
                                        <span className="ml-2 text-gray-900">{student.groupName}</span>
                                        {student.groupCode && (
                                            <span className="ml-2 text-gray-400">({student.groupCode})</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </Layout>
    );
}

