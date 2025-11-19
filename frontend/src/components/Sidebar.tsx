import {
  Home,
  BookOpen,
  BarChart3,
  Book,
  Zap,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
  Users,
  Layers,
  ClipboardList
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import avatar from "../assets/avatar.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, student, teacher } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/register', { replace: true });
  };

  // Determine menu items based on role
  const menuItems = user?.role === 'TEACHER'
    ? [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Users, label: "Students", path: "/students" },
        { icon: Layers, label: "Groups", path: "/groups" },
        { icon: ClipboardList, label: "Homework", path: "/homework" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ]
    : [
        { icon: Home, label: "Home", path: "/dashboard" },
        { icon: BookOpen, label: "Exercises", path: "/exercises" },
        { icon: BarChart3, label: "Progress", path: "/progress" },
        { icon: Book, label: "Homework", path: "/homework" },
        { icon: Zap, label: "Daily Challenge", path: "/challenges" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ];

  // Get user's full name - prefer role-specific data, fallback to user data
  const firstName = teacher?.firstName || student?.firstName || user?.firstName || '';
  const lastName = teacher?.lastName || student?.lastName || user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';

  // Get avatar - prefer student avatar, then user avatar, then default
  const avatarUrl = student?.avatarUrl || user?.avatarUrl || avatar;

  // Get role display name
  const getRoleDisplayName = () => {
    const role = user?.role;
    if (!role) return 'User';
    switch (role) {
      case 'STUDENT':
        return 'Student';
      case 'TEACHER':
        return 'Teacher';
      case 'ADMIN':
        return 'Admin';
      default:
        return role;
    }
  };

  return (
    <div className="flex flex-col justify-between w-64 h-screen border-r border-gray-200 p-6 bg-white fixed left-0 top-0 overflow-y-auto z-10">
      <div>
        <div className="mb-6 text-left">
          <h1 className="text-2xl font-bold">UmkaSchool</h1>
          <p className="text-gray-500">Mental Arithmetic</p>
        </div>
        <hr className="border-t border-gray-200 -mx-6 mb-4" />
        <p className="text-sm text-left text-gray-500 mb-2">MENU</p>
        <ul>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer mb-1 ${
                    isActive ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-blue-500" : ""} />
                  <span className={isActive ? "text-blue-500" : ""}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-4">
        <hr className="border-t border-gray-200 -mx-6 mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <img
            src={avatarUrl}
            alt="profile"
            className="w-10 h-10 rounded-full bg-gray-100 object-cover"
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              (e.target as HTMLImageElement).src = avatar;
            }}
          />
          <div className="text-left flex-1 min-w-0">
            <p className="font-semibold truncate">{fullName}</p>
            <p className="text-sm text-gray-500">{getRoleDisplayName()}</p>
          </div>
        </div>
        <ul>
          <li className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-3 rounded-lg">
            <User size={18} /> Profile
          </li>
          <li 
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-3 rounded-lg"
          >
            <LogOut size={18} /> Logout
          </li>
        </ul>
      </div>
    </div>
  );
}
