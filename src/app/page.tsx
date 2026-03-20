import Dashboard from "@/components/dashboard/Dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative text-foreground flex flex-col p-6 md:p-12 lg:p-24 selection:bg-primary/20">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50 animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto space-y-4 mb-16 animate-in fade-in slide-in-from-top-4 duration-700 relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-zinc-200/50 dark:bg-zinc-900/50 rounded-full blur-3xl -z-10 transition-colors duration-500" />

        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md text-zinc-800 dark:text-zinc-200 p-2.5 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 transition-colors duration-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 transition-colors duration-500">
            SentiScope
          </h1>
        </div>

        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed transition-colors duration-500">
          Unlock the powerful insights hidden in your feedback. Drop your raw
          data and instantly reveal customer sentiment and emerging themes with
          elegant visualisations.
        </p>
      </div>

      {/* Main Dashboard Application */}
      <div className="flex-1 w-full max-w-6xl mx-auto relative z-10">
        <Dashboard />
      </div>
    </main>
  );
}
