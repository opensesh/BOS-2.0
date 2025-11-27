'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import * as LucideIcons from 'lucide-react';
import { Search, Upload } from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  onUploadIcon?: (file: File) => void;
}

// Popular Lucide icons for quick access
const POPULAR_ICONS = [
  'Globe', 'Mail', 'MessageSquare', 'Phone', 'MapPin', 'Calendar',
  'Clock', 'Heart', 'Star', 'Bookmark', 'Tag', 'Share2',
  'Link', 'Download', 'Upload', 'File', 'Folder', 'Image',
  'Video', 'Music', 'Mic', 'Camera', 'Tool', 'Settings',
  'User', 'Users', 'Building', 'Home', 'Store', 'Package',
  'ShoppingCart', 'CreditCard', 'DollarSign', 'TrendingUp', 'BarChart', 'PieChart',
];

export function IconPickerModal({
  isOpen,
  onClose,
  onSelectIcon,
  onUploadIcon,
}: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'popular' | 'all' | 'upload'>('popular');

  // Get all Lucide icon names
  const allIconNames = Object.keys(LucideIcons).filter(
    (key) => key !== 'createLucideIcon' && key !== 'default'
  );

  // Filter icons based on search
  const filteredIcons = selectedTab === 'popular' 
    ? POPULAR_ICONS.filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allIconNames.filter(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleIconClick = (iconName: string) => {
    onSelectIcon(iconName);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadIcon) {
      onUploadIcon(file);
      onClose();
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as any;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose an Icon" size="lg">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-os-border-dark">
        <button
          onClick={() => setSelectedTab('popular')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            selectedTab === 'popular'
              ? 'text-brand-aperol border-b-2 border-brand-aperol'
              : 'text-os-text-secondary-dark hover:text-brand-vanilla'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            selectedTab === 'all'
              ? 'text-brand-aperol border-b-2 border-brand-aperol'
              : 'text-os-text-secondary-dark hover:text-brand-vanilla'
          }`}
        >
          All Icons ({allIconNames.length})
        </button>
        <button
          onClick={() => setSelectedTab('upload')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            selectedTab === 'upload'
              ? 'text-brand-aperol border-b-2 border-brand-aperol'
              : 'text-os-text-secondary-dark hover:text-brand-vanilla'
          }`}
        >
          Upload
        </button>
      </div>

      {selectedTab !== 'upload' ? (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-os-border-dark border border-os-border-dark text-os-text-primary-dark placeholder-os-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol transition-colors"
            />
          </div>

          {/* Icon Grid */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.slice(0, 60).map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => handleIconClick(iconName)}
                  title={iconName}
                  className="p-3 rounded-lg bg-os-border-dark hover:bg-brand-aperol/20 hover:border-brand-aperol border border-transparent transition-all flex items-center justify-center group"
                >
                  {renderIcon(iconName)}
                </button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <p className="text-center text-os-text-secondary-dark py-8">
                No icons found
              </p>
            )}
          </div>
        </>
      ) : (
        /* Upload Section */
        <div className="py-8">
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-os-border-dark rounded-lg hover:border-brand-aperol transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-os-text-secondary-dark mb-4" />
            <span className="text-sm font-medium text-brand-vanilla mb-1">
              Upload Custom Icon
            </span>
            <span className="text-xs text-os-text-secondary-dark">
              PNG, JPG, SVG up to 2MB
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </Modal>
  );
}

