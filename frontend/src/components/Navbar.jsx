import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
      {/* Search Bar / Breadcrumbs Area */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className="
              block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500
              focus:outline-none focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              sm:text-sm transition-all duration-200
            "
            placeholder="Search tasks, reports..."
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        {/* Logout */}
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}