import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
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
        '/avatars/student4.png'
    ];

    return (
        <Layout title="Complete Your Student Profile" subtitle="Please provide additional information">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Selection */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Choose your avatar
                        </label>
                        <div className="grid grid-cols-4 gap-4">
                            {avatarOptions.map((avatar, index) => (
                                <div
                                    key={avatar}
                                    className={`cursor-pointer rounded-lg p-2 border-2 transition-all
                                        ${avatarUrl === avatar
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-transparent hover:border-gray-300'
                                        }`}
                                    onClick={() => setAvatarUrl(avatar)}
                                >
                                    <img
                                        src={avatar}
                                        alt={`Avatar option ${index + 1}`}
                                        className="w-full h-auto rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            required
                            max={new Date().toISOString().split('T')[0]}
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Guardian Information */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Guardian Information</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={guardian.firstName}
                                        onChange={(e) => updateGuardian('firstName', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={guardian.lastName}
                                        onChange={(e) => updateGuardian('lastName', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={guardian.email}
                                    onChange={(e) => updateGuardian('email', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={guardian.phoneNumber}
                                    onChange={(e) => updateGuardian('phoneNumber', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Relationship
                                </label>
                                <select
                                    required
                                    value={guardian.relationship}
                                    onChange={(e) => updateGuardian('relationship', e.target.value as GuardianInfo['relationship'])}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                            ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}