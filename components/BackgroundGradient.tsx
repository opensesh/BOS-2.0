'use client';

export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
        }}
      />
      
      {/* Animated Gradient Blob */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-brand-aperol/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-brand-aperol/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
    </div>
  );
}

