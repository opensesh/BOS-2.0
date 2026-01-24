'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { BrandHubLayout } from '@/components/brand-hub/BrandHubLayout';
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

type Category = 'All' | 'Auto' | 'Lifestyle' | 'Move' | 'Escape' | 'Work' | 'Feel';

interface ArtImage {
  id: string;
  src: string;
  category: Exclude<Category, 'All'>;
  title: string;
}

interface CategoryContent {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
}

// Content for each category
const categoryContent: Record<Category, CategoryContent> = {
  All: {
    title: 'Visual Identity System',
    subtitle: 'THE COMPLETE PICTURE',
    description: 'Our art direction encompasses six distinct visual territories, each contributing to a cohesive brand narrative. From the precision of automotive photography to the intimacy of emotional portraiture, every image is crafted to evoke aspiration while maintaining authenticity. This visual system allows our brand to speak with range and depth across all touchpoints.',
    tags: ['Cinematic', 'Aspirational', 'Authentic', 'Dynamic', 'Emotive', 'Premium'],
  },
  Auto: {
    title: 'Automotive Excellence',
    subtitle: 'PRECISION IN MOTION',
    description: 'Our automotive imagery celebrates the marriage of engineering and artistry. We capture vehicles not merely as machines, but as objects of desire—emphasizing form, light, and the promise of the open road. Each shot honors heritage while pushing toward the future, finding beauty in both vintage classics and modern masterpieces.',
    tags: ['Speed', 'Heritage', 'Precision', 'Power', 'Elegance', 'Night'],
  },
  Lifestyle: {
    title: 'Contemporary Living',
    subtitle: 'STYLE AS EXPRESSION',
    description: 'Lifestyle photography captures the confident, creative spirit of modern living. We focus on authentic moments of self-expression—street style that commands attention, editorial looks that tell stories, and candid captures that feel both aspirational and attainable. Fashion becomes a vehicle for identity.',
    tags: ['Editorial', 'Fashion', 'Urban', 'Confidence', 'Expression', 'Bold'],
  },
  Move: {
    title: 'Dynamic Energy',
    subtitle: 'BODIES IN FLOW',
    description: 'Movement imagery explores the poetry of the human form in motion. Through dance, athletics, and gesture, we capture energy that transcends the static frame. Motion blur becomes intentional, form becomes fluid, and every image pulses with kinetic vitality that invites the viewer to feel the rhythm.',
    tags: ['Energy', 'Flow', 'Athletic', 'Grace', 'Momentum', 'Rhythm'],
  },
  Escape: {
    title: 'Boundless Horizons',
    subtitle: 'BEYOND THE EVERYDAY',
    description: 'Escapist imagery transports viewers to liminal spaces where work meets wonder and routine dissolves into possibility. Remote workspaces overlooking oceans, deserts that stretch into infinity, and surreal compositions that challenge perspective—these images remind us that freedom is a state of mind.',
    tags: ['Freedom', 'Wonder', 'Adventure', 'Dreams', 'Remote', 'Surreal'],
  },
  Work: {
    title: 'Professional Vision',
    subtitle: 'PURPOSE MEETS CRAFT',
    description: 'Our work imagery reframes professional environments as spaces of creative potential and meaningful collaboration. We move beyond sterile corporate photography to capture genuine connection, focused intention, and the satisfaction of craft. Business becomes a platform for building something that matters.',
    tags: ['Collaboration', 'Innovation', 'Leadership', 'Focus', 'Growth', 'Purpose'],
  },
  Feel: {
    title: 'Emotional Resonance',
    subtitle: 'TEXTURE OF SENSATION',
    description: 'The most intimate territory in our visual language, Feel imagery prioritizes atmosphere over subject. Soft focus, warm tones, and abstract compositions create emotional impressions rather than literal narratives. Light becomes tactile, fabric becomes landscape, and every image invites contemplation.',
    tags: ['Intimacy', 'Texture', 'Warmth', 'Softness', 'Abstract', 'Poetic'],
  },
};

