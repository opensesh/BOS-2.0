'use client';

import { Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark">
      <Sidebar />
      <main className="flex-1 flex flex-col pt-14 lg:pt-0">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-white/50">Loading...</div></div>}>
          <ChatInterface />
        </Suspense>
      </main>
    </div>
  );
}

