'use client'
import { useState } from 'react';
import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";
import { ToastContainer } from "../components/ui/toast";
import { ToastProvider, useToastContext } from "./contexts/toast-context";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToastContext();

  return (
    <div
      className="min-h-screen w-screen flex flex-col lg:flex-row bg-transparent"
      // Prevent file drop on whole page
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {/* Mobile menu button */}
      <div className="lg:hidden flex items-center justify-between p-2 bg-white/70 backdrop-blur-xl border-b">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Left sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-30 lg:z-auto
        w-80 sm:w-96 lg:w-[28vw] xl:w-[25vw] 2xl:w-[22vw]
        min-h-screen lg:min-h-screen
        p-3 sm:p-4 lg:p-6
        flex flex-col
        border-r border-slate-200
        bg-white/70 backdrop-blur-xl
        transition-transform duration-300 ease-in-out
        lg:transition-none
      `}>
        <div className="sticky top-0">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-semibold text-slate-800">Files</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="hidden lg:block text-base lg:text-lg font-semibold mb-4 text-slate-800">Files</h2>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-3 sm:p-4">
            <FileUploadComponent />
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right chat section */}
      <div className="flex-1 min-h-screen relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_100%_0%,#e4ecff_0%,transparent_60%),radial-gradient(800px_400px_at_0%_100%,#e8faf2_0%,transparent_60%)]" />
        <div className="h-full">
          <ChatComponent />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