// Generate image data from the available images
const artImages: ArtImage[] = [
  // Auto
  { id: 'auto-1', src: '/assets/images/auto-audi-quattro-urban-portrait.png', category: 'Auto', title: 'Audi Quattro Urban Portrait' },
  { id: 'auto-2', src: '/assets/images/auto-bmw-convertible-garage-night.png', category: 'Auto', title: 'BMW Convertible Garage Night' },
  { id: 'auto-3', src: '/assets/images/auto-desert-porsche-sunset-drift.png', category: 'Auto', title: 'Desert Porsche Sunset Drift' },
  { id: 'auto-4', src: '/assets/images/auto-night-drive-motion-blur.png', category: 'Auto', title: 'Night Drive Motion Blur' },
  { id: 'auto-5', src: '/assets/images/auto-rally-porsche-night-racing.png', category: 'Auto', title: 'Rally Porsche Night Racing' },
  { id: 'auto-6', src: '/assets/images/auto-truck-wildflowers-mountain-dusk.png', category: 'Auto', title: 'Truck Wildflowers Mountain Dusk' },
  { id: 'auto-7', src: '/assets/images/auto-vintage-interior-dashboard-sunset.png', category: 'Auto', title: 'Vintage Interior Dashboard Sunset' },
  { id: 'auto-8', src: '/assets/images/auto-white-porsche-desert-headlights.png', category: 'Auto', title: 'White Porsche Desert Headlights' },
  // Escape
  { id: 'escape-1', src: '/assets/images/escape-astronaut-sparkle-floating.png', category: 'Escape', title: 'Astronaut Sparkle Floating' },
  { id: 'escape-2', src: '/assets/images/escape-cliffside-workspace-ocean-view.png', category: 'Escape', title: 'Cliffside Workspace Ocean View' },
  { id: 'escape-3', src: '/assets/images/escape-coastal-laptop-remote-work.png', category: 'Escape', title: 'Coastal Laptop Remote Work' },
  { id: 'escape-4', src: '/assets/images/escape-desert-silhouette-wanderer.png', category: 'Escape', title: 'Desert Silhouette Wanderer' },
  { id: 'escape-5', src: '/assets/images/escape-floating-sun-documents.png', category: 'Escape', title: 'Floating Sun Documents' },
  { id: 'escape-6', src: '/assets/images/escape-geometric-stairs-silhouette.png', category: 'Escape', title: 'Geometric Stairs Silhouette' },
  { id: 'escape-7', src: '/assets/images/escape-meadow-workspace-clouds.png', category: 'Escape', title: 'Meadow Workspace Clouds' },
  { id: 'escape-8', src: '/assets/images/escape-mountain-desk-wilderness.png', category: 'Escape', title: 'Mountain Desk Wilderness' },
  // Feel
  { id: 'feel-1', src: '/assets/images/feel-abstract-figure-warm-tones.png', category: 'Feel', title: 'Abstract Figure Warm Tones' },
  { id: 'feel-2', src: '/assets/images/feel-delicate-abstract-movement.png', category: 'Feel', title: 'Delicate Abstract Movement' },
  { id: 'feel-3', src: '/assets/images/feel-dynamic-spin-motion-dress.png', category: 'Feel', title: 'Dynamic Spin Motion Dress' },
  { id: 'feel-4', src: '/assets/images/feel-ethereal-portrait-softness.png', category: 'Feel', title: 'Ethereal Portrait Softness' },
  { id: 'feel-5', src: '/assets/images/feel-flowing-fabric-grace.png', category: 'Feel', title: 'Flowing Fabric Grace' },
  { id: 'feel-6', src: '/assets/images/feel-motion-blur-bouquet-flowers.png', category: 'Feel', title: 'Motion Blur Bouquet Flowers' },
  { id: 'feel-7', src: '/assets/images/feel-portrait-shadow-play.png', category: 'Feel', title: 'Portrait Shadow Play' },
  { id: 'feel-8', src: '/assets/images/feel-water-droplets-diagonal-reflection.png', category: 'Feel', title: 'Water Droplets Diagonal Reflection' },
  // Lifestyle
  { id: 'lifestyle-1', src: '/assets/images/lifestyle-casual-chic-sidewalk.png', category: 'Lifestyle', title: 'Casual Chic Sidewalk' },
  { id: 'lifestyle-2', src: '/assets/images/lifestyle-confident-street-style.png', category: 'Lifestyle', title: 'Confident Street Style' },
  { id: 'lifestyle-3', src: '/assets/images/lifestyle-contemporary-fashion-portrait.png', category: 'Lifestyle', title: 'Contemporary Fashion Portrait' },
  { id: 'lifestyle-4', src: '/assets/images/lifestyle-editorial-look-urban.png', category: 'Lifestyle', title: 'Editorial Look Urban' },
  { id: 'lifestyle-5', src: '/assets/images/lifestyle-minimalist-white-tones.png', category: 'Lifestyle', title: 'Minimalist White Tones' },
  { id: 'lifestyle-6', src: '/assets/images/lifestyle-modern-aesthetic-pose.png', category: 'Lifestyle', title: 'Modern Aesthetic Pose' },
  { id: 'lifestyle-7', src: '/assets/images/lifestyle-urban-angel-street-fashion.png', category: 'Lifestyle', title: 'Urban Angel Street Fashion' },
  { id: 'lifestyle-8', src: '/assets/images/lifestyle-yellow-puffer-portrait.png', category: 'Lifestyle', title: 'Yellow Puffer Portrait' },
  // Move
  { id: 'move-1', src: '/assets/images/move-abstract-dance-flow.png', category: 'Move', title: 'Abstract Dance Flow' },
  { id: 'move-2', src: '/assets/images/move-athletic-motion-energy.png', category: 'Move', title: 'Athletic Motion Energy' },
  { id: 'move-3', src: '/assets/images/move-dynamic-figure-action.png', category: 'Move', title: 'Dynamic Figure Action' },
  { id: 'move-4', src: '/assets/images/move-flowing-movement-grace.png', category: 'Move', title: 'Flowing Movement Grace' },
  { id: 'move-5', src: '/assets/images/move-gesture-blur-dance.png', category: 'Move', title: 'Gesture Blur Dance' },
  { id: 'move-6', src: '/assets/images/move-kinetic-energy-motion.png', category: 'Move', title: 'Kinetic Energy Motion' },
  { id: 'move-7', src: '/assets/images/move-palm-trees-runners-motion.png', category: 'Move', title: 'Palm Trees Runners Motion' },
  { id: 'move-8', src: '/assets/images/move-speed-blur-running.png', category: 'Move', title: 'Speed Blur Running' },
  // Work
  { id: 'work-1', src: '/assets/images/work-business-presentation.png', category: 'Work', title: 'Business Presentation' },
  { id: 'work-2', src: '/assets/images/work-conference-networking-event.png', category: 'Work', title: 'Conference Networking Event' },
  { id: 'work-3', src: '/assets/images/work-corporate-environment.png', category: 'Work', title: 'Corporate Environment' },
  { id: 'work-4', src: '/assets/images/work-iterra-brand-green-hills.png', category: 'Work', title: 'Iterra Brand Green Hills' },
  { id: 'work-5', src: '/assets/images/work-office-workspace-modern.png', category: 'Work', title: 'Office Workspace Modern' },
  { id: 'work-6', src: '/assets/images/work-professional-collaboration.png', category: 'Work', title: 'Professional Collaboration' },
  { id: 'work-7', src: '/assets/images/work-professional-setting.png', category: 'Work', title: 'Professional Setting' },
  { id: 'work-8', src: '/assets/images/work-team-meeting-discussion.png', category: 'Work', title: 'Team Meeting Discussion' },
];

