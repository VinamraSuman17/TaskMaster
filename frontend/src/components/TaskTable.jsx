import { useState, useMemo } from "react";
import API from "../api/api.js";
import { 
  Copy, FileText, CheckCircle, XCircle, Clock, PlayCircle, StopCircle, 
  Eye, Trash2, Search, ChevronLeft, ChevronRight, Filter, ArrowDownWideNarrow
} from "lucide-react";

import { toast } from "react-hot-toast";

export default function TaskTable({ tasks, refreshTasks }) {
  const [selectedLogs, setSelectedLogs] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Cancel Task
  const cancelTask = async (id) => {
    if (!confirm("Are you sure you want to cancel this task?")) return;
    try {
      await API.post(`/tasks/${id}/cancel`);
      toast.success("Task Cancelled!");
      refreshTasks();
    } catch (err) {
      toast.error("Cancel Failed");
      console.log(err);
    }
  };

  // ✅ Safe Render Helper
  const safeRender = (value) => {
    if (value === null || value === undefined) return <span className="text-slate-600">—</span>;
    if (typeof value === "object") {
        return (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50 block truncate max-w-[150px]">
                {JSON.stringify(value)}
            </span>
        )
    }
    return <span className="truncate block max-w-[160px]" title={value.toString()}>{value.toString()}</span>;
  };

  // ✅ Status Badge
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
        SUCCESS: <CheckCircle className="w-3 h-3" />,
        FAILED: <XCircle className="w-3 h-3" />,
        RUNNING: <PlayCircle className="w-3 h-3" />,
        SCHEDULED: <Clock className="w-3 h-3" />,
        CANCELLED: <StopCircle className="w-3 h-3" />,
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  // ✅ Result Renderer (PDF Download)
  const renderResult = (task) => {
    if (task.task_type === "generate_report" && task.status === "SUCCESS") {
      return (
        <a
          href={`http://127.0.0.1:8000/download-report/${task.id}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:underline text-[11px] font-medium transition-colors"
        >
          <FileText className="w-3 h-3" />
          PDF
        </a>
      );
    }
    return <div className="text-[11px] text-slate-400">{safeRender(task.result)}</div>;
  };

  // ✅ Logs Modal
  const openLogs = (logs) => {
    setSelectedLogs(logs || "No logs available...");
    setShowLogs(true);
  };

  // ✅ Filtering & Sorting & Pagination Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.task_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks, searchTerm]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );

  return (
    <div className="h-full flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden text-sm">
      
      {/* Header Controls */}
      <div className="flex-none px-4 py-3 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
         <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Tasks
            </h2>
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/10">
                {filteredTasks.length}
            </span>
         </div>

         {/* Search Bar */}
         <div className="relative group w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
                type="text" 
                placeholder="Filter by status, type or ID..." 
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                }}
                className="w-full bg-slate-950 border border-slate-700/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
         </div>
      </div>

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                 <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Task Logs
                 </h3>
                 <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-white transition-colors">
                    <XCircle className="w-5 h-5" />
                 </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border-b border-slate-800">
              {selectedLogs}
            </div>
            <div className="p-3 bg-slate-900 flex justify-end">
                <button
                onClick={() => setShowLogs(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
                >
                Close
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 w-full overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 sticky top-0 z-10 backdrop-blur-md shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                      ID <ArrowDownWideNarrow className="w-3 h-3" />
                  </div>
              </th>
              <th className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">Type</th>
              <th className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">Payload</th>
              <th className="px-4 py-3 font-semibold tracking-wider whitespace-nowrap">Result</th>
              <th className="px-4 py-3 font-semibold tracking-wider text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/30 text-[12px]">
            {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => (
                <tr
                    key={task.id}
                    className="hover:bg-indigo-500/5 transition-colors group"
                >
                    {/* ID */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 text-[11px]">#{task.id.slice(0, 6)}</span>
                        <button 
                            onClick={() => navigator.clipboard.writeText(task.id)}
                            className="text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Copy ID"
                        >
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap">
                    <StatusBadge status={task.status} />
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-300 font-medium">
                    {task.task_type.replace(/_/g, " ")}
                    </td>

                    <td className="px-4 py-2.5 text-slate-400 max-w-[150px] truncate">
                    {safeRender(task.payload)}
                    </td>

                    <td className="px-4 py-2.5 max-w-[150px]">
                        {renderResult(task)}
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                            <button
                                onClick={() => openLogs(task.logs)}
                                className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
                                title="View Logs"
                            >
                                <Eye className="w-3.5 h-3.5" />
                            </button>

                            {(task.status === "SCHEDULED" || task.status === "PENDING") && (
                                <button
                                onClick={() => cancelTask(task.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                                title="Cancel Task"
                                >
                                <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="w-8 h-8 opacity-20" />
                            <p>No tasks found matching "{searchTerm}"</p>
                        </div>
                    </td>
                </tr>
            )}
            
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-800/50 bg-slate-900/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                         <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-6 h-6 rounded-md text-[10px] font-medium transition-colors ${
                                currentPage === page 
                                    ? "bg-indigo-500 text-white" 
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}