import React from 'react';
import clsx from 'clsx';

export default function Badge({ status, className }) {
  const normalized = status?.toLowerCase() || '';

  const getBadgeStyle = () => {
    switch (normalized) {
      case 'draft':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'waiting':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ready':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'done':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'pending_approval':
      case 'pending approval':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'in stock':
      case 'in_stock':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'low stock':
      case 'low_stock':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'out of stock':
      case 'out_of_stock':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getLabel = () => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      getBadgeStyle(),
      className
    )}>
      {/* Optional dot indicator */}
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {getLabel()}
    </span>
  );
}
