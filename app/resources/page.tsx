'use client';

import { Sidebar } from '@/components/Sidebar';

export default function ResourcesPage() {
  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-os-text-primary-dark mb-4">
            Resources
          </h1>
          <p className="text-os-text-secondary-dark">
            This page is coming soon
          </p>
        </div>
      </main>
    </div>
  );
}
