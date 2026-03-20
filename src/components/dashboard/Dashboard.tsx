"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Papa from "papaparse";
import { analyzeFeedback, SentimentAnalysisResult } from "@/lib/analyzer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Charting
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  Positive: "#10b981", // Emerald 500
  Neutral: "#6b7280", // Gray 500
  Negative: "#ef4444", // Red 500
};

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SentimentAnalysisResult | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFileText = (text: string, filename: string) => {
    if (filename.endsWith(".csv")) {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as any[];
          // Find the comments column (case-insensitive)
          const commentsCol = Object.keys(data[0] || {}).find(
            (k) =>
              k.toLowerCase().includes("comment") ||
              k.toLowerCase().includes("feedback"),
          );

          if (!commentsCol) {
            setError("CSV must contain a 'comments' or 'feedback' column.");
            setIsAnalyzing(false);
            return;
          }

          const comments = data.map((row) => row[commentsCol]).filter(Boolean);
          const analysis = analyzeFeedback(comments);
          setResults(analysis);
          setIsAnalyzing(false);
        },
        error: (err: Error) => {
          setError(`Failed to parse CSV: ${err.message}`);
          setIsAnalyzing(false);
        },
      });
    } else if (filename.endsWith(".txt")) {
      const comments = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const analysis = analyzeFeedback(comments);
      setResults(analysis);
      setIsAnalyzing(false);
    } else {
      setError("Unsupported file format. Please upload .txt or .csv");
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setError(null);
    if (files.length === 0) return;

    const targetFile = files[0];

    if (
      !targetFile.name.endsWith(".txt") &&
      !targetFile.name.endsWith(".csv")
    ) {
      setError("Please upload a .txt or .csv file.");
      return;
    }

    setFile(targetFile);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processFileText(text, targetFile.name);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setIsAnalyzing(false);
    };
    reader.readAsText(targetFile);
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setError(null);
  };

  // Prepare chart data
  const pieData = results
    ? [
        { name: "Positive", value: results.sentimentCounts.Positive },
        { name: "Neutral", value: results.sentimentCounts.Neutral },
        { name: "Negative", value: results.sentimentCounts.Negative },
      ].filter((d) => d.value > 0)
    : [];

  const barData = results
    ? results.topKeywords.map(([word, count]) => ({
        name: word,
        count: count,
      }))
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Upload Zone */}
      {!results && !isAnalyzing && (
        <Card className={`border-2 border-dashed transition-all duration-300 rounded-3xl ${isDragging ? "border-primary bg-primary/5 scale-[1.02] dark:bg-primary/10" : "border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"}`}>
          <CardContent className="p-12">
            <div
              className="flex flex-col items-center justify-center text-center space-y-6"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Upload Feedback Data
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Drag and drop your{" "}
                  <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-zinc-800 dark:text-zinc-200">
                    .txt
                  </code>{" "}
                  or{" "}
                  <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-zinc-800 dark:text-zinc-200">
                    .csv
                  </code>{" "}
                  file here, or click to browse.
                </p>
              </div>

              {error && (
                <div className="flex items-center text-destructive bg-destructive/10 px-4 py-2 rounded-md font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <label className="cursor-pointer font-semibold shadow-sm inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-primary-foreground transition-colors hover:bg-primary/90">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.csv"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-24 space-y-6">
            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-medium tracking-tight">
                Analyzing Sentiments...
              </h3>
              <p className="text-muted-foreground">
                Reading comments and extracting themes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Analysis Overview
              </h2>
              <div className="flex items-center mt-2 text-zinc-500 dark:text-zinc-400 gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {file?.name}
                </span>
                <span className="text-muted-foreground/50 mx-1">•</span>
                <span>{results.totalComments} comments analyzed</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={reset}
              className="rounded-full shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Another
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sentiment Summary Cards */}
            <Card className="col-span-1 md:col-span-3 lg:col-span-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl transition-colors duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
                  Sentiment Breakdown
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                  Overall feeling across all feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Positive
                    </span>
                    <span className="font-bold text-2xl">
                      {results.sentimentSummary.Positive || "0%"}
                    </span>
                  </div>
                  <Progress
                    value={parseInt(results.sentimentSummary.Positive || "0")}
                    className="h-2 bg-emerald-100 dark:bg-emerald-950 [&>div]:bg-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-gray-600 dark:text-gray-400 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                      Neutral
                    </span>
                    <span className="font-bold text-2xl">
                      {results.sentimentSummary.Neutral || "0%"}
                    </span>
                  </div>
                  <Progress
                    value={parseInt(results.sentimentSummary.Neutral || "0")}
                    className="h-2 bg-gray-100 dark:bg-gray-800 [&>div]:bg-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-red-600 dark:text-red-400 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                      Negative
                    </span>
                    <span className="font-bold text-2xl">
                      {results.sentimentSummary.Negative || "0%"}
                    </span>
                  </div>
                  <Progress
                    value={parseInt(results.sentimentSummary.Negative || "0")}
                    className="h-2 bg-red-100 dark:bg-red-950 [&>div]:bg-red-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visual Charts */}
            <Card className="col-span-1 md:col-span-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl transition-colors duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
                  Sentiment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name as keyof typeof COLORS]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} Comments`, "Count"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Themes Bar Chart */}
            <Card className="col-span-1 md:col-span-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl transition-colors duration-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
                  Top Themes
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                  Most frequently mentioned keywords
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] w-full pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "currentColor", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{
                        fill: "currentColor",
                        fontSize: 12,
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
