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
  ClipboardList,
  X
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import avatar from "../../assets/avatar.png";
import NavMenuItem from "./NavMenuItem";
import { useState, useEffect, useRef } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, student, teacher } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/register', { replace: true });
  };

  const menuItems = user?.role === 'ADMIN'
    ? [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Users, label: "Teachers", path: "/teachers" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ]
    : user?.role === 'TEACHER'
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

  const firstName = teacher?.firstName || student?.firstName || user?.firstName || '';
  const lastName = teacher?.lastName || student?.lastName || user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';

  const avatarUrl = student?.avatarUrl || teacher?.avatarUrl || user?.avatarUrl || avatar;

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

  const prevPathnameRef = useRef(location.pathname);
  useEffect(() => {
    if (isOpen && onClose && prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[55] lg:hidden"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          flex flex-col w-64 h-screen border-r border-gray-200 bg-white 
          fixed left-0 top-0 z-[60]
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-50
          ${isOpen ? '!translate-x-0' : '-translate-x-full lg:!translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors z-10 bg-white shadow-sm"
          aria-label="Close menu"
          type="button"
        >
          <X size={20} className="text-gray-700" />
        </button>

        {/* Scrollable content container */}
        <div 
          className="flex flex-col min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll pr-1"
          style={{
            height: '100%',
            scrollbarWidth: 'thin',
            scrollbarColor: '#94a3b8 #f1f5f9'
          }}
        >
          {/* Top section - Menu items */}
          <div className="p-6 pb-4 flex-shrink-0">
            <div className="mb-6 text-left">
              <h1 className="text-2xl font-bold">UmkaSchool</h1>
              <p className="text-gray-500">Mental Arithmetic</p>
            </div>
            <hr className="border-t border-gray-200 -mx-6 mb-4" />
            <p className="text-sm text-left text-gray-500 mb-2">MENU</p>
            <ul>
              {menuItems.map((item) => (
                <NavMenuItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  onClick={onClose}
                />
              ))}
            </ul>
          </div>

          {/* Bottom section - Profile and Logout */}
          <div className="p-6 pt-4 flex-shrink-0 mt-auto">
            <hr className="border-t border-gray-200 -mx-6 mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <img
                src={avatarUrl}
                alt="profile"
                className="w-10 h-10 rounded-full bg-gray-100 object-cover flex-shrink-0"
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
              <li>
                <Link
                  to="/profile"
                  onClick={onClose}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer mb-1 ${
                    location.pathname === '/profile' ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  <User size={18} className={location.pathname === '/profile' ? "text-blue-500" : ""} />
                  <span className={location.pathname === '/profile' ? "text-blue-500" : ""}>Profile</span>
                </Link>
              </li>
              <li 
                onClick={() => {
                  handleLogout();
                  if (onClose) onClose();
                }}
                className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-3 rounded-lg"
              >
                <LogOut size={18} /> Logout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

