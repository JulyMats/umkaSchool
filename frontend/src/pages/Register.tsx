import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { validateEmail, validateFirstName, validateLastName, validateRegistrationPassword, validateDateOfBirth, validatePhoneNumber } from '../utils/validation.utils';
import { extractErrorMessage } from '../utils/error.utils';
import { Input, PasswordField, Button, AvatarSelector } from '../components/ui';
import { SelectField } from '../components/common';
import { AnimatedBackground } from '../components/common';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER';
  // Student fields
  avatarUrl: string;
  dateOfBirth: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhoneNumber: string;
  guardianRelationship: 'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER';
  // Teacher fields
  phoneNumber: string;
  bio: string;
}

const INITIAL_VALUES: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'STUDENT',
  avatarUrl: '/avatars/student1.png',
  dateOfBirth: '',
  guardianFirstName: '',
  guardianLastName: '',
  guardianEmail: '',
  guardianPhoneNumber: '',
  guardianRelationship: 'MOTHER',
  phoneNumber: '',
  bio: ''
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (values: RegisterFormValues) => {
    if (form.errors.email && 
        form.errors.email !== 'Email is required' && 
        form.errors.email !== 'Please enter a valid email address' &&
        !form.errors.email.startsWith('API_ERROR:')) {
      form.setError('email', '');
    }

    const firstNameError = validateFirstName(values.firstName);
    const lastNameError = validateLastName(values.lastName);
    const emailError = validateEmail(values.email);
    const passwordError = validateRegistrationPassword(values.password);

    let dateOfBirthError: string | null = null;
    let guardianFirstNameError: string | null = null;
    let guardianLastNameError: string | null = null;
    let guardianEmailError: string | null = null;
    let guardianPhoneError: string | null = null;

    if (values.role === 'STUDENT') {
      dateOfBirthError = validateDateOfBirth(values.dateOfBirth);
      guardianFirstNameError = validateFirstName(values.guardianFirstName);
      guardianLastNameError = validateLastName(values.guardianLastName);
      guardianEmailError = validateEmail(values.guardianEmail);
      guardianPhoneError = validatePhoneNumber(values.guardianPhoneNumber);
    }

    if (firstNameError) form.setError('firstName', firstNameError);
    if (lastNameError) form.setError('lastName', lastNameError);
    if (emailError) form.setError('email', emailError);
    if (passwordError) form.setError('password', passwordError);
    if (dateOfBirthError) form.setError('dateOfBirth', dateOfBirthError);
    if (guardianFirstNameError) form.setError('guardianFirstName', guardianFirstNameError);
    if (guardianLastNameError) form.setError('guardianLastName', guardianLastNameError);
    if (guardianEmailError) form.setError('guardianEmail', guardianEmailError);
    if (guardianPhoneError) form.setError('guardianPhoneNumber', guardianPhoneError);

    if (firstNameError || lastNameError || emailError || passwordError ||
        dateOfBirthError || guardianFirstNameError || guardianLastNameError ||
        guardianEmailError || guardianPhoneError) {
      return;
    }

    try {
      const registrationData: any = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        avatarUrl: values.avatarUrl
      };

      if (values.role === 'STUDENT') {
        registrationData.dateOfBirth = values.dateOfBirth;
        registrationData.guardianFirstName = values.guardianFirstName.trim();
        registrationData.guardianLastName = values.guardianLastName.trim();
        registrationData.guardianEmail = values.guardianEmail.trim();
        registrationData.guardianPhone = values.guardianPhoneNumber.trim();
        registrationData.guardianRelationship = values.guardianRelationship;
      } else if (values.role === 'TEACHER') {
        registrationData.phone = values.phoneNumber.trim();
        registrationData.bio = values.bio.trim();
      }

      console.log('Sending registration data:', registrationData);
      await authService.register(registrationData);
      
      try {
        await login({
          email: values.email.trim(),
          password: values.password
        });
        navigate('/dashboard');
      } catch (loginError) {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please log in.'
          }
        });
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
      <div className="w-full max-w-md relative z-10 mx-auto">
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

            {/* Avatar Selector */}
            <div>
              <AvatarSelector
                value={form.values.avatarUrl}
                onChange={(url) => form.setValue('avatarUrl', url)}
                disabled={form.isSubmitting}
              />
            </div>

            {/* Student-specific fields */}
            {form.values.role === 'STUDENT' && (
              <>
                <div>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    label="Date of Birth"
                    required
                    value={form.values.dateOfBirth}
                    onChange={form.handleChange}
                    error={form.errors.dateOfBirth}
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="border-t-2 border-pink-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Guardian Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        id="guardianFirstName"
                        name="guardianFirstName"
                        type="text"
                        label="Guardian First Name"
                        required
                        value={form.values.guardianFirstName}
                        onChange={form.handleChange}
                        error={form.errors.guardianFirstName}
                        placeholder="Jane"
                        className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                        disabled={form.isSubmitting}
                      />
                    </div>
                    <div>
                      <Input
                        id="guardianLastName"
                        name="guardianLastName"
                        type="text"
                        label="Guardian Last Name"
                        required
                        value={form.values.guardianLastName}
                        onChange={form.handleChange}
                        error={form.errors.guardianLastName}
                        placeholder="Doe"
                        className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                        disabled={form.isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Input
                    id="guardianEmail"
                    name="guardianEmail"
                    type="email"
                    label="Guardian Email"
                    required
                    value={form.values.guardianEmail}
                    onChange={form.handleChange}
                    error={form.errors.guardianEmail}
                    placeholder="guardian@example.com"
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="guardianPhoneNumber"
                      name="guardianPhoneNumber"
                      type="tel"
                      label="Guardian Phone"
                      required
                      value={form.values.guardianPhoneNumber}
                      onChange={form.handleChange}
                      error={form.errors.guardianPhoneNumber}
                      placeholder="+1234567890"
                      className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
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
              </>
            )}

            {/* Teacher-specific fields */}
            {form.values.role === 'TEACHER' && (
              <>
                <div>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    label="Phone Number (Optional)"
                    value={form.values.phoneNumber}
                    onChange={form.handleChange}
                    error={form.errors.phoneNumber}
                    placeholder="+1234567890"
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={form.values.bio}
                    onChange={form.handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all resize-none"
                    disabled={form.isSubmitting}
                  />
                </div>
              </>
            )}

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
                className="font-bold text-pink-600 hover:text-pink-800 transition-colors focus:outline-none rounded"
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
