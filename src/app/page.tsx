import Dashboard from "@/components/dashboard/Dashboard";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col p-6 md:p-12 lg:p-24 selection:bg-primary/20">
      
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto space-y-4 mb-16 animate-in fade-in slide-in-from-top-4 duration-700 relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-zinc-200/50 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-white/70 backdrop-blur-md text-zinc-800 p-2.5 rounded-2xl shadow-sm border border-zinc-200/50">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">SentiScope</h1>
        </div>
        
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl leading-relaxed">
          Unlock the powerful insights hidden in your feedback. Drop your raw data and instantly reveal customer sentiment and emerging themes with elegant visualisations.
        </p>
      </div>

      {/* Main Dashboard Application */}
      <div className="flex-1 w-full max-w-6xl mx-auto relative z-10">
        <Dashboard />
      </div>

    </main>
  );
}
