'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { validateAdminPassword, setAdminMode } from '@/lib/admin-auth';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (password: string) => void;
}

export function AdminPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (validateAdminPassword(password)) {
      setAdminMode(true);
      onSuccess(password);
      handleClose();
    } else {
      setError('Invalid password');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Admin Access" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-brand-aperol/10 border border-brand-aperol/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-brand-aperol" />
          </div>
        </div>

        <p className="text-center text-os-text-secondary-dark text-sm mb-4">
          Enter the admin password to access editing features.
        </p>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter password"
            className="
              w-full px-4 py-3 pr-12 rounded-lg
              bg-os-border-dark border border-os-border-dark
              text-os-text-primary-dark placeholder-os-text-secondary-dark
              focus:outline-none focus:ring-2 focus:ring-brand-aperol/50 focus:border-brand-aperol
              transition-colors
            "
            autoFocus
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-os-text-secondary-dark hover:text-os-text-primary-dark transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-os-text-primary-dark bg-os-border-dark hover:bg-os-border-dark/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !password}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-aperol hover:bg-brand-aperol/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

