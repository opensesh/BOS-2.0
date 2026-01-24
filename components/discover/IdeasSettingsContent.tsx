'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

export function IdeasSettingsContent() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-aperol/10 flex items-center justify-center mb-4">
        <Lightbulb className="w-8 h-8 text-brand-aperol" />
      </div>
      <h3 className="text-lg font-display font-semibold text-brand-vanilla mb-2">
        Ideas Settings
      </h3>
      <p className="text-sm text-os-text-secondary-dark max-w-[280px]">
        Settings for the Ideas section will be available here soon. Stay tuned for customization options.
      </p>
    </div>
  );
}

