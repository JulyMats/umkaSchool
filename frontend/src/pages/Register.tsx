import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { validateEmail, validateFirstName, validateLastName, validateRegistrationPassword } from '../utils/validation.utils';
import { extractErrorMessage } from '../utils/error.utils';
import { Input, PasswordField, Button } from '../components/ui';
import { SelectField } from '../components/common';
import { AnimatedBackground } from '../components/common';
import { authService } from '../services/auth.service';
import { SignUpRequest } from '../types/auth';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER';
}

const INITIAL_VALUES: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'STUDENT'
};

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (values: RegisterFormValues) => {
    if (form.errors.email && 
        form.errors.email !== 'Email is required' && 
        form.errors.email !== 'Please enter a valid email address' &&
        !form.errors.email.startsWith('API_ERROR:')) {
      form.setError('email', '');
    }

    // Client-side validation using existing utilities
    const firstNameError = validateFirstName(values.firstName);
    const lastNameError = validateLastName(values.lastName);
    const emailError = validateEmail(values.email);
    const passwordError = validateRegistrationPassword(values.password);

    // Set validation errors if any
    if (firstNameError) {
      form.setError('firstName', firstNameError);
    }
    if (lastNameError) {
      form.setError('lastName', lastNameError);
    }
    if (emailError) {
      form.setError('email', emailError);
    }
    if (passwordError) {
      form.setError('password', passwordError);
    }

    // Return early if there are validation errors
    if (firstNameError || lastNameError || emailError || passwordError) {
      return;
    }

    try {
      const registrationData: SignUpRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role
      };

      console.log('Sending registration data:', registrationData);
      const { id, role } = await authService.register(registrationData);
      console.log('Received from server:', { id, role });
      
      // Store user info for profile completion
      const profileData = {
        userId: id,
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        role: registrationData.role
      };
      sessionStorage.setItem('registrationData', JSON.stringify(profileData));

      // Navigate to profile completion based on role
      if (registrationData.role === 'STUDENT') {
        console.log('Navigating to student profile completion');
        navigate('/complete-profile/student');
      } else {
        console.log('Navigating to teacher profile completion');
        navigate('/complete-profile/teacher');
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Registration failed');
      form.setError('email', `API_ERROR:${errorMessage}`);
      throw error; 
    }
  };

  const form = useForm(INITIAL_VALUES, handleRegister);

  return (
    <AnimatedBackground className="bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
        <span className="text-6xl" role="img" aria-label="Graduation cap">🎓</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            UmkaSchool
          </h1>
          <p className="text-gray-700 mt-2 text-lg font-medium">Join our learning adventure! 🎈</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-pink-300">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Create your account</h2>
            <p className="text-gray-600 mt-2">Let's start your math journey! 🚀</p>
          </div>

          {/* Show general error message (for API errors, not validation errors) */}
          {form.errors.email && form.errors.email.startsWith('API_ERROR:') && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 border-2 border-red-200 flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="Sad face">😕</span>
              <span>{form.errors.email.replace('API_ERROR:', '')}</span>
            </div>
          )}

          <form onSubmit={form.handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  label="First Name"
                  required
                  value={form.values.firstName}
                  onChange={form.handleChange}
                  error={form.errors.firstName}
                  placeholder="John"
                  className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                  disabled={form.isSubmitting}
                />
              </div>
              <div>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  label="Last Name"
                  required
                  value={form.values.lastName}
                  onChange={form.handleChange}
                  error={form.errors.lastName}
                  placeholder="Doe"
                  className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                  disabled={form.isSubmitting}
                />
              </div>
            </div>

            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                required
                value={form.values.email}
                onChange={form.handleChange}
                error={form.errors.email && !form.errors.email.startsWith('API_ERROR:') ? form.errors.email : undefined}
                placeholder="your.email@example.com"
                className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                disabled={form.isSubmitting}
              />
            </div>

            <div>
              <PasswordField
                id="password"
                name="password"
                label="Password"
                autoComplete="new-password"
                required
                value={form.values.password}
                onChange={form.handleChange}
                error={form.errors.password}
                placeholder="••••••••"
                className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                disabled={form.isSubmitting}
              />
            </div>

            <div>
              <SelectField
                name="role"
                label="I am a..."
                value={form.values.role}
                onChange={form.handleChange}
                options={[
                  { value: 'STUDENT', label: '🎓 Student' },
                  { value: 'TEACHER', label: '👨‍🏫 Teacher' }
                ]}
                required
                className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                disabled={form.isSubmitting}
              />
            </div>

            <Button
              type="submit"
              variant="gradient-yellow"
              size="lg"
              fullWidth
              isLoading={form.isSubmitting}
              loadingText="Creating account..."
              className="rounded-xl font-bold"
            >
              <UserPlus className="w-5 h-5" />
              <span>Join Us!</span>
              <span role="img" aria-label="Party">🎉</span>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-pink-600 hover:text-pink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 rounded"
                tabIndex={form.isSubmitting ? -1 : 0}
              >
                Sign in here! ✨
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
