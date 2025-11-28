'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { BrainSettingsModal } from '@/components/brain/BrainSettingsModal';
import { AddBrainResourceModal, BrainResourceIcon } from '@/components/brain/AddBrainResourceModal';
import { useBrainResources, BrainResource } from '@/hooks/useBrainResources';
import { 
  Settings, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Pencil,
  FolderTree,
  BookOpen,
  PenTool,
  ArrowUpRight,
  Zap
} from 'lucide-react';

// Bento cards for subpages
const brainPages = [
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'System structure and AI configuration',
    href: '/brain/architecture',
    icon: FolderTree,
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    description: 'Identity, messaging, and art direction',
    href: '/brain/brand-identity',
    icon: BookOpen,
  },
  {
    id: 'writing-styles',
    title: 'Writing Styles',
    description: 'Voice and tone guidelines',
    href: '/brain/writing-styles',
    icon: PenTool,
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'System capabilities and configuration',
    href: '/brain/skills',
    icon: Zap,
  },
];

// Resource Card Component
function ResourceCard({ 
  resource, 
  onDelete,
  onEdit
}: { 
  resource: BrainResource; 
  onDelete: (id: string) => void;
  onEdit: (resource: BrainResource) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-3 p-3 rounded-xl bg-os-surface-dark/50 border border-os-border-dark hover:border-brand-aperol/50 hover:bg-os-surface-dark transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-2 rounded-lg bg-os-bg-dark/50 border border-os-border-dark flex-shrink-0">
        <BrainResourceIcon type={resource.icon} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-display font-medium text-brand-vanilla group-hover:text-brand-aperol transition-colors">
          {resource.name}
        </h4>
        <p className="text-xs text-os-text-secondary-dark truncate">
          {new URL(resource.url).hostname}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      
      {showActions && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(resource);
            }}
            className="p-1.5 rounded-full bg-os-surface-dark border border-os-border-dark hover:bg-brand-aperol hover:border-brand-aperol text-os-text-secondary-dark hover:text-white transition-all shadow-lg"
            aria-label="Edit resource"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(resource.id);
            }}
            className="p-1.5 rounded-full bg-os-surface-dark border border-os-border-dark hover:bg-red-600 hover:border-red-600 text-os-text-secondary-dark hover:text-white transition-all shadow-lg"
            aria-label="Delete resource"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </a>
  );
}

// Add Resource Card - Compact version with just plus icon
function AddResourceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-os-border-dark bg-os-surface-dark/30 hover:border-brand-aperol hover:bg-os-surface-dark/50 transition-all"
      title="Add Resource"
    >
      <Plus className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-aperol transition-colors" />
    </button>
  );
}

// Bento Card for subpages
function BentoCard({ item }: { item: typeof brainPages[0] }) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className="group relative h-[260px] flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-os-surface-dark border border-os-border-dark hover:border-brand-aperol/50 hover:bg-os-surface-dark/80 transition-all duration-300 ease-out"
    >
      {/* Top Section: Icon and Arrow */}
      <div className="flex items-start justify-between mb-auto">
        <div className="p-3 rounded-xl bg-os-bg-dark/50 border border-os-border-dark">
          <Icon className="w-6 h-6 text-brand-vanilla" />
        </div>
        <ArrowUpRight className="w-5 h-5 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 translate-x-2 group-hover:translate-y-0 group-hover:translate-x-0" />
      </div>
      
      {/* Bottom Section: Text */}
      <div className="space-y-2 mt-6">
        <h3 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla group-hover:text-brand-aperol transition-colors">
          {item.title}
        </h3>
        <div className="h-10">
          <p className="text-sm md:text-base text-os-text-secondary-dark line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function BrainPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<BrainResource | undefined>();
  
  const { resources, isLoaded, addResource, deleteResource, updateResource } = useBrainResources();

  const handleEditResource = (resource: BrainResource) => {
    setEditingResource(resource);
    setIsAddResourceOpen(true);
  };

  const handleCloseResourceModal = () => {
    setIsAddResourceOpen(false);
    setEditingResource(undefined);
  };

  return (
    <div className="flex h-screen bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
            {/* Page Header */}
            <div className="flex flex-col gap-2 mb-10">
              <div className="flex items-start justify-between w-full">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla">
                  Brain
                </h1>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-3 rounded-xl bg-os-surface-dark hover:bg-os-border-dark border border-os-border-dark transition-colors group"
                  title="Brain Settings"
                >
                  <Settings className="w-5 h-5 text-os-text-secondary-dark group-hover:text-brand-vanilla transition-colors" />
                </button>
              </div>
              <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
                Your brand&apos;s AI knowledge center. Configure Claude with your brand identity, 
                messaging, and writing styles for consistent, on-brand content generation.
              </p>
            </div>

            {/* Bento Cards for Subpages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
              {brainPages.map((page) => (
                <BentoCard key={page.id} item={page} />
              ))}
            </div>

            {/* Claude Resources Section */}
            <section>
              <h2 className="text-xl font-display font-semibold text-brand-vanilla mb-4">
                Resources
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3">
                {isLoaded && resources.map((resource) => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onDelete={deleteResource}
                    onEdit={handleEditResource}
                  />
                ))}
                <AddResourceCard onClick={() => setIsAddResourceOpen(true)} />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <BrainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Add/Edit Resource Modal */}
      <AddBrainResourceModal
        isOpen={isAddResourceOpen}
        onClose={handleCloseResourceModal}
        onAddResource={addResource}
        editResource={editingResource}
        onUpdateResource={updateResource}
      />
    </div>
  );
}
