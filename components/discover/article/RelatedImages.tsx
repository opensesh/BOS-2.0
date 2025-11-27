import React from 'react';
import Image from 'next/image';

interface RelatedImagesProps {
    images: string[];
}

export function RelatedImages({ images }: RelatedImagesProps) {
    if (!images || images.length === 0) return null;

    return (
        <div className="grid grid-cols-2 gap-4 my-8">
            {images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-os-surface-dark">
                    <Image 
                        src={img}
                        alt={`Related image ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            ))}
        </div>
    )
}

