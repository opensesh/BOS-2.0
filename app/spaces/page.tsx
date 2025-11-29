'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SpaceCard } from '@/components/SpaceCard';
import { CreateSpaceModal } from '@/components/spaces/CreateSpaceModal';
import { useSpaces } from '@/hooks/useSpaces';

export default function SpacesPage() {
  const { spaces, exampleSpaces, isLoaded, deleteSpace, createSpace } = useSpaces();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-aperol border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-os-text-secondary-dark">Loading spaces...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
          {/* Page Header */}
          <div className="flex flex-col gap-3 mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla">
              Spaces
            </h1>
            <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
              Organize your research and collaborate with AI-powered workspaces.
            </p>
          </div>

          {/* My Spaces Section */}
          <div className="mb-12">
            <h2 className="text-xl font-display font-semibold text-brand-vanilla mb-6">
              My Spaces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SpaceCard 
                isCreate 
                onCreateClick={() => setShowCreateModal(true)}
              />
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onDelete={deleteSpace}
                />
              ))}
            </div>
          </div>

          {/* Examples Section */}
          <div>
            <h2 className="text-xl font-display font-semibold text-brand-vanilla mb-6">
              Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exampleSpaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createSpace}
      />
    </div>
  );
}
