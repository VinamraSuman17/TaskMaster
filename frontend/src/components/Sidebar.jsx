import { Home, LineChart, FileText, Settings, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: LineChart, label: "Analytics", path: "/analytics" }, // Placeholder
    { icon: FileText, label: "Reports", path: "/reports" }, // Placeholder
    { icon: Settings, label: "Settings", path: "/settings" }, // Placeholder
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">TaskMaster</h1>
          <span className="text-xs text-indigo-400 font-medium">PRO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Menu
        </p>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Profile Snippet */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">Admin User</h4>
            <p className="text-xs text-slate-400 truncate">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
