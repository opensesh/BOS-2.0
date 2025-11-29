'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check, Upload, FileText, ImageIcon, Palette, X } from 'lucide-react';
import { Brandmark } from './Brandmark';
import { Brand } from '@/types';

// Default brands - can be extended
const DEFAULT_BRANDS: Brand[] = [
  {
    id: 'open-session',
    name: 'Open Session',
    logoPath: '/assets/logos/brandmark-vanilla.svg',
    isDefault: true,
  },
];

const STORAGE_KEY = 'selected-brand';
const BRANDS_STORAGE_KEY = 'custom-brands';

function getStoredBrands(): Brand[] {
  if (typeof window === 'undefined') return DEFAULT_BRANDS;
  
  try {
    const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (stored) {
      const customBrands = JSON.parse(stored);
      return [...DEFAULT_BRANDS, ...customBrands];
    }
  } catch (error) {
    console.error('Error loading stored brands:', error);
  }
  
  return DEFAULT_BRANDS;
}

function getSelectedBrandId(): string {
  if (typeof window === 'undefined') return DEFAULT_BRANDS[0].id;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const brandId = JSON.parse(stored);
      // Verify brand still exists
      const allBrands = getStoredBrands();
      if (allBrands.find(b => b.id === brandId)) {
        return brandId;
      }
    }
  } catch (error) {
    console.error('Error loading selected brand:', error);
  }
  
  return DEFAULT_BRANDS[0].id;
}

function saveSelectedBrand(brandId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brandId));
  } catch (error) {
    console.error('Error saving selected brand:', error);
  }
}

function saveCustomBrand(brand: Brand): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
    const customBrands = stored ? JSON.parse(stored) : [];
    customBrands.push(brand);
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(customBrands));
  } catch (error) {
    console.error('Error saving custom brand:', error);
  }
}

