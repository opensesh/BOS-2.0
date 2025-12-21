'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus, Link, Tag, DollarSign, FileText, Layers } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminPassword: string;
  existingCategories: string[];
  existingSubCategories: string[];
  existingPricings: string[];
}

export function AddResourceModal({
  isOpen,
  onClose,
  onSuccess,
  adminPassword,
  existingCategories,
  existingSubCategories,
  existingPricings,
}: AddResourceModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [customSubCategory, setCustomSubCategory] = useState('');
  const [pricing, setPricing] = useState('');
  const [customPricing, setCustomPricing] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setUrl('');
      setDescription('');
      setCategory('');
      setCustomCategory('');
      setSubCategory('');
      setCustomSubCategory('');
      setPricing('');
      setCustomPricing('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    const urlToAdd = url.startsWith('http') ? url : `https://${url}`;

    if (!validateUrl(urlToAdd)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);

    try {
      // Determine final values (use custom if "Other" selected)
      const finalCategory = category === '__other__' ? customCategory : category;
      const finalSubCategory = subCategory === '__other__' ? customSubCategory : subCategory;
      const finalPricing = pricing === '__other__' ? customPricing : pricing;

      const response = await fetch('/api/inspo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          Name: name.trim(),
          URL: urlToAdd,
          Description: description.trim() || null,
          Category: finalCategory || null,
          'Sub-category': finalSubCategory || null,
          Pricing: finalPricing || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add resource');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Resource" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-os-text-primary-dark mb-1.5">
            <FileText className="w-4 h-4 text-os-text-secondary-dark" />
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dribbble"
            className="
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
            disabled={isLoading}
          />
        </div>

        {/* URL */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-os-text-primary-dark mb-1.5">
            <Link className="w-4 h-4 text-os-text-secondary-dark" />
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-os-text-primary-dark mb-1.5">
            <Tag className="w-4 h-4 text-os-text-secondary-dark" />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the resource..."
            rows={2}
            className="
              w-full px-3 py-2 rounded-lg resize-none
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
            disabled={isLoading}
          />
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-os-text-primary-dark mb-1.5">
            <Layers className="w-4 h-4 text-os-text-secondary-dark" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors cursor-pointer
            "
            disabled={isLoading}
          >
            <option value="">Select category...</option>
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__other__">+ Other (custom)</option>
          </select>
          {category === '__other__' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              className="
                w-full mt-2 px-3 py-2 rounded-lg
                bg-os-border-dark border border-os-border-dark
                text-os-text-primary-dark placeholder-os-text-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
                transition-colors
              "
              disabled={isLoading}
            />
          )}
        </div>

        {/* Sub-category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-os-text-primary-dark mb-1.5">
            <Layers className="w-4 h-4 text-os-text-secondary-dark" />
            Sub-category
          </label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors cursor-pointer
            "
            disabled={isLoading}
          >
            <option value="">Select sub-category...</option>
            {existingSubCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
            <option value="__other__">+ Other (custom)</option>
          </select>
          {subCategory === '__other__' && (
            <input
              type="text"
              value={customSubCategory}
              onChange={(e) => setCustomSubCategory(e.target.value)}
              placeholder="Enter custom sub-category"
              className="
                w-full mt-2 px-3 py-2 rounded-lg
                bg-os-border-dark border border-os-border-dark
                text-os-text-primary-dark placeholder-os-text-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
                transition-colors
              "
              disabled={isLoading}
            />
          )}
        </div>

        {/* Pricing */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-os-text-primary-dark mb-1.5">
            <DollarSign className="w-4 h-4 text-os-text-secondary-dark" />
            Pricing
          </label>
          <select
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
            className="
              w-full px-3 py-2 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors cursor-pointer
            "
            disabled={isLoading}
          >
            <option value="">Select pricing...</option>
            {existingPricings.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
            <option value="__other__">+ Other (custom)</option>
          </select>
          {pricing === '__other__' && (
            <input
              type="text"
              value={customPricing}
              onChange={(e) => setCustomPricing(e.target.value)}
              placeholder="Enter custom pricing tier"
              className="
                w-full mt-2 px-3 py-2 rounded-lg
                bg-os-border-dark border border-os-border-dark
                text-os-text-primary-dark placeholder-os-text-secondary-dark
                focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
                transition-colors
              "
              disabled={isLoading}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-os-border-dark">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? 'Adding...' : 'Add Resource'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

