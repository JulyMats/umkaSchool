import { Home, BookOpen, BarChart3, Book, Zap, Settings, User, LogOut } from "lucide-react";
import avatar from "../assets/avatar.png";

const menuItems = [
  { icon: Home, label: "Home", active: true },
  { icon: BookOpen, label: "Exercises" },
  { icon: BarChart3, label: "Progress" },
  { icon: Book, label: "Homework" },
  { icon: Zap, label: "Daily Challenge" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col justify-between w-64 min-h-screen border-r border-gray-200 p-6">
      <div>
        <div className="mb-6 text-left">
          <h1 className="text-2xl font-bold">UmkaSchool</h1>
          <p className="text-gray-500">Mental Arithmetic</p>
        </div>
        <hr className="border-t border-gray-200 -mx-6 mb-4" />
        <p className="text-sm text-left text-gray-500 mb-2">MENU</p>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer mb-1 ${
                item.active ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4">
        <hr className="border-t border-gray-200 -mx-6 mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <img
            src={avatar}
            alt="profile"
            className="w-10 h-10 rounded-full bg-gray-100"
          />
          <div className="text-left">
            <p className="font-semibold">Alex Johnson</p>
            <p className="text-sm text-gray-500">Student</p>
          </div>
        </div>
        <ul>
          <li className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-3 rounded-lg">
            <User size={18} /> Profile
          </li>
          <li className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-3 rounded-lg">
            <LogOut size={18} /> Logout
          </li>
        </ul>
      </div>
    </div>
  );
}
