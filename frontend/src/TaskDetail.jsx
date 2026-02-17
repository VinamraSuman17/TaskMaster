import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "./api/api.js";
import Layout from "./components/Layout";
import { 
    ArrowLeft, CheckCircle, XCircle, Clock, PlayCircle, StopCircle, 
    FileText, Calendar, Server, Terminal, Shield, ChevronRight, Activity 
} from "lucide-react";

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/tasks/${id}`)
      .then((res) => {
        setTask(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="animate-pulse">Loading task details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-center max-w-sm">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Task Not Found</h2>
            <p className="text-slate-500 text-sm mb-6">The task you are looking for does not exist or has been deleted.</p>
            <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const StatusBadge = ({ status }) => {
      const styles = {
        SUCCESS: "bg-green-500/10 text-green-400 border-green-500/20",
        FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
        RUNNING: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
        SCHEDULED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        PENDING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
  
      const icons = {
          SUCCESS: <CheckCircle className="w-4 h-4" />,
          FAILED: <XCircle className="w-4 h-4" />,
          RUNNING: <PlayCircle className="w-4 h-4" />,
          SCHEDULED: <Clock className="w-4 h-4" />,
          CANCELLED: <StopCircle className="w-4 h-4" />,
      }
      
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
            {icons[status] || <Clock className="w-4 h-4" />}
            {status}
        </span>
      );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header Navigation */}
        <div className="flex-none mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-4">
                <div className="p-1.5 rounded-lg bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 
                </div>
                <span className="font-medium text-sm">Back to Dashboard</span>
            </Link>

            <div className="flex items-start justify-between">
                <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Task Details</h1>
                        <StatusBadge status={task.status} />
                     </div>
                     <p className="text-slate-400 flex items-center gap-2 text-sm">
                        <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 select-all">
                            {task.id}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1.5 capitalize">
                            <Activity className="w-3.5 h-3.5" /> 
                            {task.task_type.replace(/_/g, " ")}
                        </span>
                     </p>
                </div>
                
                {/* Actions */}
                {task.task_type === 'generate_report' && task.status === 'SUCCESS' && (
                    <a 
                        href={`http://127.0.0.1:8000/download-report/${task.id}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 transition-all shadow-lg"
                    >
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Download PDF
                    </a>
                )}
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-6">
            
            {/* Left Column: Info & Payload */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Result Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        Execution Result
                    </h3>
                    <div className="bg-black/40 rounded-xl p-4 border border-slate-800/50 font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto">
                        <pre>{typeof task.result === 'object' ? JSON.stringify(task.result, null, 2) : (task.result || "No result available.")}</pre>
                    </div>
                </div>

                {/* Logs Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col max-h-[500px]">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                        <Server className="w-4 h-4 text-amber-400" />
                        System Logs
                    </h3>
                    <div className="flex-1 bg-black/40 rounded-xl p-4 border border-slate-800/50 font-mono text-xs text-slate-400 leading-relaxed overflow-y-auto custom-scrollbar">
                         {task.logs ? (
                            <pre className="whitespace-pre-wrap">{task.logs}</pre>
                         ) : (
                            <p className="text-slate-600 italic">No logs generated for this task.</p>
                         )}
                    </div>
                </div>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6">
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Task Metadata
                    </h3>
                    
                    <div className="space-y-5">
                        <MetadataItem 
                            label="Created At" 
                            value={new Date(task.created_at).toLocaleString()} 
                            icon={Calendar} 
                        />
                         <MetadataItem 
                            label="Scheduled Run" 
                            value={new Date(task.run_at).toLocaleString()} 
                            icon={Clock} 
                        />
                         <MetadataItem 
                            label="Completed At" 
                            value={task.completed_at ? new Date(task.completed_at).toLocaleString() : "—"} 
                            icon={CheckCircle} 
                        />
                         <MetadataItem 
                            label="Retries" 
                            value={`${task.retries} / 3`} 
                            icon={Activity} 
                        />
                    </div>
                </div>

                {/* Payload Accordion Style */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                     <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-purple-400" />
                        Input Payload
                    </h3>
                    <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 font-mono text-xs text-slate-400 overflow-x-auto">
                        <pre>{JSON.stringify(task.payload, null, 2)}</pre>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </Layout>
  );
}

function MetadataItem({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 text-slate-400">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-slate-200 font-medium mt-0.5">{value}</p>
            </div>
        </div>
    )
}