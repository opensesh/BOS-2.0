import { BrandLoader } from "@/components/ui/brand-loader";

export default function BrandLoaderDemo() {
  return (
    <div className="min-h-screen w-full bg-brand-charcoal">
      {/* Demo Section */}
      <div className="container-responsive py-16">
        <h1 className="text-h1-mobile md:text-h1-tablet xl:text-h1-desktop font-display text-brand-vanilla mb-12 text-center">
          Brand Loader Component
        </h1>

        {/* Pulse Variant - Default */}
        <div className="mb-16">
          <h2 className="text-h3 md:text-h3-tablet xl:text-h3-desktop font-display text-brand-vanilla mb-6 text-center">
            Pulse Animation (Default)
          </h2>
          <div className="flex min-h-[250px] w-full items-center justify-center rounded-lg bg-brand-charcoal/50 p-8 border border-brand-vanilla/10">
            <BrandLoader size={120} variant="pulse" />
          </div>
        </div>

        {/* Rotate Variant */}
        <div className="mb-16">
          <h2 className="text-h3 md:text-h3-tablet xl:text-h3-desktop font-display text-brand-vanilla mb-6 text-center">
            Rotate Animation
          </h2>
          <div className="flex min-h-[250px] w-full items-center justify-center rounded-lg bg-brand-charcoal/50 p-8 border border-brand-vanilla/10">
            <BrandLoader size={120} variant="rotate" />
          </div>
        </div>

        {/* Different Sizes */}
        <div className="mb-16">
          <h2 className="text-h3 md:text-h3-tablet xl:text-h3-desktop font-display text-brand-vanilla mb-6 text-center">
            Various Sizes
          </h2>
          <div className="flex min-h-[250px] w-full items-center justify-center gap-8 rounded-lg bg-brand-charcoal/50 p-8 border border-brand-vanilla/10 flex-wrap">
            <BrandLoader size={40} variant="pulse" />
            <BrandLoader size={60} variant="pulse" />
            <BrandLoader size={100} variant="pulse" />
            <BrandLoader size={150} variant="pulse" />
          </div>
        </div>

        {/* With Custom Styling */}
        <div className="mb-16">
          <h2 className="text-h3 md:text-h3-tablet xl:text-h3-desktop font-display text-brand-vanilla mb-6 text-center">
            With Custom Styling (Aperol Accent)
          </h2>
          <div className="flex min-h-[250px] w-full items-center justify-center rounded-lg bg-brand-charcoal/50 p-8 border border-brand-aperol/30">
            <BrandLoader 
              size={120} 
              variant="pulse"
              className="[&>svg>path]:fill-brand-aperol" 
            />
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-16 rounded-lg bg-brand-charcoal/30 p-8 border border-brand-vanilla/10">
          <h3 className="text-h4-mobile md:text-h4-tablet font-display text-brand-vanilla mb-4">
            Usage Examples
          </h3>
          <div className="space-y-4 font-mono text-b2 text-brand-vanilla/80">
            <div className="bg-brand-charcoal p-4 rounded-md">
              <code className="text-brand-vanilla">
                {`// Default pulse animation`}<br/>
                {`<BrandLoader />`}
              </code>
            </div>
            <div className="bg-brand-charcoal p-4 rounded-md">
              <code className="text-brand-vanilla">
                {`// Rotate animation with custom size`}<br/>
                {`<BrandLoader size={100} variant="rotate" />`}
              </code>
            </div>
            <div className="bg-brand-charcoal p-4 rounded-md">
              <code className="text-brand-vanilla">
                {`// Custom color (Aperol accent)`}<br/>
                {`<BrandLoader className="[&>svg>path]:fill-brand-aperol" />`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

