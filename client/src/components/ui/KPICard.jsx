import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  alertType, 
  subtitle, 
  trend, 
  onClick,
  delay = 0
}) {
  const getAccentColor = () => {
    if (alertType === 'warning') return 'from-amber-500/20 to-amber-500/0 border-amber-500/50';
    if (alertType === 'danger') return 'from-red-500/20 to-red-500/0 border-red-500/50';
    return 'from-brand-primary/20 to-brand-secondary/5 border-brand-primary/30';
  };

  const getIconColor = () => {
    if (alertType === 'warning') return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
    if (alertType === 'danger') return 'text-red-500 bg-red-500/10 border border-red-500/20';
    return 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={clsx(
        "relative glass-card p-6 overflow-hidden group flex flex-col justify-between min-h-[140px]",
        onClick && "cursor-pointer hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {/* Background Glow */}
      <div className={clsx("absolute inset-0 bg-gradient-to-b opacity-50 pointer-events-none transition-opacity duration-500 group-hover:opacity-100", getAccentColor())} />
      
      {/* Top Border Glow */}
      <div className={clsx("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r", alertType === 'warning' ? "from-amber-500 to-amber-600" : alertType === 'danger' ? "from-red-500 to-red-600" : "from-brand-primary to-brand-secondary")} />
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
          {title}
        </h3>
        {Icon && (
          <div className={clsx("p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-inner", getIconColor())}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-1">
        <span className="font-heading text-4xl font-bold text-white tabular-nums tracking-tight drop-shadow-md">
          {value}
        </span>
        
        {subtitle && (
          <div className="flex items-center text-xs mt-1 font-medium">
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 mr-1" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-red-400 mr-1" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400 mr-1" />}
            <span className={clsx(
              "text-text-secondary",
              trend === 'up' && "text-emerald-400",
              trend === 'down' && "text-red-400"
            )}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