const categories: Category[] = ['All', 'Auto', 'Lifestyle', 'Move', 'Escape', 'Work', 'Feel'];

function ImageModal({ 
  image, 
  images,
  currentIndex,
  onClose,
  onNavigate 
}: { 
  image: ArtImage; 
  images: ArtImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Left Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30 group"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30 group"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 text-white/70 text-sm font-accent tracking-wider z-30">
        {currentIndex + 1} / {images.length}
      </div>
      
      <motion.div 
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        key={image.id}
      >
        <Image
          src={image.src}
          alt={image.title}
          width={1200}
          height={800}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          quality={95}
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{image.title}</h3>
              <span className="text-sm text-white/70">{image.category}</span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-vanilla text-brand-charcoal font-medium text-sm hover:bg-brand-vanilla/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </motion.div>

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/40 text-xs font-accent tracking-wider z-30">
        <span>← → Navigate</span>
        <span>•</span>
        <span>ESC Close</span>
      </div>
    </motion.div>
  );
}

// Category Description Section Component
function CategoryDescription({ category }: { category: Category }) {
  const content = categoryContent[category];
  
  return (
    <motion.div 
      key={category}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-12 pt-10 border-t border-brand-vanilla/10"
    >
      {/* Subtitle - OffBit Font */}
      <motion.p 
        className="font-accent text-xs tracking-[0.3em] text-brand-aperol mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {content.subtitle}
      </motion.p>
      
      {/* Title */}
      <motion.h3 
        className="font-display text-3xl md:text-4xl font-bold text-brand-vanilla mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {content.title}
      </motion.h3>
      
      {/* Description */}
      <motion.p 
        className="text-brand-vanilla/70 text-base md:text-lg leading-relaxed max-w-3xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {content.description}
      </motion.p>
      
      {/* Tags - Simple text with dot separators */}
      <motion.div 
        className="flex flex-wrap items-center gap-x-1 gap-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {content.tags.map((tag, index) => (
          <React.Fragment key={tag}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="font-accent text-xs tracking-[0.15em] uppercase text-brand-vanilla/60"
            >
              {tag}
            </motion.span>
            {index < content.tags.length - 1 && (
              <span className="text-brand-vanilla/30 mx-2">•</span>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function ArtDirectionPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter images based on selected category
  const filteredImages = selectedCategory === 'All' 
    ? artImages 
    : artImages.filter(img => img.category === selectedCategory);

  // Get the currently selected image
  const selectedImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  // Reset active image when category changes
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setActiveImage(0);
  };

  // Download function - creates a ZIP file with all images in current category
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      const categoryName = selectedCategory === 'All' ? 'all-art-direction' : selectedCategory.toLowerCase();
      const folder = zip.folder(categoryName);
      
      if (!folder) {
        throw new Error('Failed to create zip folder');
      }

      // Fetch all images and add to zip
      await Promise.all(
        filteredImages.map(async (image) => {
          try {
            const response = await fetch(image.src);
            const blob = await response.blob();
            const filename = image.src.split('/').pop() || `${image.id}.png`;
            folder.file(filename, blob);
          } catch (error) {
            console.error(`Failed to fetch ${image.src}:`, error);
          }
        })
      );

      // Generate and download zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `art-direction-${categoryName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <BrandHubLayout
        title="Art Direction"
        description="Our visual language spans automotive excellence, lifestyle moments, dynamic movement, escapist dreams, professional environments, and emotional resonance."
      >
        {/* Filter Buttons + Download Button - Same row, matching original layout */}
        <div className="flex flex-wrap gap-2 items-center mb-8">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-brand-aperol text-brand-vanilla shadow-lg shadow-brand-aperol/20'
                    : 'bg-brand-vanilla/10 text-brand-vanilla/70 hover:bg-brand-vanilla/20 hover:text-brand-vanilla'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {category}
              </motion.button>
            );
          })}

          {/* Download Button - Icon Only, pushed to right */}
          <motion.button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className={`
              w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ml-auto
              ${isDownloading
                ? 'bg-brand-vanilla/5 text-brand-vanilla/40 cursor-not-allowed'
                : 'bg-brand-charcoal border border-brand-vanilla/20 text-brand-vanilla hover:bg-brand-vanilla/10'
              }
            `}
            whileHover={!isDownloading ? { scale: 1.05 } : {}}
            whileTap={!isDownloading ? { scale: 0.95 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            title={`Download ${selectedCategory === 'All' ? 'all images' : selectedCategory + ' images'} as ZIP`}
          >
            {isDownloading ? (
              <motion.div 
                className="w-4 h-4 border-2 border-brand-vanilla/40 border-t-brand-vanilla rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Gallery - Horizontal Accordion Style (matching original exactly) */}
        <motion.div
          id="art-direction"
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative w-full"
        >
          {/* Desktop: Horizontal Gallery */}
          <div className="hidden md:flex w-full items-center justify-center gap-1">
            {filteredImages.map((image, index) => (
              <motion.div
                key={`${selectedCategory}-${index}-${image.id}`}
                className="relative cursor-pointer overflow-hidden rounded-3xl"
                initial={false}
                animate={{
                  width: activeImage === index ? '28rem' : '5rem',
                  height: '24rem',
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setSelectedImageIndex(index)}
                onMouseEnter={() => setActiveImage(index)}
              >
                {/* Gradient Overlay on Active */}
                <AnimatePresence>
                  {activeImage === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10"
                    />
                  )}
                </AnimatePresence>
                
                {/* Category Label on Active (only when <= 5 images) */}
                <AnimatePresence>
                  {activeImage === index && filteredImages.length <= 8 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute flex h-full w-full flex-col items-end justify-end p-4 z-20"
                    >
                      <p className="text-left text-xs text-white/70 font-accent tracking-wider uppercase">
                        {image.category}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Image */}
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 28rem"
                  quality={90}
                  priority={index < 3}
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile: Vertical Accordion Gallery */}
          <div className="flex md:hidden w-full flex-col items-center justify-center gap-1">
            {filteredImages.slice(0, 10).map((image, index) => (
              <motion.div
                key={`${selectedCategory}-mobile-${index}-${image.id}`}
                className="relative cursor-pointer overflow-hidden rounded-3xl w-full"
                initial={false}
                animate={{ 
                  height: activeImage === index ? '20rem' : '2.75rem' 
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setActiveImage(activeImage === index ? -1 : index)}
              >
                {/* Gradient Overlay on Active */}
                <AnimatePresence>
                  {activeImage === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10"
                    />
                  )}
                </AnimatePresence>

                {/* Category Label on Active */}
                <AnimatePresence>
                  {activeImage === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      className="absolute inset-0 flex items-end justify-end px-4 pb-4 z-20"
                    >
                      <p className="text-xs text-white/70 font-accent tracking-wider uppercase">{image.category}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image */}
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover select-none"
                  sizes="100vw"
                  quality={85}
                />
              </motion.div>
            ))}

            {/* Truncation indicator for mobile */}
            {filteredImages.length > 10 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-4 text-center"
              >
                <p className="text-sm text-brand-vanilla/50 font-accent tracking-wider">
                  +{filteredImages.length - 10} more {filteredImages.length - 10 === 1 ? 'image' : 'images'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Category Description Section */}
        <AnimatePresence mode="wait">
          <CategoryDescription key={selectedCategory} category={selectedCategory} />
        </AnimatePresence>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-20 text-os-text-secondary-dark">
            No images found for {selectedCategory}.
          </div>
        )}

        {/* Image Modal */}
        <AnimatePresence>
          {selectedImage && selectedImageIndex !== null && (
            <ImageModal 
              image={selectedImage}
              images={filteredImages}
              currentIndex={selectedImageIndex}
              onClose={() => setSelectedImageIndex(null)}
              onNavigate={(index) => setSelectedImageIndex(index)}
            />
          )}
        </AnimatePresence>
      </BrandHubLayout>
    </div>
  );
}
