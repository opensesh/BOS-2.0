'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X, ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';

export interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  sourceUrl: string;
  sourceName: string;
  width?: number;
  height?: number;
}

interface ImagesViewProps {
  query: string;
  images: ImageResult[];
}

export function ImagesView({ query, images }: ImagesViewProps) {
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-os-text-secondary-dark">
        <ImageIcon className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-sm">No images available for this search</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search query header */}
        <p className="text-sm text-os-text-secondary-dark">
          Image results for: <span className="font-medium text-os-text-primary-dark">{query}</span>
        </p>

        {/* Image grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, idx) => (
            <ImageCard
              key={image.id || idx}
              image={image}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <ImageLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

function ImageCard({
  image,
  onClick,
}: {
  image: ImageResult;
  onClick: () => void;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="aspect-square rounded-lg bg-os-surface-dark flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-os-text-secondary-dark/40" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative aspect-square rounded-lg overflow-hidden bg-os-surface-dark hover:ring-2 hover:ring-brand-aperol/50 transition-all"
    >
      <Image
        src={image.thumbnailUrl || image.url}
        alt={image.title || 'Search result image'}
        fill
        className="object-cover"
        unoptimized
        onError={() => setError(true)}
      />
      
      {/* Overlay with source */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-white/70" />
          <span className="text-[11px] text-white/90 truncate">
            {image.sourceName}
          </span>
        </div>
      </div>
    </button>
  );
}

function ImageLightbox({
  image,
  onClose,
}: {
  image: ImageResult;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div
        className="relative max-w-4xl max-h-[80vh] m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image.url}
          alt={image.title || 'Image'}
          width={image.width || 800}
          height={image.height || 600}
          className="max-h-[70vh] w-auto object-contain rounded-lg"
          unoptimized
        />

        {/* Source info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-white">
            {image.title && (
              <p className="text-sm font-medium mb-1">{image.title}</p>
            )}
            <p className="text-xs text-white/60">{image.sourceName}</p>
          </div>
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm text-white"
          >
            <span>View source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

