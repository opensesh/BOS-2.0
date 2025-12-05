'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  History,
  Code,
  PenTool,
  MessageSquare,
  Zap,
  Layers,
  Newspaper,
} from 'lucide-react';
import { useChatContext } from '@/lib/chat-context';
import { useSpaces } from '@/hooks/useSpaces';
import { slideFromLeft, staggerContainerFast, fadeInUp } from '@/lib/motion';

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
  { label: 'Tokens', href: '/brand-hub/design-tokens', icon: Code },
];

export function NavigationDrawer({ isOpen, item, onClose, railRef }: NavigationDrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, height: 0 });
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCloseRef = useRef(onClose);
  const { chatHistory } = useChatContext();
  const { spaces: userSpaces, isLoaded: spacesLoaded } = useSpaces();

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

  // Handle hover behavior - close drawer when mouse leaves both drawer and rail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen || !drawerRef.current || !railRef.current) return;

      const target = e.target as Node;
      const isOverDrawer = drawerRef.current.contains(target);
      const isOverRail = railRef.current.contains(target);

      // Clear any existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // Keep drawer open if over drawer or rail
      if (isOverDrawer || isOverRail) {
        return; // Keep drawer open
      }

      // If not over drawer or rail, schedule close with short delay
      closeTimeoutRef.current = setTimeout(() => {
        onCloseRef.current();
      }, 150); // Short delay for smoother UX
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
  }, [isOpen, railRef]); // Simplified dependencies

  const renderContent = () => {
    switch (item) {
      case 'Spaces':
        return (
          <motion.div 
            className="py-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 py-2 mb-2">
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Spaces</h3>
              </motion.div>
              
              <motion.button 
                variants={fadeInUp}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors mb-2"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm">Templates</span>
              </motion.button>
              
              <motion.button 
                variants={fadeInUp}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors mb-4"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="text-sm">Create new Space</span>
              </motion.button>

              <motion.div variants={fadeInUp} className="border-t border-os-border-dark pt-2">
                <div className="px-3 py-1 text-xs text-os-text-secondary-dark mb-2">My Spaces</div>
                {!spacesLoaded ? (
                  <div className="px-3 py-2 text-xs text-os-text-secondary-dark/60">
                    Loading...
                  </div>
                ) : userSpaces.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-os-text-secondary-dark/60">
                    No spaces yet. Create one above!
                  </div>
                ) : (
                  userSpaces.map((space, index) => {
                    const isSpaceActive = pathname === `/spaces/${space.slug}`;
                    return (
                      <motion.div
                        key={space.id}
                        variants={fadeInUp}
                        custom={index}
                      >
                        <Link
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
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </div>
          </motion.div>
        );
      
      case 'Home':
        return (
          <motion.div 
            className="py-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 py-2">
              <motion.div variants={fadeInUp} className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Home</h3>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-brand-vanilla">Recent Chats</h4>
                  <button className="p-1 rounded hover:bg-os-surface-dark transition-colors">
                    <History className="w-3 h-3 text-os-text-secondary-dark" />
                  </button>
                </div>
                <div className="space-y-1">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <motion.button
                        key={chat.id}
                        variants={fadeInUp}
                        custom={index}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{chat.title}</span>
                      </motion.button>
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
              </motion.div>
            </div>
          </motion.div>
        );
      
      case 'Discover':
        const isOnNews = pathname === '/discover' && !pathname.includes('inspo');
        const isOnIdeas = pathname === '/discover' && !pathname.includes('inspo'); // Ideas is on same page with tab
        const isOnInspo = pathname === '/discover/inspo';
        
        return (
          <motion.div 
            className="py-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 py-2">
              <motion.div variants={fadeInUp} className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Discover</h3>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-1 mb-4">
                <Link
                  href="/discover?tab=News"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isOnNews
                      ? 'bg-os-surface-dark text-brand-aperol'
                      : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                  }`}
                >
                  <Newspaper className="w-5 h-5" />
                  <span className="text-sm">News</span>
                </Link>
                <Link
                  href="/discover?tab=Ideas"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isOnIdeas
                      ? 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                      : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-sm">Ideas</span>
                </Link>
                <Link
                  href="/discover/inspo"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isOnInspo
                      ? 'bg-os-surface-dark text-brand-aperol'
                      : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Inspiration</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'Brand':
        // Only show "View All Assets" when on a subpage, not on main /brand-hub
        const isOnSubpage = pathname.startsWith('/brand-hub/');
        
        return (
          <motion.div 
            className="py-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 py-2">
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Brand</h3>
              </motion.div>
              
              <div className="space-y-1">
                {brandHubNavItems.map((navItem, index) => {
                  const Icon = navItem.icon;
                  const isActive = pathname === navItem.href;
                  return (
                    <motion.div key={navItem.href} variants={fadeInUp} custom={index}>
                      <Link
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
                    </motion.div>
                  );
                })}
              </div>

              {/* Only show View All Assets when on a subpage */}
              {isOnSubpage && (
                <motion.div variants={fadeInUp} className="mt-4 pt-4 border-t border-os-border-dark">
                  <Link
                    href="/brand-hub"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors text-sm"
                  >
                    View All Assets
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      
      case 'Brain':
        const brainNavItems = [
          { label: 'Architecture', href: '/brain/architecture', icon: Code },
          { label: 'Brand Identity', href: '/brain/brand-identity', icon: BookOpen },
          { label: 'Writing Styles', href: '/brain/writing-styles', icon: PenTool },
          { label: 'Skills', href: '/brain/skills', icon: Zap },
          { label: 'Components', href: '/brain/components', icon: Layers },
        ];
        const isOnBrainSubpage = pathname.startsWith('/brain/');
        
        return (
          <motion.div 
            className="py-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 py-2">
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Brain</h3>
              </motion.div>
              
              <div className="space-y-1">
                {brainNavItems.map((navItem, index) => {
                  const Icon = navItem.icon;
                  const isActive = pathname === navItem.href;
                  return (
                    <motion.div key={navItem.href} variants={fadeInUp} custom={index}>
                      <Link
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
                    </motion.div>
                  );
                })}
              </div>

              {/* Only show View Brain Overview when on a subpage */}
              {isOnBrainSubpage && (
                <motion.div variants={fadeInUp} className="mt-4 pt-4 border-t border-os-border-dark">
                  <Link
                    href="/brain"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-brand-vanilla transition-colors text-sm"
                  >
                    View Brain Overview
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      
      case 'Resources':
        return (
          <motion.div 
            className="py-2"
            variants={staggerContainerFast}
            initial="hidden"
            animate="visible"
          >
            <div className="px-4 py-2">
              <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-brand-vanilla">Resources</h3>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="text-sm text-os-text-secondary-dark">
                Resources and documentation coming soon
              </motion.div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          ref={drawerRef}
          data-navigation-drawer
          className="hidden lg:block fixed z-50 w-[220px] bg-os-bg-darker border-r border-os-border-dark shadow-xl overflow-y-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            height: `${position.height}px`,
          }}
          variants={slideFromLeft}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseEnter={() => {
            // Clear any pending close when entering drawer
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          }}
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
