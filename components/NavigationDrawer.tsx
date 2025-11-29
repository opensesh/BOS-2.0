'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FolderPlus,
  LayoutGrid,
  Infinity,
  Star,
  BookOpen,
  Fingerprint,
  Palette,
  Type,
  ImageIcon,
  ScanFace,
  Compass,
  Lightbulb,
  History,
  Code,
  PenTool,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { SPACES } from '@/lib/mock-data';
import { useChatContext } from '@/lib/chat-context';

interface NavigationDrawerProps {
  isOpen: boolean;
  item: string | null;
  onClose: () => void;
  railRef: React.RefObject<HTMLElement | null>;
}

const brandHubNavItems = [
  { label: 'Logo', href: '/brand-hub/logo', icon: Fingerprint },
  { label: 'Colors', href: '/brand-hub/colors', icon: Palette },
  { label: 'Typography', href: '/brand-hub/fonts', icon: Type },
  { label: 'Art Direction', href: '/brand-hub/art-direction', icon: ImageIcon },
  { label: 'Guidelines', href: '/brand-hub/guidelines', icon: FileText },
];

export function NavigationDrawer({ isOpen, item, onClose, railRef }: NavigationDrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, height: 0 });
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCloseRef = useRef(onClose);
  const { chatHistory } = useChatContext();

  // Keep onClose ref up to date without triggering re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen && railRef.current && item) {
      const itemElement = railRef.current.querySelector(`[data-nav-item="${item}"]`);
      
      if (itemElement && railRef.current) {
        const railRect = railRef.current.getBoundingClientRect();
        setPosition({
          top: railRect.top,
          left: railRect.right, // Align to outer edge of rail
          height: railRect.height, // Full height of rail
        });
      }
    }
  }, [isOpen, item, railRef]);

  // Handle hover behavior - keep drawer open when hovering over rail item or drawer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen || !drawerRef.current || !railRef.current) return;

      const target = e.target as Node;
      const isOverDrawer = drawerRef.current.contains(target);
      const isOverRail = railRef.current.contains(target);
      
      // Check if we're hovering over the specific nav item or its parent wrapper
      const navItem = railRef.current.querySelector(`[data-nav-item="${item}"]`);
      const navItemParent = navItem?.closest('div');
      const isOverNavItem = navItem && (
        navItem.contains(target) || 
        navItem === target ||
        (navItemParent && navItemParent.contains(target))
      );

      // Clear any existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // Keep drawer open if over drawer, rail, or the specific nav item
      if (isOverDrawer || isOverRail || isOverNavItem) {
        return; // Keep drawer open
      }

      // If not over any of these, schedule close with delay
      closeTimeoutRef.current = setTimeout(() => {
        // Double-check before closing
        if (typeof document === 'undefined') return;
        const stillOverDrawer = drawerRef.current?.contains(document.elementFromPoint(e.clientX, e.clientY));
        const stillOverRail = railRef.current?.contains(document.elementFromPoint(e.clientX, e.clientY));
        if (!stillOverDrawer && !stillOverRail) {
          onCloseRef.current();
        }
      }, 200); // Delay to allow movement between rail and drawer
    };

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      };
    }
  }, [isOpen, item, railRef]); // Removed onClose from dependencies

  if (!isOpen || !item) return null;

  const renderContent = () => {
    switch (item) {
      case 'Spaces':
        return (
          <div className="py-2">
            <div className="px-4 py-2 mb-2">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Spaces</h3>
              </div>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Templates</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors mb-4">
                <FolderPlus className="w-5 h-5" />
                <span className="text-sm">Create new Space</span>
              </button>

              <div className="border-t border-os-border-dark pt-2">
                <div className="px-3 py-1 text-xs text-os-text-secondary-dark mb-2">Private</div>
                {SPACES.map((space) => {
                  const isSpaceActive = pathname === `/spaces/${space.slug}`;
                  return (
                    <Link
                      key={space.id}
                      href={`/spaces/${space.slug}`}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1
                        transition-colors
                        ${
                          isSpaceActive
                            ? 'bg-os-surface-dark text-brand-aperol'
                            : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                        }
                      `}
                    >
                      <LayoutGrid className={`w-5 h-5 ${isSpaceActive ? 'text-brand-aperol' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{space.title}</div>
                        {space.description && (
                          <div className="text-xs text-os-text-secondary-dark truncate">
                            {space.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      case 'Home':
        return (
          <div className="py-2">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Home</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-brand-vanilla">Recent Chats</h4>
                  <button className="p-1 rounded hover:bg-os-surface-dark transition-colors">
                    <History className="w-3 h-3 text-os-text-secondary-dark" />
                  </button>
                </div>
                <div className="space-y-1">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{chat.title}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-os-text-secondary-dark/60 px-3 py-2">
                      No recent chats yet
                    </p>
                  )}
                </div>
                {chatHistory.length > 0 && (
                  <button className="mt-2 text-xs text-brand-aperol hover:underline px-3">
                    View All
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'Discover':
        return (
          <div className="py-2">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Discover</h3>
              </div>
              
              <div className="space-y-1 mb-4">
                <Link
                  href="/discover"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/discover'
                      ? 'bg-os-surface-dark text-brand-aperol'
                      : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-sm">News</span>
                </Link>
                <Link
                  href="/discover"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/discover'
                      ? 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                      : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-sm">Inspiration</span>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'Brand':
        // Only show "View All Assets" when on a subpage, not on main /brand-hub
        const isOnSubpage = pathname.startsWith('/brand-hub/');
        
        return (
          <div className="py-2">
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Brand</h3>
              </div>
              
              <div className="space-y-1">
                {brandHubNavItems.map((navItem) => {
                  const Icon = navItem.icon;
                  const isActive = pathname === navItem.href;
                  return (
                    <Link
                      key={navItem.href}
                      href={navItem.href}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-colors
                        ${
                          isActive
                            ? 'bg-brand-aperol/10 text-brand-aperol'
                            : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-brand-aperol' : ''}`} />
                      <span className="text-sm">{navItem.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Only show View All Assets when on a subpage */}
              {isOnSubpage && (
                <div className="mt-4 pt-4 border-t border-os-border-dark">
                  <Link
                    href="/brand-hub"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors text-sm"
                  >
                    View All Assets
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Brain':
        const brainNavItems = [
          { label: 'Architecture', href: '/brain/architecture', icon: Code },
          { label: 'Brand Identity', href: '/brain/brand-identity', icon: BookOpen },
          { label: 'Writing Styles', href: '/brain/writing-styles', icon: PenTool },
          { label: 'Skills', href: '/brain/skills', icon: Zap },
        ];
        const isOnBrainSubpage = pathname.startsWith('/brain/');
        
        return (
          <div className="py-2">
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Brain</h3>
              </div>
              
              <div className="space-y-1">
                {brainNavItems.map((navItem) => {
                  const Icon = navItem.icon;
                  const isActive = pathname === navItem.href;
                  return (
                    <Link
                      key={navItem.href}
                      href={navItem.href}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-colors
                        ${
                          isActive
                            ? 'bg-brand-aperol/10 text-brand-aperol'
                            : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-brand-aperol' : ''}`} />
                      <span className="text-sm">{navItem.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Only show View Brain Overview when on a subpage */}
              {isOnBrainSubpage && (
                <div className="mt-4 pt-4 border-t border-os-border-dark">
                  <Link
                    href="/brain"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors text-sm"
                  >
                    View Brain Overview
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Resources':
        return (
          <div className="py-2">
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Resources</h3>
              </div>
              
              <div className="text-sm text-os-text-secondary-dark">
                Resources and documentation coming soon
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      ref={drawerRef}
      data-navigation-drawer
      className={`
        hidden lg:block
        fixed z-50
        w-[220px] bg-os-bg-darker border-r border-os-border-dark
        shadow-xl
        transition-all duration-200 ease-out
        overflow-y-auto
        ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
      `}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        height: `${position.height}px`,
      }}
      onMouseEnter={() => {
        // Clear any pending close when entering drawer
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      }}
    >
      {renderContent()}
    </div>
  );
}