interface BrandSelectorProps {
  size?: number;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function BrandSelector({ size = 32, className = '', href = '/', onClick }: BrandSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(getStoredBrands());
  const [selectedBrandId, setSelectedBrandId] = useState<string>(getSelectedBrandId());
  const [newBrandName, setNewBrandName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0];

  // Load brands on mount
  useEffect(() => {
    setBrands(getStoredBrands());
    setSelectedBrandId(getSelectedBrandId());
  }, []);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        left: rect.left,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectBrand = useCallback((brandId: string) => {
    setSelectedBrandId(brandId);
    saveSelectedBrand(brandId);
    setIsOpen(false);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddBrand = useCallback(() => {
    if (!newBrandName.trim() || !newCompanyName.trim()) {
      alert('Please provide your name and company name');
      return;
    }

    // For now, use a default logo path or the first uploaded file
    // In the future, this would upload files to a server and get URLs
    const logoPath = uploadedFiles.length > 0 
      ? URL.createObjectURL(uploadedFiles[0]) // Temporary URL for now
      : '/assets/logos/brandmark-vanilla.svg'; // Default fallback

    const newBrand: Brand = {
      id: `custom-${Date.now()}`,
      name: newCompanyName.trim(),
      logoPath: logoPath,
    };

    saveCustomBrand(newBrand);
    setBrands(getStoredBrands());
    handleSelectBrand(newBrand.id);
    setNewBrandName('');
    setNewCompanyName('');
    setUploadedFiles([]);
    setShowAddModal(false);
  }, [newBrandName, newCompanyName, uploadedFiles, handleSelectBrand]);

  return (
    <>
      <div className={`relative flex items-center justify-center group ${className}`}>
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="
            relative z-[70]
            flex items-center justify-center
            w-full h-full p-2
            border border-transparent
            rounded-lg
            hover:bg-os-surface-dark/50
            hover:border-brand-aperol/30
            transition-all duration-200
            cursor-pointer
          "
          aria-label="Select brand"
          title="Select brand"
        >
          {/* Logo - shrinks slightly on hover */}
          <Link
            href={href}
            className="
              flex items-center justify-center
              transition-transform duration-200
              group-hover:scale-90
            "
            onClick={(e) => {
              // Call custom onClick handler if provided
              onClick?.();
              // Don't navigate if clicking the button area
              if (e.target !== e.currentTarget) {
                e.preventDefault();
              }
            }}
          >
            {selectedBrand.logoPath ? (
              <Image
                src={selectedBrand.logoPath}
                alt={selectedBrand.name}
                width={size}
                height={size}
                className="object-contain"
              />
            ) : (
              <Brandmark size={size} />
            )}
          </Link>
        </button>

        {/* Dropdown - Fixed positioning to escape parent stacking context */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="
              fixed
              w-64 bg-os-surface-dark
              rounded-lg border border-os-border-dark
              shadow-lg z-[9999]
              max-h-[400px] overflow-y-auto
            "
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-os-text-secondary-dark uppercase tracking-wider">
                SELECT BRAND
              </div>
              
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand.id)}
                  className={`
                    w-full flex items-center justify-between
                    px-3 py-2 rounded-lg
                    hover:bg-os-bg-dark
                    transition-colors duration-200
                    group
                    ${selectedBrandId === brand.id ? 'bg-os-bg-dark' : ''}
                  `}
                >
                  <span className="text-sm font-medium text-os-text-primary-dark truncate flex-1 min-w-0 text-left">
                    {brand.name}
                  </span>
                  {selectedBrandId === brand.id && (
                    <Check className="w-4 h-4 text-brand-aperol flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}

              {/* Add Brand Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="
                  w-full flex items-center space-x-3
                  px-3 py-2 mt-2 rounded-lg
                  border border-os-border-dark
                  hover:bg-os-bg-dark
                  hover:border-brand-aperol/50
                  transition-all duration-200
                  group
                "
              >
                <Plus className="w-4 h-4 text-brand-aperol group-hover:text-brand-aperol/80" />
                <span className="text-sm font-medium text-brand-aperol">
                  Add New Brand
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={() => {
            setShowAddModal(false);
            setNewBrandName('');
            setNewCompanyName('');
            setUploadedFiles([]);
          }}
        >
          <div
            className="
              bg-os-surface-dark rounded-lg border border-os-border-dark
              shadow-lg w-full max-w-md p-6
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-os-text-primary-dark mb-4">
              Add New Brand
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-os-text-secondary-dark mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter your name"
                  className="
                    w-full px-3 py-2
                    bg-os-bg-dark border border-os-border-dark
                    rounded-lg text-os-text-primary-dark
                    focus:outline-none focus:ring-2 focus:ring-brand-aperol
                    placeholder:text-os-text-secondary-dark
                  "
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-os-text-secondary-dark mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="
                    w-full px-3 py-2
                    bg-os-bg-dark border border-os-border-dark
                    rounded-lg text-os-text-primary-dark
                    focus:outline-none focus:ring-2 focus:ring-brand-aperol
                    placeholder:text-os-text-secondary-dark
                  "
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-os-text-secondary-dark mb-2">
                  Upload Assets
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    w-full
                    border-2 border-dashed border-os-border-dark
                    rounded-lg p-6
                    bg-os-bg-dark/50
                    hover:border-brand-aperol/50
                    hover:bg-os-bg-dark
                    transition-all duration-200
                    cursor-pointer
                    flex flex-col items-center justify-center
                    text-center
                  "
                >
                  <Upload className="w-8 h-8 text-os-text-secondary-dark mb-2" />
                  <p className="text-sm text-os-text-primary-dark mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-os-text-secondary-dark">
                    SVG, PNG, JPG (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.svg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="
                          flex items-center justify-between
                          px-3 py-2
                          bg-os-bg-dark rounded-lg
                          border border-os-border-dark
                        "
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <ImageIcon className="w-4 h-4 text-os-text-secondary-dark flex-shrink-0" />
                          <span className="text-sm text-os-text-primary-dark truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-os-text-secondary-dark">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="
                            ml-2 p-1
                            text-os-text-secondary-dark
                            hover:text-os-text-primary-dark
                            transition-colors
                          "
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended Assets */}
                <div className="mt-4 pt-4 border-t border-os-border-dark">
                  <p className="text-xs font-medium text-os-text-secondary-dark mb-3 uppercase tracking-wider">
                    Recommended Assets
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-os-bg-dark rounded-lg border border-os-border-dark">
                      <FileText className="w-4 h-4 text-os-text-secondary-dark" />
                      <span className="text-xs text-os-text-secondary-dark">Brand Guidelines</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-os-bg-dark rounded-lg border border-os-border-dark">
                      <ImageIcon className="w-4 h-4 text-os-text-secondary-dark" />
                      <span className="text-xs text-os-text-secondary-dark">Logos</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-os-bg-dark rounded-lg border border-os-border-dark">
                      <Palette className="w-4 h-4 text-os-text-secondary-dark" />
                      <span className="text-xs text-os-text-secondary-dark">Design Tokens</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-os-bg-dark rounded-lg border border-os-border-dark">
                      <FileText className="w-4 h-4 text-os-text-secondary-dark" />
                      <span className="text-xs text-os-text-secondary-dark">Typography</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewBrandName('');
                  setNewCompanyName('');
                  setUploadedFiles([]);
                }}
                className="
                  px-4 py-2 rounded-lg
                  text-os-text-secondary-dark
                  hover:text-os-text-primary-dark
                  hover:bg-os-bg-dark
                  transition-colors duration-200
                "
              >
                Cancel
              </button>
              <button
                onClick={handleAddBrand}
                className="
                  px-4 py-2 rounded-lg
                  bg-brand-aperol text-white
                  hover:bg-brand-aperol/90
                  transition-colors duration-200
                  font-medium
                "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

