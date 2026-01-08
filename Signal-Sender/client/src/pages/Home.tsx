import { useAlertLogs } from "@/hooks/use-alerts";
import { SimulationForm } from "@/components/SimulationForm";
import { EmailConfigForm } from "@/components/EmailConfigForm";
import { LogsTable } from "@/components/LogsTable";
import { StatCard } from "@/components/StatCard";
import { Activity, Bell, Clock, DoorOpen, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: logs } = useAlertLogs();

  // Calculate stats
  const totalAlerts = logs?.filter(l => l.isAlert).length || 0;
  const recentActivity = logs ? logs.length : 0;
  const lastAlert = logs?.find(l => l.isAlert);
  
  // Container animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              SecureGuard <span className="font-light">IoT Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Online
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={item} className="h-full">
              <StatCard
                title="Total Alerts"
                value={totalAlerts}
                icon={<Bell className="h-5 w-5" />}
                description="All time warning events"
                className="border-l-4 border-l-amber-500"
              />
            </motion.div>
            <motion.div variants={item} className="h-full">
              <StatCard
                title="System Events"
                value={recentActivity}
                icon={<Activity className="h-5 w-5" />}
                description="Total logged interactions"
                className="border-l-4 border-l-blue-500"
              />
            </motion.div>
            <motion.div variants={item} className="h-full">
              <StatCard
                title="Last Activity"
                value={logs?.[0] ? new Date(logs[0].timestamp!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                icon={<Clock className="h-5 w-5" />}
                description={logs?.[0] ? `${logs[0].doorStatus === 'open' ? 'Door Opened' : 'Door Closed'}` : "No data"}
                className="border-l-4 border-l-slate-500"
              />
            </motion.div>
          </div>

          {/* Configuration & Simulation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item} className="h-full">
              <EmailConfigForm />
            </motion.div>
            <motion.div variants={item} className="h-full">
              <SimulationForm />
            </motion.div>
          </div>

          {/* Logs Table Row */}
          <motion.div variants={item}>
            <LogsTable />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
