import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-[#2E3348]">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#94A3B8] mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
