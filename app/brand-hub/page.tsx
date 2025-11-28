'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useResources } from '@/hooks/useResources';
import { AddResourceModal, ResourceIconPreview } from '@/components/brand-hub/AddResourceModal';
import { BrandResource } from '@/types';
import { 
  Fingerprint, 
  Palette, 
  Type, 
  ImageIcon, 
  FileText,
  ArrowUpRight,
  Plus,
  ExternalLink,
  Trash2,
  Pencil
} from 'lucide-react';

const brandHubItems = [
  {
    id: 'logo',
    title: 'Logo',
    description: 'Brand marks, lockups, and usage guidelines',
    href: '/brand-hub/logo',
    icon: Fingerprint,
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Brand palette and color tokens',
    href: '/brand-hub/colors',
    icon: Palette,
  },
  {
    id: 'fonts',
    title: 'Typography',
    description: 'Type system and font specimens',
    href: '/brand-hub/fonts',
    icon: Type,
  },
  {
    id: 'art-direction',
    title: 'Art Direction',
    description: 'Visual language and imagery',
    href: '/brand-hub/art-direction',
    icon: ImageIcon,
  },
  {
    id: 'guidelines',
    title: 'Guidelines',
    description: 'Complete brand documentation',
    href: '/brand-hub/guidelines',
    icon: FileText,
  },
];

// Compact Resource Card
function ResourceCard({ 
  resource, 
  onDelete,
  onEdit
}: { 
  resource: BrandResource; 
  onDelete: (id: string) => void;
  onEdit: (resource: BrandResource) => void;
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
        <ResourceIconPreview 
          type={resource.icon} 
          lucideIconName={resource.lucideIconName}
          customIconUrl={resource.customIconUrl}
          size="md" 
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-display font-medium text-brand-vanilla truncate group-hover:text-brand-aperol transition-colors">
          {resource.name}
        </h4>
        <p className="text-xs text-os-text-secondary-dark truncate">
          {new URL(resource.url).hostname}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      
      {/* Edit and Delete buttons */}
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

// Add Resource Card
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

function BentoCard({ item }: { item: typeof brandHubItems[0] }) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className="group relative h-[260px] flex flex-col p-6 md:p-8 gap-6 md:gap-8 rounded-2xl bg-os-surface-dark border border-os-border-dark hover:border-brand-aperol/50 hover:bg-os-surface-dark/80 transition-all duration-300 ease-out"
    >
      {/* Top Section: Icon and Arrow */}
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-os-bg-dark/50 border border-os-border-dark">
          <Icon className="w-6 h-6 text-brand-vanilla" />
        </div>
        <ArrowUpRight className="w-5 h-5 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 translate-x-2 group-hover:translate-y-0 group-hover:translate-x-0" />
      </div>
      
      {/* Bottom Section: Text */}
      <div className="space-y-2">
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

export default function BrandHubPage() {
  const { resources, isLoaded, addResource, deleteResource, updateResource } = useResources();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<BrandResource | undefined>();

  const handleEditResource = (resource: BrandResource) => {
    setEditingResource(resource);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingResource(undefined);
  };

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-6xl mx-auto px-6 py-8 md:px-12 md:py-12">
            {/* Page Header */}
            <div className="flex flex-col gap-2 mb-10">
              <div className="flex items-start justify-between w-full">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla">
                  Brand Hub
                </h1>
                {/* Spacer to match Brain page structure if button is added later */}
                <div className="w-10 h-10"></div>
              </div>
              <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
                Your central hub for brand assets, guidelines, and creative resources. 
                Everything you need to build on-brand experiences.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
              {brandHubItems.map((item) => (
                <BentoCard key={item.id} item={item} />
              ))}
            </div>

            {/* Resources Section */}
            <section>
              <h2 className="text-xl font-display font-semibold text-brand-vanilla mb-4">
                Resources
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {isLoaded && resources.map((resource) => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onDelete={deleteResource}
                    onEdit={handleEditResource}
                  />
                ))}
                <AddResourceCard onClick={() => setIsAddModalOpen(true)} />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Add/Edit Resource Modal */}
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAddResource={addResource}
        editResource={editingResource}
        onUpdateResource={updateResource}
      />
    </div>
  );
}
