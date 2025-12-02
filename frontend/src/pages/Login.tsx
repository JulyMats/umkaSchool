import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';
import { validateEmail, validateLoginPassword } from '../utils/validation.utils';
import { extractErrorMessage } from '../utils/error.utils';
import { PasswordField, Input, Button } from '../components/ui';
import { AnimatedBackground } from '../components/common';
import { SignInRequest } from '../types/auth';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    if (form.errors.email && 
        form.errors.email !== 'Email is required' && 
        form.errors.email !== 'Please enter a valid email address') {
      form.setError('email', '');
    }

    // Client-side validation using existing utilities
    const emailError = validateEmail(values.email);
    const passwordError = validateLoginPassword(values.password);

    // Set validation errors if any
    if (emailError) {
      form.setError('email', emailError);
    }
    if (passwordError) {
      form.setError('password', passwordError);
    }

    // Return early if there are validation errors
    if (emailError || passwordError) {
      return;
    }

    try {
      const credentials: SignInRequest = {
        email: values.email.trim(),
        password: values.password
      };

      await login(credentials);

      //"Remember Me" functionality
      if (values.rememberMe) {  
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Invalid email or password');
      form.setError('email', `API_ERROR:${errorMessage}`);
      throw error; 
    }
  };

  const form = useForm(INITIAL_VALUES, handleLogin);

  // Restore "Remember Me" state from localStorage
  const rememberMeFromStorage = localStorage.getItem('rememberMe') === 'true';
  if (rememberMeFromStorage && !form.values.rememberMe) {
    form.setValue('rememberMe', true);
  }

  return (
    <AnimatedBackground>
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="text-6xl" role="img" aria-label="Graduation cap">🎓</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            UmkaSchool
          </h1>
          <p className="text-gray-700 mt-2 text-lg font-medium">Mental Arithmetic Training</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-pink-200">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block" role="img" aria-label="Waving hand">👋</span>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-gray-600 mt-2">We're so happy to see you again! 🎉</p>
          </div>
          
          {/* Show general error message (for API errors, not validation errors) */}
          {form.errors.email && form.errors.email.startsWith('API_ERROR:') && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 border-2 border-red-200 flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="Sad face">😕</span>
              <span>{form.errors.email.replace('API_ERROR:', '')}</span>
            </div>
          )}

          <form onSubmit={form.handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
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
                className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                disabled={form.isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <PasswordField
                id="password"
                name="password"
                label="Password"
                autoComplete="current-password"
                required
                value={form.values.password}
                onChange={form.handleChange}
                error={form.errors.password}
                placeholder="••••••••"
                className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                disabled={form.isSubmitting}
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me" 
                  name="rememberMe"
                  type="checkbox"
                  checked={form.values.rememberMe}
                  onChange={(e) => {
                    const { name, checked } = e.target;
                    form.setValue(name as keyof LoginFormValues, checked);
                  }}
                  className="h-5 w-5 text-purple-600 rounded border-2 border-pink-300 focus:ring-purple-400 focus:ring-2"
                  disabled={form.isSubmitting}
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded"
                tabIndex={form.isSubmitting ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient-pink"
              size="lg"
              fullWidth
              isLoading={form.isSubmitting}
              loadingText="Signing in..."
              className="rounded-xl font-bold"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign in</span>
              <span role="img" aria-label="Rocket">🚀</span>
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-purple-600 hover:text-purple-800 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded"
                tabIndex={form.isSubmitting ? -1 : 0}
              >
                Sign up now! ✨
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
