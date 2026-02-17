import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
    LayoutDashboard, Loader2, Download,
    CheckCircle, XCircle, Calendar, Percent, Layers 
} from "lucide-react";

import Layout from "../components/Layout";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  // Stats Calculation
  const total = tasks.length;
  const successCount = tasks.filter(t => t.status === 'SUCCESS').length;
  const failedCount = tasks.filter(t => t.status === 'FAILED').length;
  const scheduledCount = tasks.filter(t => t.status === 'SCHEDULED' || t.status === 'PENDING').length;
  
  const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : "0.0";

  const fetchTasks = async (isBackground = false) => {
    try {
      if (isBackground) setIsRefreshing(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await API.get("/tasks/");
      setTasks(res.data.tasks);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      console.error("Fetch error:", err);
    } finally {
      if (isBackground) {
        setTimeout(() => setIsRefreshing(false), 500); 
      }
      setInitialLoading(false);
    }
  };

  const handleExport = async () => {
    try {
        const response = await API.get("/tasks/export_csv", { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "tasks_export.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Tasks exported as CSV!");
    } catch (err) {
        console.error("Export failed:", err);
        toast.error("Failed to export tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
        fetchTasks(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-full gap-6">
        
        {/* Header & Stats */}
        <div className="flex-none space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            Dashboard Overview
                            {isRefreshing && (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                            )}
                        </h1>
                        <p className="text-slate-400 text-sm">Real-time task monitoring</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Last Updated Indicator */}
                    {lastUpdated && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800 hidden sm:inline-block">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all text-xs font-medium shadow-sm"
                        title="Export Tasks as CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                </div>
             </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    label="Total Tasks" 
                    value={total} 
                    icon={Layers} 
                    color="text-slate-400" 
                    bg="bg-slate-500/10" 
                    borderColor="border-slate-500/20"
                />
                <StatCard 
                    label="Success Rate" 
                    value={`${successRate}%`} 
                    icon={Percent} 
                    color="text-emerald-400" 
                    bg="bg-emerald-500/10" 
                    borderColor="border-emerald-500/20"
                />
                <StatCard 
                    label="Failed Tasks" 
                    value={failedCount} 
                    icon={XCircle} 
                    color="text-red-400" 
                    bg="bg-red-500/10" 
                    borderColor="border-red-500/20"
                />
                <StatCard 
                    label="Upcoming" 
                    value={scheduledCount} 
                    icon={Calendar} 
                    color="text-amber-400" 
                    bg="bg-amber-500/10" 
                    borderColor="border-amber-500/20"
                />
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Task Form */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0">
                 <TaskForm onTaskCreated={() => fetchTasks(true)} />
            </div>

            {/* Right: Task Table */}
            <div className="lg:col-span-8 h-full flex flex-col min-h-0">
                 {initialLoading ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <p>Loading tasks...</p>
                        </div>
                    </div>
                 ) : (
                    <TaskTable tasks={tasks} refreshTasks={() => fetchTasks(true)} />
                 )}
            </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, borderColor }) {
    return (
        <div className={`px-4 py-3 rounded-xl border ${borderColor} ${bg} flex items-center justify-between transition-transform hover:scale-[1.02]`}>
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
                </div>
            </div>
            <div className={`p-2 rounded-lg ${bg} border ${borderColor} backdrop-blur-sm`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
    )
}