import React from 'react';

interface DiscoverLayoutProps {
  children: React.ReactNode;
}

export function DiscoverLayout({ children }: DiscoverLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-os-bg-dark">
      <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
        {children}
      </div>
    </div>
  );
}
