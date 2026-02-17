import { useState } from "react";
import API from "../api/api.js";
import { 
  Send, Mail, FileText, Calendar, Plus, Sparkles as SparklesIcon, 
  ChevronDown, MessageSquare, AlertCircle 
} from "lucide-react";

export default function TaskForm({ onTaskCreated }) {
  const [taskType, setTaskType] = useState("send_message");
  const [runAt, setRunAt] = useState("");
  const [loading, setLoading] = useState(false);

  // Message
  const [message, setMessage] = useState("");

  // Email
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState(""); 

  // Report
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");

  const taskOptions = [
    { value: "send_message", label: "Send Message", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
    { value: "send_email", label: "Send Email", icon: Mail, color: "text-purple-400", bg: "bg-purple-500/10" },
    { value: "generate_report", label: "Generate Report", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  // Mock contacts for the dropdown
  const contacts = [
    "admin@example.com",
    "manager@example.com",
    "team@example.com",
    "user@example.com"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = {};

      if (taskType === "send_message") payload = message;
      if (taskType === "send_email") payload = { to: toEmail, subject: subject, content: content };
      if (taskType === "generate_report") payload = { title: reportTitle, content: reportContent };

      const formattedRunAt = runAt.replace("T", " ");

      await API.post("/schedule-task/", {
        task_type: taskType,
        run_at: formattedRunAt,
        payload,
      });

      // Reset
      setMessage("");
      setToEmail("");
      setSubject("");
      setContent("");
      setReportTitle("");
      setReportContent("");
      setRunAt("");
      
      onTaskCreated();
      alert("✅ Task Scheduled Successfully!");
    } catch (err) {
      console.log("❌ Schedule Failed:", err.response?.data || err);
      alert("❌ Failed to schedule task");
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = taskOptions.find(opt => opt.value === taskType);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden text-sm">
      {/* Header */}
      <div className="flex-none px-5 py-4 border-b border-slate-800/50 bg-slate-900/80">
        <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Plus className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold text-white">New Task</h2>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Task Type Selector (Custom UI) */}
            <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Task Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {taskOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setTaskType(opt.value)}
                            className={`
                                flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                                ${taskType === opt.value 
                                    ? `bg-slate-800 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-900/10` 
                                    : "bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg ${opt.bg}`}>
                                <opt.icon className={`w-5 h-5 ${opt.color}`} />
                            </div>
                            <span className={`text-[11px] font-medium ${taskType === opt.value ? "text-white" : "text-slate-400"}`}>
                                {opt.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Run At Input */}
            <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex justify-between">
                    <span>Run At (UTC)</span>
                    <span className="text-slate-500 font-mono">YYYY-MM-DD HH:MM</span>
                </label>
                <div className="relative group">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="datetime-local"
                        value={runAt}
                        onChange={(e) => setRunAt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-xs [color-scheme:dark]"
                        required
                    />
                </div>
            </div>

            {/* Dynamic Fields Area */}
            <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-800/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/50">
                    <selectedOption.icon className={`w-4 h-4 ${selectedOption.color}`} />
                    <span className="text-xs font-semibold text-slate-300">{selectedOption.label} Details</span>
                </div>

                {taskType === "send_message" && (
                <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">Message Content</label>
                    <div className="relative">
                        <Send className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            required
                        />
                    </div>
                </div>
                )}

                {taskType === "send_email" && (
                <div className="space-y-4">
                    {/* Recipient with Datalist */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-medium text-slate-400">Recipient</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                list="contacts-list"
                                placeholder="Select or type email..."
                                value={toEmail}
                                onChange={(e) => setToEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                required
                            />
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-600 pointer-events-none" />
                            <datalist id="contacts-list">
                                {contacts.map(contact => (
                                    <option key={contact} value={contact} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-medium text-slate-400">Subject</label>
                        <input
                            type="text"
                            placeholder="Email Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            required
                        />
                    </div>
                     <div className="space-y-2">
                         <label className="text-[11px] font-medium text-slate-400">Body</label>
                         <textarea
                            placeholder="Write your email content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-y"
                            required
                        />
                    </div>
                </div>
                )}

                {taskType === "generate_report" && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-medium text-slate-400">Report Title</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                             <input
                                type="text"
                                placeholder="Monthly Summary, Q1 Report..."
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[11px] font-medium text-slate-400">Report Content / Criteria</label>
                         <textarea
                            placeholder="Details or criteria for the report..."
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px]"
                            required
                        />
                    </div>
                </div>
                )}
            </div>

            <button 
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
            {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                <SparklesIcon className="w-4 h-4" />
                Schedule Task
                </>
            )}
            </button>
        </form>
      </div>
    </div>
  );
}