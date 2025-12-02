import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profile.service';
import { useForm } from '../hooks/useForm';
import { validatePhoneNumber, validateBio } from '../utils/validation.utils';
import { extractErrorMessage } from '../utils/error.utils';
import { Input, Button, AvatarSelector } from '../components/ui';
import { AnimatedBackground } from '../components/common';

interface TeacherProfileFormValues {
    avatarUrl: string;
    phoneNumber: string;
    bio: string;
}

const INITIAL_VALUES: TeacherProfileFormValues = {
    avatarUrl: '/avatars/student1.png',
    phoneNumber: '',
    bio: ''
};


export default function TeacherProfileCompletion() {
    const navigate = useNavigate();

    const handleSubmit = async (values: TeacherProfileFormValues) => {
        const registrationData = sessionStorage.getItem('registrationData');
        
        if (!registrationData) {
            form.setError('phoneNumber', 'API_ERROR:Registration data not found. Please register first.');
            setTimeout(() => navigate('/register'), 2000);
            return;
        }

        const phoneNumberError = validatePhoneNumber(values.phoneNumber);
        const bioError = validateBio(values.bio);

        if (phoneNumberError) {
            form.setError('phoneNumber', phoneNumberError);
        }

        if (bioError) {
            form.setError('bio', bioError);
        }

        // Return early if there are validation errors
        if (phoneNumberError || bioError) {
            return;
        }

        try {
            const { firstName, lastName, email } = JSON.parse(registrationData);
            await profileService.createTeacherProfile({
                firstName,
                lastName,
                email,
                phone: values.phoneNumber.trim(),
                bio: values.bio.trim(),
                avatarUrl: values.avatarUrl
            });

            // Clean up session storage
            sessionStorage.removeItem('registrationData');

            // Redirect to login
            navigate('/login', { 
                state: { 
                    message: 'Profile completed successfully. Please log in.' 
                }
            });
        } catch (error: unknown) {
            const errorMessage = extractErrorMessage(error, 'Failed to complete profile');
            form.setError('phoneNumber', `API_ERROR:${errorMessage}`);
            throw error;
        }
    };

    const form = useForm(INITIAL_VALUES, handleSubmit);

    const apiError = form.errors.phoneNumber?.startsWith('API_ERROR:') 
        ? form.errors.phoneNumber.replace('API_ERROR:', '') 
        : null;

    return (
        <AnimatedBackground className="bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-lg text-gray-600">Let's set up your teaching profile</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-12">
                    {apiError && (
                        <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-base mb-6 border-2 border-red-200 flex items-center gap-2">
                            <span className="text-xl" role="img" aria-label="Sad face">😕</span>
                            <span>{apiError}</span>
                        </div>
                    )}

                    <form onSubmit={form.handleSubmit} className="space-y-10" noValidate>
                        {/* Avatar Selection */}
                        <AvatarSelector
                            value={form.values.avatarUrl}
                            onChange={(avatarUrl) => form.setValue('avatarUrl', avatarUrl)}
                            disabled={form.isSubmitting}
                            size="md"
                            layout="grid"
                        />

                        {/* Phone Number */}
                        <div>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                label="Phone Number"
                                required
                                value={form.values.phoneNumber}
                                onChange={form.handleChange}
                                error={form.errors.phoneNumber && !form.errors.phoneNumber.startsWith('API_ERROR:') ? form.errors.phoneNumber : undefined}
                                placeholder="+48 898989456"
                                className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                disabled={form.isSubmitting}
                            />
                        </div>

                        {/* Professional Bio */}
                        <div>
                            <label htmlFor="bio" className="block text-base font-medium text-gray-900 mb-3">
                                Professional Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                required
                                value={form.values.bio}
                                onChange={(e) => form.setValue('bio', e.target.value)}
                                rows={5}
                                className={`w-full px-5 py-4 text-base bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all outline-none resize-none
                                    ${form.errors.bio ? 'border-red-500' : ''}
                                    ${form.isSubmitting ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''}
                                `}
                                placeholder="Tell us about your teaching experience and passion for education..."
                                disabled={form.isSubmitting}
                            />
                            {form.errors.bio && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.bio}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="gradient-pink"
                            size="lg"
                            fullWidth
                            isLoading={form.isSubmitting}
                            loadingText="Saving..."
                            className="rounded-xl font-bold"
                        >
                            Complete Profile
                        </Button>
                    </form>
                </div>
            </div>
        </AnimatedBackground>
    );
}
