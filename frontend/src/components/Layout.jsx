import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content Area - Flex column taking remaining width */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Navbar />
        
        {/* Main - Flex-1 to take remaining height, overflow-hidden to contain children */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 w-full h-full p-6 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
