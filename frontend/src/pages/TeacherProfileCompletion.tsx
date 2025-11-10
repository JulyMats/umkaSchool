import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { profileService } from '../services/profile.service';

export default function TeacherProfileCompletion() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile data state
    const [avatarUrl, setAvatarUrl] = useState('/avatars/teacher1.png');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const registrationData = sessionStorage.getItem('registrationData');
        
        if (!registrationData) {
            setError('Registration data not found. Please register first.');
            navigate('/register');
            return;
        }

        const { firstName, lastName, email } = JSON.parse(registrationData);
        setLoading(true);
        setError(null);

        try {
            await profileService.createTeacherProfile({
                firstName,
                lastName,
                email,
                phone: phoneNumber,
                bio,
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
        '/avatars/teacher1.png',
        '/avatars/teacher2.png',
        '/avatars/teacher3.png',
        '/avatars/teacher4.png'
    ];

    return (
        <Layout title="Complete Your Teacher Profile" subtitle="Please provide additional information">
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

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Professional Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Professional Bio
                        </label>
                        <textarea
                            required
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Tell us about your teaching experience..."
                        />
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