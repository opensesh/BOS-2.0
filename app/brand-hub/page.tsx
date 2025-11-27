'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    preview: '/assets/logos/brandmark-vanilla.svg',
    size: 'large',
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Brand palette and color tokens',
    href: '/brand-hub/colors',
    icon: Palette,
    colors: ['#191919', '#FFFAEE', '#FE5102'],
    size: 'medium',
  },
  {
    id: 'fonts',
    title: 'Typography',
    description: 'Type system and font specimens',
    href: '/brand-hub/fonts',
    icon: Type,
    size: 'medium',
  },
  {
    id: 'art-direction',
    title: 'Art Direction',
    description: 'Visual language and imagery',
    href: '/brand-hub/art-direction',
    icon: ImageIcon,
    size: 'large',
  },
  {
    id: 'guidelines',
    title: 'Guidelines',
    description: 'Complete brand documentation',
    href: '/brand-hub/guidelines',
    icon: FileText,
    size: 'large',
  },
];

// Compact Resource Card - About half the size of brain page cards
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

function BentoCard({ item }: { item: typeof brandHubItems[0] }) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={`
        group relative overflow-hidden rounded-2xl 
        bg-os-surface-dark border border-os-border-dark
        hover:border-brand-aperol/50 hover:bg-os-surface-dark/80
        transition-all duration-300 ease-out
        ${item.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
        ${item.size === 'medium' ? 'md:col-span-1 md:row-span-2' : ''}
        ${item.size === 'small' ? 'md:col-span-2 md:row-span-1' : ''}
      `}
    >
      {/* Background Pattern/Preview */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
        {item.id === 'logo' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={item.preview!}
              alt="Logo preview"
              width={200}
              height={200}
              className="opacity-30 group-hover:opacity-50 transition-opacity group-hover:scale-105 duration-500"
            />
          </div>
        )}
        {item.id === 'colors' && (
          <div className="absolute inset-0 flex">
            {item.colors?.map((color, i) => (
              <div 
                key={i} 
                className="flex-1 h-full" 
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
        {item.id === 'fonts' && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <span className="text-[120px] font-display font-bold text-brand-vanilla/10 select-none">
              Aa
            </span>
          </div>
        )}
        {item.id === 'art-direction' && (
          <div className="absolute inset-0 grid grid-cols-4 gap-1 p-4 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="bg-os-border-dark rounded"
              />
            ))}
          </div>
        )}
        {item.id === 'guidelines' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-24 rounded-lg border-2 border-brand-vanilla/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full p-6 md:p-8 flex flex-col justify-between min-h-[200px]">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-os-bg-dark/50 border border-os-border-dark">
            <Icon className="w-6 h-6 text-brand-vanilla" />
          </div>
          <ArrowUpRight className="w-5 h-5 text-os-text-secondary-dark opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-display font-bold text-brand-vanilla group-hover:text-brand-aperol transition-colors">
            {item.title}
          </h3>
          <p className="text-sm md:text-base text-os-text-secondary-dark">
            {item.description}
          </p>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-aperol/5 to-transparent" />
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
            <div className="flex flex-col gap-3 mb-10">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-vanilla">
                Brand Hub
              </h1>
              <p className="text-base md:text-lg text-os-text-secondary-dark max-w-2xl">
                Your central hub for brand assets, guidelines, and creative resources. 
                Everything you need to build on-brand experiences.
              </p>
            </div>

            {/* Resources Section */}
            <section className="mb-10">
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

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-fr gap-4 md:gap-6 md:max-h-[calc(100vh-24rem)]">
              {brandHubItems.map((item) => (
                <BentoCard key={item.id} item={item} />
              ))}
            </div>
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

