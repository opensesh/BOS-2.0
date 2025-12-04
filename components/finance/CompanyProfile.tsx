'use client';

import React, { useState } from 'react';
import { CompanyProfile as Profile } from '@/hooks/useFinanceData';
import { ExternalLink, ChevronDown, ChevronUp, Building2, Users, MapPin, Globe } from 'lucide-react';

interface CompanyProfileProps {
  profile: Profile | null;
  loading?: boolean;
}

export function CompanyProfile({ profile, loading }: CompanyProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-48 bg-os-surface-dark rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-os-surface-dark rounded" />
          <div className="h-3 w-5/6 bg-os-surface-dark rounded" />
          <div className="h-3 w-4/6 bg-os-surface-dark rounded" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const details = [
    { icon: Building2, label: 'Sector', value: profile.sector },
    { icon: Building2, label: 'Industry', value: profile.industry },
    { icon: Users, label: 'Employees', value: profile.fullTimeEmployees?.toLocaleString() },
    { icon: MapPin, label: 'Location', value: [profile.city, profile.state, profile.country].filter(Boolean).join(', ') },
    { icon: Globe, label: 'Website', value: profile.website, isLink: true },
  ].filter(d => d.value);

  const description = profile.longBusinessSummary || '';
  const truncatedDescription = description.length > 200 
    ? description.substring(0, 200) + '...' 
    : description;

  return (
    <div className="space-y-4">
      {/* Description */}
      {description && (
        <div>
          <p className="text-sm text-os-text-secondary-dark leading-relaxed">
            {isExpanded ? description : truncatedDescription}
          </p>
          {description.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-xs text-brand-aperol hover:text-brand-aperol/80 transition-colors"
            >
              {isExpanded ? (
                <>
                  Read Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Company Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-start gap-2">
            <detail.icon className="w-4 h-4 text-os-text-secondary-dark mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-os-text-secondary-dark">{detail.label}</div>
              {detail.isLink ? (
                <a
                  href={detail.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-aperol hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{new URL(detail.value).hostname}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <div className="text-sm text-brand-vanilla truncate">{detail.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Key Officers */}
      {profile.companyOfficers && profile.companyOfficers.length > 0 && (
        <div>
          <h4 className="text-xs text-os-text-secondary-dark uppercase tracking-wider mb-2">
            Key Executives
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {profile.companyOfficers.slice(0, 4).map((officer, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-brand-vanilla truncate">{officer.name}</div>
                <div className="text-xs text-os-text-secondary-dark truncate">{officer.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar-optimized version
export function CompanyProfileSidebar({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  const details = [
    { label: 'Symbol', value: profile.symbol },
    { label: 'Sector', value: profile.sector },
    { label: 'Industry', value: profile.industry },
    { label: 'Employees', value: profile.fullTimeEmployees?.toLocaleString() },
    { label: 'Country', value: profile.country },
  ].filter(d => d.value);

  return (
    <div className="space-y-2">
      {details.map((detail) => (
        <div key={detail.label} className="flex justify-between text-sm">
          <span className="text-os-text-secondary-dark">{detail.label}</span>
          <span className="text-brand-vanilla text-right">{detail.value}</span>
        </div>
      ))}
    </div>
  );
}

