import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profile.service';

export default function TeacherProfileCompletion() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile data state
    const [avatarUrl, setAvatarUrl] = useState('/avatars/student1.png');
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
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-lg text-gray-600">Let's set up your teaching profile</p>
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

                        {/* Phone Number */}
                        <div>
                            <label className="block text-base font-medium text-gray-900 mb-3">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        {/* Professional Bio */}
                        <div>
                            <label className="block text-base font-medium text-gray-900 mb-3">
                                Professional Bio
                            </label>
                            <textarea
                                required
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={5}
                                className="w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none resize-none"
                                placeholder="Tell us about your teaching experience and passion for education..."
                            />
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