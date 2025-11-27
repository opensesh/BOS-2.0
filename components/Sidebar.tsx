'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  LayoutGrid,
  ScanFace,
  BrainCog,
  Bell,
  Menu,
  X,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';
import { Brandmark } from './Brandmark';
import { BrandSelector } from './BrandSelector';
import { MobileBrandSelector } from './MobileBrandSelector';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Brand', href: '/brand-hub', icon: ScanFace },
  { label: 'Brain', href: '/brain', icon: BrainCog },
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Spaces', href: '/spaces', icon: LayoutGrid },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const railRef = useRef<HTMLElement>(null);

  const handleDrawerClose = useCallback(() => {
    setHoveredItem(null);
  }, []);

  return (
    <>
      {/* Mobile Menu Button - Right Side */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-lg bg-os-surface-dark hover:bg-os-border-dark transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-os-text-primary-dark" />
        ) : (
          <Menu className="w-6 h-6 text-os-text-primary-dark" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Navigation Rail */}
      <aside
        ref={railRef}
        className={`
          hidden lg:flex
          relative inset-y-0 left-0 z-40
          w-16
          bg-os-bg-darker border-r border-os-border-dark
          flex flex-col
        `}
      >
        {/* Brand Selector - Desktop Only */}
        <div className="h-16 flex items-center justify-center border-b border-os-border-dark px-2 relative z-[70]">
          <BrandSelector size={32} href="/" />
        </div>

        {/* New Chat Button */}
        <div className="p-2">
          <button
            className="
              w-full flex flex-col items-center justify-center
              py-2 px-2 font-medium
              transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
              group
            "
            title="New Chat"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-os-surface-dark hover:bg-os-border-dark border border-os-border-dark transition-all duration-200">
              <Plus className="w-4 h-4 text-brand-aperol group-hover:text-brand-aperol/80 transition-colors" />
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 space-y-0 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/spaces' && pathname.startsWith('/spaces'));
            const isHovered = hoveredItem === item.label;
            
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => {
                  // Don't immediately close - let NavigationDrawer handle it
                  // This allows smooth movement from rail item to drawer
                }}
              >
                <Link
                  data-nav-item={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    w-full flex flex-col items-center justify-center
                    py-2 px-2
                    transition-all duration-200
                    group
                    ${isHovered ? 'font-semibold' : 'font-medium'}
                  `}
                >
                  <div className={`
                    w-8 h-8 flex items-center justify-center rounded-lg mb-1
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-os-surface-dark'
                        : 'hover:bg-os-surface-dark'
                    }
                  `}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-aperol' : 'text-os-text-secondary-dark group-hover:text-os-text-primary-dark'}`} />
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${
                    isActive
                      ? 'text-brand-aperol'
                      : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-os-border-dark" />

        {/* Bottom Section */}
        <div className="p-2 space-y-0.5">
          {/* Notifications */}
          <button
            className="
              w-full flex flex-col items-center justify-center
              py-2 px-2
              text-os-text-secondary-dark
              hover:text-os-text-primary-dark
              transition-all duration-200
              group
            "
            title="Notifications"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-1 hover:bg-os-surface-dark transition-all duration-200">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-center">Alerts</span>
          </button>

          {/* User Profile */}
          <button
            className="
              w-full flex flex-col items-center justify-center
              py-2 px-2
              text-os-text-secondary-dark
              hover:text-os-text-primary-dark
              transition-all duration-200
              group
            "
            title="Account"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-1 hover:bg-os-surface-dark transition-all duration-200">
              <div className="w-6 h-6 bg-gradient-to-br from-brand-charcoal to-black border border-os-border-dark rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-mono">A</span>
              </div>
            </div>
            <span className="text-[10px] text-center">Account</span>
          </button>

          {/* Upgrade */}
          <button
            className="
              w-full flex flex-col items-center justify-center
              py-2 px-2
              text-os-text-secondary-dark
              hover:text-os-text-primary-dark
              transition-all duration-200
              group
            "
            title="Upgrade"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-1 hover:bg-os-surface-dark transition-all duration-200">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-center">Upgrade</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer - Opens from Right */}
      <aside
        className={`
          fixed lg:hidden inset-y-0 right-0 z-40
          w-80 max-w-[85vw]
          bg-os-bg-darker border-l border-os-border-dark
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Header with Brand Selector */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-os-border-dark">
          <MobileBrandSelector onClose={() => setIsMobileOpen(false)} />
        </div>

        {/* Mobile Navigation Content */}
        <div className="flex-1 overflow-y-auto">
          {/* New Chat Button */}
          <div className="p-4">
            <button
              className="
                w-full flex items-center space-x-3
                py-3 px-4 bg-os-surface-dark hover:bg-os-border-dark 
                text-os-text-primary-dark rounded-lg font-medium border border-os-border-dark
                transition-all hover:shadow-lg
              "
              onClick={() => setIsMobileOpen(false)}
            >
              <Plus className="w-5 h-5 text-brand-aperol" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/spaces' && pathname.startsWith('/spaces'));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-os-surface-dark text-brand-aperol'
                        : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-os-text-primary-dark'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-aperol' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-os-border-dark my-4" />

          {/* Bottom Section */}
          <div className="px-3 space-y-1">
            {/* Notifications */}
            <button
              className="
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                text-os-text-secondary-dark
                hover:bg-os-surface-dark hover:text-os-text-primary-dark
                transition-all duration-200
              "
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
            </button>

            {/* User Profile */}
            <button
              className="
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                text-os-text-secondary-dark
                hover:bg-os-surface-dark
                transition-all duration-200
              "
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-charcoal to-black border border-os-border-dark rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-mono">A</span>
              </div>
              <div className="text-left">
                <p className="text-os-text-primary-dark font-medium text-sm">Account</p>
                <p className="text-os-text-secondary-dark text-xs">Manage settings</p>
              </div>
            </button>

            {/* Upgrade */}
            <button
              className="
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                text-os-text-secondary-dark
                hover:bg-os-surface-dark hover:text-os-text-primary-dark
                transition-all duration-200
              "
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-medium">Upgrade</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Navigation Drawer - Desktop Only */}
      <NavigationDrawer
        isOpen={hoveredItem !== null}
        item={hoveredItem}
        onClose={handleDrawerClose}
        railRef={railRef}
      />
    </>
  );
}