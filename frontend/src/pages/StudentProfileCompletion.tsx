import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profile.service';
import { useForm } from '../hooks/useForm';
import { validateFirstName, validateLastName, validateEmail, validatePhoneNumber, validateDateOfBirth } from '../utils/validation.utils';
import { extractErrorMessage } from '../utils/error.utils';
import { Input, Button, AvatarSelector } from '../components/ui';
import { SelectField, AnimatedBackground } from '../components/common';

interface StudentProfileFormValues {
    avatarUrl: string;
    dateOfBirth: string;
    guardianFirstName: string;
    guardianLastName: string;
    guardianEmail: string;
    guardianPhoneNumber: string;
    guardianRelationship: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER';
}

const INITIAL_VALUES: StudentProfileFormValues = {
    avatarUrl: '/avatars/student1.png',
    dateOfBirth: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhoneNumber: '',
    guardianRelationship: 'MOTHER'
};


export default function StudentProfileCompletion() {
    const navigate = useNavigate();

    const handleSubmit = async (values: StudentProfileFormValues) => {
        const registrationData = sessionStorage.getItem('registrationData');
        
        if (!registrationData) {
            form.setError('dateOfBirth', 'API_ERROR:Registration data not found. Please register first.');
            setTimeout(() => navigate('/register'), 2000);
            return;
        }

        // Clear previous API errors
        if (form.errors.dateOfBirth?.startsWith('API_ERROR:')) {
            form.setError('dateOfBirth', '');
        }

        // Validate date of birth
        const dateOfBirthError = validateDateOfBirth(values.dateOfBirth);

        // Validate guardian information
        const guardianFirstNameError = validateFirstName(values.guardianFirstName);
        const guardianLastNameError = validateLastName(values.guardianLastName);
        const guardianEmailError = validateEmail(values.guardianEmail);
        const guardianPhoneError = validatePhoneNumber(values.guardianPhoneNumber);

        if (dateOfBirthError) {
            form.setError('dateOfBirth', dateOfBirthError);
        }

        if (guardianFirstNameError) {
            form.setError('guardianFirstName', guardianFirstNameError);
        }

        if (guardianLastNameError) {
            form.setError('guardianLastName', guardianLastNameError);
        }
        
        if (guardianEmailError) {
            form.setError('guardianEmail', guardianEmailError);
        }

        if (guardianPhoneError) {
            form.setError('guardianPhoneNumber', guardianPhoneError);
        }

        // Return early if there are validation errors
        if (
            dateOfBirthError || 
            guardianFirstNameError || 
            guardianLastNameError || 
            guardianEmailError || 
            guardianPhoneError
        ) {
            return;
        }

        try {
            const { firstName, lastName, email } = JSON.parse(registrationData);
            await profileService.createStudentProfile({
                firstName,
                lastName,
                email,
                dateOfBirth: values.dateOfBirth,
                guardianFirstName: values.guardianFirstName.trim(),
                guardianLastName: values.guardianLastName.trim(),
                guardianEmail: values.guardianEmail.trim(),
                guardianPhone: values.guardianPhoneNumber.trim(),
                guardianRelationship: values.guardianRelationship,
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
            form.setError('dateOfBirth', `API_ERROR:${errorMessage}`);
            throw error;
        }
    };

    const form = useForm(INITIAL_VALUES, handleSubmit);

    const apiError = form.errors.dateOfBirth?.startsWith('API_ERROR:') 
        ? form.errors.dateOfBirth.replace('API_ERROR:', '') 
        : null;

    return (
        <AnimatedBackground>
            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-lg text-gray-600">Let's get to know you better</p>
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

                        {/* Date of Birth */}
                        <div>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                label="Date of Birth"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                value={form.values.dateOfBirth}
                                onChange={form.handleChange}
                                error={form.errors.dateOfBirth && !form.errors.dateOfBirth.startsWith('API_ERROR:') ? form.errors.dateOfBirth : undefined}
                                className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                disabled={form.isSubmitting}
                            />
                        </div>

                        {/* Guardian Information */}
                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Guardian Information</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            id="guardianFirstName"
                                            name="guardianFirstName"
                                            type="text"
                                            label="First Name"
                                            required
                                            value={form.values.guardianFirstName}
                                            onChange={form.handleChange}
                                            error={form.errors.guardianFirstName}
                                            placeholder="John"
                                            className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                            disabled={form.isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            id="guardianLastName"
                                            name="guardianLastName"
                                            type="text"
                                            label="Last Name"
                                            required
                                            value={form.values.guardianLastName}
                                            onChange={form.handleChange}
                                            error={form.errors.guardianLastName}
                                            placeholder="Doe"
                                            className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                            disabled={form.isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Input
                                        id="guardianEmail"
                                        name="guardianEmail"
                                        type="email"
                                        label="Email"
                                        required
                                        value={form.values.guardianEmail}
                                        onChange={form.handleChange}
                                        error={form.errors.guardianEmail}
                                        placeholder="guardian@example.com"
                                        className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                        disabled={form.isSubmitting}
                                    />
                                </div>

                                <div>
                                    <Input
                                        id="guardianPhoneNumber"
                                        name="guardianPhoneNumber"
                                        type="tel"
                                        label="Phone Number"
                                        required
                                        value={form.values.guardianPhoneNumber}
                                        onChange={form.handleChange}
                                        error={form.errors.guardianPhoneNumber}
                                        placeholder="+48 884950440"
                                        className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                        disabled={form.isSubmitting}
                                    />
                                </div>

                                <div>
                                    <SelectField
                                        name="guardianRelationship"
                                        label="Relationship"
                                        value={form.values.guardianRelationship}
                                        onChange={form.handleChange}
                                        options={[
                                            { value: 'MOTHER', label: 'Mother' },
                                            { value: 'FATHER', label: 'Father' },
                                            { value: 'GUARDIAN', label: 'Guardian' },
                                            { value: 'OTHER', label: 'Other' }
                                        ]}
                                        required
                                        className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                                        disabled={form.isSubmitting}
                                    />
                                </div>
                            </div>
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


