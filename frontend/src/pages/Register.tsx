import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { authService } from '../services/auth.service';
import { SignUpRequest } from '../types/auth';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Register user
      console.log('Sending registration data:', formData);
      const { id, role } = await authService.register(formData);
      console.log('Received from server:', { id, role });
      
      // Store user info for profile completion
      const registrationData = {
        userId: id,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

      // Navigate to profile completion based on role
      if (formData.role === 'STUDENT') {
        console.log('Navigating to student profile completion');
        navigate('/complete-profile/student');
      } else {
        console.log('Navigating to teacher profile completion');
        navigate('/complete-profile/teacher');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative animals */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐼</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦁</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>🐨</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>🐯</div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
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
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 border-2 border-red-200 flex items-center gap-2">
              <span className="text-xl">😕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>👤</span>
                  <span>First Name</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>👤</span>
                  <span>Last Name</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

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
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                placeholder="your.email@example.com"
              />
            </div>

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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600 transition-colors"
                >
                  {showPassword ? 
                    <EyeOff className="w-5 h-5" /> : 
                    <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>🎭</span>
                <span>I am a...</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
              >
                <option value="STUDENT">🎓 Student</option>
                <option value="TEACHER">👨‍🏫 Teacher</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white py-3 rounded-xl hover:from-yellow-500 hover:via-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg font-bold text-lg"
            >
              <UserPlus className="w-5 h-5" />
              <span>Join Us!</span>
              <span>🎉</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-pink-600 hover:text-pink-800 transition-colors">
                Sign in here! ✨
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}