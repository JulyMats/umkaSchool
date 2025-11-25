import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative animals */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐻</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦊</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐰</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐱</div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="text-6xl">🎓</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            UmkaSchool
          </h1>
          <p className="text-gray-700 mt-2 text-lg font-medium">Mental Arithmetic Training</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-pink-200">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">👋</span>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-gray-600 mt-2">We're so happy to see you again! 🎉</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 border-2 border-red-200 flex items-center gap-2">
              <span className="text-xl">😕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>📧</span>
                <span>Email address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>🔒</span>
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? 
                    <EyeOff className="w-5 h-5" /> : 
                    <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me" 
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-5 w-5 text-purple-600 rounded border-2 border-pink-300 focus:ring-purple-400"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 font-medium">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg font-bold text-lg"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign in</span>
              <span>🚀</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-purple-600 hover:text-purple-800 font-bold transition-colors"
              >
                Sign up now! ✨
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}