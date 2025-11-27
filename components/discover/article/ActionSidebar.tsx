import React from 'react';
import { Bookmark, Share2, Link as LinkIcon, Copy, Flag } from 'lucide-react';

export function ActionSidebar() {
  const actions = [
    { icon: <Bookmark className="w-5 h-5" />, label: 'Save', onClick: () => {} },
    { icon: <Share2 className="w-5 h-5" />, label: 'Share', onClick: () => {} },
    { icon: <Copy className="w-5 h-5" />, label: 'Copy', onClick: () => {} },
  ];

  return (
    <div className="hidden md:flex flex-col gap-2 sticky top-8">
      <div className="flex flex-col bg-os-surface-dark rounded-xl p-2 border border-os-border-dark">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="flex items-center gap-3 p-2 rounded-lg text-os-text-secondary-dark hover:text-os-text-primary-dark hover:bg-os-bg-dark transition-colors group relative"
            title={action.label}
          >
            {action.icon}
            <span className="absolute left-full ml-2 px-2 py-1 bg-brand-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {action.label}
            </span>
          </button>
        ))}
         <div className="h-px bg-os-border-dark my-1 mx-2" />
         <button
            className="flex items-center gap-3 p-2 rounded-lg text-os-text-secondary-dark hover:text-red-400 hover:bg-os-bg-dark transition-colors"
            title="Report"
          >
            <Flag className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
}

