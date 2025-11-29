'use client';

import Image from 'next/image';

interface BrandmarkProps {
  className?: string;
  size?: number;
}

export function Brandmark({ className = '', size = 32 }: BrandmarkProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/assets/logos/brandmark-vanilla.svg"
        alt="Brand Operating System"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  );
}
