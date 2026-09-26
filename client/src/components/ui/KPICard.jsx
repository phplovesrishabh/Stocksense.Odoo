import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  alertType, 
  subtitle, 
  trend, 
  onClick 
}) {
  const getAccentColor = () => {
    if (alertType === 'warning') return 'bg-amber-500';
    if (alertType === 'danger') return 'bg-red-500';
    return 'bg-gradient-to-b from-[#4F6EF7] to-[#7C3AED]';
  };

  const getIconColor = () => {
    if (alertType === 'warning') return 'text-amber-500';
    if (alertType === 'danger') return 'text-red-500';
    return 'text-[#4F6EF7]';
  };

  return (
    <div 
      className={clsx(
        "relative bg-[#1A1D27] rounded-xl p-5 border border-[#2E3348] transition-all duration-200 overflow-hidden",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 hover:border-[#4F6EF7]/50"
      )}
      onClick={onClick}
    >
      {/* Left Accent Bar */}
      <div className={clsx("absolute left-0 top-0 bottom-0 w-1", getAccentColor())} />
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-[#94A3B8] flex items-center gap-2">
          {Icon && <Icon className={clsx("w-5 h-5", getIconColor())} />}
          {title}
        </h3>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-[#F1F5F9] tabular-nums tracking-tight">
          {value}
        </span>
        
        {subtitle && (
          <div className="flex items-center text-xs mt-1">
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mr-1" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-red-500 mr-1" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-500 mr-1" />}
            <span className={clsx(
              "text-[#94A3B8]",
              trend === 'up' && "text-emerald-500/80",
              trend === 'down' && "text-red-500/80"
            )}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
