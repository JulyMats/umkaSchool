import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profile.service';

interface GuardianInfo {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER';
}

export default function StudentProfileCompletion() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile data state
    const [avatarUrl, setAvatarUrl] = useState('/avatars/student1.png');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [guardian, setGuardian] = useState<GuardianInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        relationship: 'MOTHER'
    });

    const updateGuardian = (field: keyof GuardianInfo, value: string) => {
        setGuardian(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const registrationData = sessionStorage.getItem('registrationData');
        
        if (!registrationData) {
            setError('Registration data not found. Please register first.');
            navigate('/register');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { firstName, lastName, email } = JSON.parse(registrationData);
            await profileService.createStudentProfile({
                firstName,
                lastName,
                email,
                dateOfBirth,
                guardianFirstName: guardian.firstName,
                guardianLastName: guardian.lastName,
                guardianEmail: guardian.email,
                guardianPhone: guardian.phoneNumber,
                guardianRelationship: guardian.relationship,
                avatarUrl
            });

            // Clean up session storage
            sessionStorage.removeItem('registrationData');

            // Redirect to login
            navigate('/login', { 
                state: { 
                    message: 'Profile completed successfully. Please log in.' 
                }
            });
        } catch (err: any) {
            console.error('Error completing profile:', err);
            setError(err.response?.data?.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-lg text-gray-600">Let's get to know you better</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-12">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Avatar Selection */}
                        <div className="space-y-4">
                            <label className="block text-base font-medium text-gray-900 mb-6">
                                Choose Your Avatar
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
                                {avatarOptions.map((avatar) => (
                                    <button
                                        key={avatar}
                                        type="button"
                                        onClick={() => setAvatarUrl(avatar)}
                                        className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-200
                                            ${avatarUrl === avatar
                                                ? 'ring-4 ring-pink-400 ring-offset-2 scale-105'
                                                : 'ring-1 ring-gray-200 hover:ring-pink-300 hover:scale-[1.02]'
                                            }`}
                                    >
                                        <img
                                            src={avatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                        {avatarUrl === avatar && (
                                            <div className="absolute inset-0 bg-pink-400/10 flex items-center justify-center">
                                                <span className="text-2xl">✓</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-base font-medium text-gray-900 mb-3">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        {/* Guardian Information */}
                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Guardian Information</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-base font-medium text-gray-900 mb-3">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={guardian.firstName}
                                            onChange={(e) => updateGuardian('firstName', e.target.value)}
                                            className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base font-medium text-gray-900 mb-3">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={guardian.lastName}
                                            onChange={(e) => updateGuardian('lastName', e.target.value)}
                                            className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-base font-medium text-gray-900 mb-3">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={guardian.email}
                                        onChange={(e) => updateGuardian('email', e.target.value)}
                                        className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                                        placeholder="guardian@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-medium text-gray-900 mb-3">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={guardian.phoneNumber}
                                        onChange={(e) => updateGuardian('phoneNumber', e.target.value)}
                                        className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-medium text-gray-900 mb-3">
                                        Relationship
                                    </label>
                                    <select
                                        required
                                        value={guardian.relationship}
                                        onChange={(e) => updateGuardian('relationship', e.target.value as GuardianInfo['relationship'])}
                                        className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none appearance-none"
                                    >
                                        <option value="MOTHER">Mother</option>
                                        <option value="FATHER">Father</option>
                                        <option value="GUARDIAN">Guardian</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-base">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 px-6 rounded-2xl text-white font-semibold text-lg transition-all duration-200 shadow-sm
                                ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transform hover:scale-[1.02]'
                                }`}
                        >
                            {loading ? 'Saving...' : 'Complete Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}