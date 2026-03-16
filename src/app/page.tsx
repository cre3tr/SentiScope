import Dashboard from "@/components/dashboard/Dashboard";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col p-6 md:p-12 lg:p-24 selection:bg-primary/20">
      
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto space-y-4 mb-16 animate-in fade-in slide-in-from-top-4 duration-700 relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg ring-1 ring-black/5">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">SentiScope</h1>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
          Unlock the powerful insights hidden in your feedback. Drop your raw data and Instantly reveal customer sentiment and emerging themes with elegant visualisations.
        </p>
      </div>

      {/* Main Dashboard Application */}
      <div className="flex-1 w-full max-w-6xl mx-auto relative z-10">
        <Dashboard />
      </div>

    </main>
  );
}
