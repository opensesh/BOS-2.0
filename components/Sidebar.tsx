'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  LayoutGrid,
  ScanFace,
  BrainCog,
  Bell,
  ArrowUpRight,
  MessageSquare,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';
import { BrandSelector } from './BrandSelector';
import { MobileHeader } from './MobileHeader';
import { useChatContext } from '@/lib/chat-context';
import { useMobileMenu } from '@/lib/mobile-menu-context';
import { overlayFade, slideFromRight, staggerContainerFast, fadeInUp } from '@/lib/motion';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Brand', href: '/brand-hub', icon: ScanFace },
  { label: 'Brain', href: '/brain', icon: BrainCog },
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Spaces', href: '/spaces', icon: LayoutGrid },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const { chatHistory, triggerChatReset } = useChatContext();

  const handleDrawerClose = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const handleNewChat = useCallback(() => {
    triggerChatReset();
    closeMobileMenu();
  }, [triggerChatReset, closeMobileMenu]);

  const handleHomeClick = useCallback(() => {
    if (pathname === '/') {
      triggerChatReset();
    }
    closeMobileMenu();
  }, [pathname, triggerChatReset, closeMobileMenu]);

  return (
    <>
      {/* Global Mobile Header - sticky header with brand selector and hamburger */}
      <MobileHeader onBrandClick={handleHomeClick} />

      {/* Mobile Overlay - starts below the header */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 top-14 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileMenu}
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Desktop Navigation Rail - Fixed width, text reveals on hover */}
      <aside
        ref={railRef}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className="
          hidden lg:flex
          relative z-40
          w-[56px]
          bg-os-bg-darker border-r border-os-border-dark
          flex-col h-screen
        "
      >
        {/* Brand Selector - Top Left */}
        <div className="h-12 flex items-center justify-center border-b border-os-border-dark relative z-[70]">
          <BrandSelector size={24} href="/" onClick={handleHomeClick} />
        </div>

        {/* New Chat Button */}
        <div className="flex justify-center pt-2 pb-1">
          <Link
            href="/"
            onClick={handleNewChat}
            className="
              flex flex-col items-center justify-center
              py-1.5 px-2
              transition-colors duration-150
              group
              text-os-text-secondary-dark hover:text-os-text-primary-dark
            "
            title="New Chat"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-os-surface-dark group-hover:bg-os-border-dark border border-os-border-dark transition-all duration-150">
              <Plus className="w-[18px] h-[18px] text-brand-aperol" />
            </div>
          </Link>
        </div>

        {/* Navigation Items - Compact at top */}
        <nav className="flex flex-col items-center">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href === '/spaces' && pathname.startsWith('/spaces')) ||
              (item.href === '/discover' && pathname.startsWith('/discover'));
            
            return (
              <div
                key={item.href}
                className="relative w-full flex justify-center"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  data-nav-item={item.label}
                  href={item.href}
                  onClick={item.href === '/' ? handleHomeClick : closeMobileMenu}
                  className={`
                    flex flex-col items-center
                    py-2 px-2 min-h-[52px]
                    transition-colors duration-150
                    group relative
                    ${isActive ? 'text-brand-aperol' : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'}
                  `}
                >
                  {/* Icon container with active indicator */}
                  <div className="relative">
                    {/* Active indicator - left bar, centered with icon */}
                    <div className={`
                      absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full
                      transition-all duration-150
                      ${isActive ? 'h-5 bg-brand-aperol' : 'h-0 bg-transparent'}
                    `} />
                    
                    <div className={`
                      w-8 h-8 flex items-center justify-center rounded-lg
                      transition-all duration-150
                      ${isActive 
                        ? 'bg-brand-aperol/10' 
                        : 'group-hover:bg-os-surface-dark'
                      }
                    `}>
                      <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-brand-aperol' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Label - fades in on sidebar hover */}
                  <span 
                    className={`
                      text-[9px] font-medium text-center leading-tight mt-1
                      transition-all duration-200 ease-out
                      ${isActive ? 'text-brand-aperol' : 'text-os-text-secondary-dark group-hover:text-os-text-primary-dark'}
                    `}
                    style={{
                      opacity: isSidebarHovered ? 1 : 0,
                      transform: isSidebarHovered ? 'translateY(0)' : 'translateY(-2px)',
                      transitionDelay: isSidebarHovered ? `${index * 25}ms` : '0ms',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center border-t border-os-border-dark py-1">
          <Link
            href="/finance"
            className={`
              flex flex-col items-center justify-center
              py-2 px-2 min-h-[52px]
              transition-colors duration-150 group
              ${pathname.startsWith('/finance') ? 'text-brand-aperol' : 'text-os-text-secondary-dark hover:text-os-text-primary-dark'}
            `}
            title="Finance"
          >
            <div className="relative">
              <div className={`
                absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full
                transition-all duration-150
                ${pathname.startsWith('/finance') ? 'h-5 bg-brand-aperol' : 'h-0 bg-transparent'}
              `} />
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150
                ${pathname.startsWith('/finance') ? 'bg-brand-aperol/10' : 'group-hover:bg-os-surface-dark'}
              `}>
                <TrendingUp className="w-[18px] h-[18px]" />
              </div>
            </div>
            <span 
              className={`text-[9px] font-medium text-center mt-1 transition-all duration-200 ease-out ${pathname.startsWith('/finance') ? 'text-brand-aperol' : ''}`}
              style={{
                opacity: isSidebarHovered ? 1 : 0,
                transform: isSidebarHovered ? 'translateY(0)' : 'translateY(-2px)',
                transitionDelay: isSidebarHovered ? '100ms' : '0ms',
              }}
            >
              Finance
            </span>
          </Link>

          <button
            className="
              flex flex-col items-center justify-center
              py-2 px-2 min-h-[52px]
              text-os-text-secondary-dark hover:text-os-text-primary-dark
              transition-colors duration-150 group
            "
            title="Notifications"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-os-surface-dark transition-colors duration-150">
              <Bell className="w-[18px] h-[18px]" />
            </div>
            <span 
              className="text-[9px] font-medium text-center mt-1 transition-all duration-200 ease-out"
              style={{
                opacity: isSidebarHovered ? 1 : 0,
                transform: isSidebarHovered ? 'translateY(0)' : 'translateY(-2px)',
                transitionDelay: isSidebarHovered ? '125ms' : '0ms',
              }}
            >
              Alerts
            </span>
          </button>

          <button
            className="
              flex flex-col items-center justify-center
              py-2 px-2 min-h-[52px]
              text-os-text-secondary-dark hover:text-os-text-primary-dark
              transition-colors duration-150 group
            "
            title="Account"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-os-surface-dark transition-colors duration-150">
              <div className="w-5 h-5 bg-gradient-to-br from-brand-charcoal to-black border border-os-border-dark rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-mono">A</span>
              </div>
            </div>
            <span 
              className="text-[9px] font-medium text-center mt-1 transition-all duration-200 ease-out"
              style={{
                opacity: isSidebarHovered ? 1 : 0,
                transform: isSidebarHovered ? 'translateY(0)' : 'translateY(-2px)',
                transitionDelay: isSidebarHovered ? '150ms' : '0ms',
              }}
            >
              Account
            </span>
          </button>

          <button
            className="
              flex flex-col items-center justify-center
              py-2 px-2 min-h-[52px]
              text-os-text-secondary-dark hover:text-os-text-primary-dark
              transition-colors duration-150 group
            "
            title="Upgrade"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-os-surface-dark transition-colors duration-150">
              <ArrowUpRight className="w-[18px] h-[18px]" />
            </div>
            <span 
              className="text-[9px] font-medium text-center mt-1 transition-all duration-200 ease-out"
              style={{
                opacity: isSidebarHovered ? 1 : 0,
                transform: isSidebarHovered ? 'translateY(0)' : 'translateY(-2px)',
                transitionDelay: isSidebarHovered ? '175ms' : '0ms',
              }}
            >
              Upgrade
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer - Opens from Right, positioned below sticky header */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            className="fixed lg:hidden top-14 bottom-0 right-0 z-40 w-80 max-w-[85vw] bg-os-bg-darker border-l border-os-border-dark flex flex-col"
            variants={slideFromRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile Navigation Content */}
            <motion.div 
              className="flex-1 overflow-y-auto"
              variants={staggerContainerFast}
              initial="hidden"
              animate="visible"
            >
              {/* New Chat Button */}
              <motion.div variants={fadeInUp} className="p-4">
                <Link
                  href="/"
                  onClick={handleNewChat}
                  className="
                    w-full flex items-center space-x-3
                    py-3 px-4 bg-os-surface-dark hover:bg-os-border-dark 
                    text-os-text-primary-dark rounded-lg font-medium border border-os-border-dark
                    transition-all hover:shadow-lg
                  "
                >
                  <Plus className="w-5 h-5 text-brand-aperol" />
                  <span>New Chat</span>
                </Link>
              </motion.div>

              {/* Recent Chats */}
              {chatHistory.length > 0 && (
                <motion.div variants={fadeInUp} className="px-4 pb-4">
                  <p className="text-xs font-medium text-os-text-secondary-dark uppercase tracking-wider mb-2">
                    Recent
                  </p>
                  <div className="space-y-1">
                    {chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-os-text-primary-dark transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{chat.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Navigation Items */}
              <nav className="px-3 space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href === '/spaces' && pathname.startsWith('/spaces')) ||
                    (item.href === '/discover' && pathname.startsWith('/discover'));
                  
                  return (
                    <motion.div key={item.href} variants={fadeInUp} custom={index}>
                      <Link
                        href={item.href}
                        onClick={item.href === '/' ? handleHomeClick : closeMobileMenu}
                        className={`
                          flex items-center space-x-3 px-3 py-3 rounded-lg
                          transition-all duration-200
                          ${isActive
                            ? 'bg-os-surface-dark text-brand-aperol'
                            : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-os-text-primary-dark'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-aperol' : ''}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div variants={fadeInUp} className="border-t border-os-border-dark my-4" />

              <motion.div variants={fadeInUp} className="px-3 space-y-1">
                <Link
                  href="/finance"
                  onClick={closeMobileMenu}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    pathname.startsWith('/finance')
                      ? 'bg-os-surface-dark text-brand-aperol'
                      : 'text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-os-text-primary-dark'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Finance</span>
                </Link>

                <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-os-text-primary-dark transition-all duration-200">
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Notifications</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark transition-all duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-charcoal to-black border border-os-border-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-mono">A</span>
                  </div>
                  <div className="text-left">
                    <p className="text-os-text-primary-dark font-medium text-sm">Account</p>
                    <p className="text-os-text-secondary-dark text-xs">Manage settings</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-os-text-secondary-dark hover:bg-os-surface-dark hover:text-os-text-primary-dark transition-all duration-200">
                  <ArrowUpRight className="w-5 h-5" />
                  <span className="font-medium">Upgrade</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

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
