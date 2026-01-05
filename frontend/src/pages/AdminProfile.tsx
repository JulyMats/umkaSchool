import { useEffect, useState } from 'react';
import { Loader2, Save, User, Mail, Edit2, X, Image } from 'lucide-react';
import Layout from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import avatar from '../assets/avatar.png';
import { extractErrorMessage, extractFieldErrors } from '../utils/error.utils';

export default function AdminProfile() {
    const { user, refreshUserData } = useAuth();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

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
        if (user) {
            setAvatarUrl(user.avatarUrl || avatarOptions[0]);
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await userService.updateUser(user.id, {
                firstName,
                lastName,
                email,
                avatarUrl
            });

            await refreshUserData();
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err: unknown) {
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
        if (user) {
            setAvatarUrl(user.avatarUrl || avatarOptions[0]);
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
        setIsEditing(false);
        setError(null);
        setSuccess(null);
    };

    if (!user) {
        return (
            <Layout title="Profile" subtitle="Loading your profile...">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            </Layout>
        );
    }

    const displayAvatarUrl = user.avatarUrl || avatar;

    return (
        <Layout title="My Profile" subtitle="View and edit your profile information">
            {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3">
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl px-4 py-3">
                    <span>{success}</span>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative flex-shrink-0">
                            <img
                                src={displayAvatarUrl}
                                alt={`${firstName} ${lastName}`}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-700 object-cover border-4 border-gray-50 dark:border-gray-600"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = avatar;
                                }}
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 break-words">
                                {firstName} {lastName}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Admin Account</p>
                        </div>
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>

                    {/* Avatar Selection (only when editing) */}
                    {isEditing && (
                        <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
                                                ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-105'
                                                : 'ring-1 ring-gray-200 dark:ring-gray-600 hover:ring-blue-300 dark:hover:ring-blue-600 hover:scale-[1.02]'
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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Info (Read-only) */}
                    {!isEditing && (
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Member Since:</span>
                                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
                                    <span className={`ml-2 font-medium ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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

