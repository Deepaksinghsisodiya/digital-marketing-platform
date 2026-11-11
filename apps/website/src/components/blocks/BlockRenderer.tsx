import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { HeroBlock } from "./HeroBlock";
import { FeatureGridBlock } from "./FeatureGridBlock";
import { RichTextBlock } from "./RichTextBlock";
import { StatsBlock } from "./StatsBlock";
import { CtaBlock } from "./CtaBlock";
import { FaqBlock } from "./FaqBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { PricingBlock } from "./PricingBlock";

const BLOCK_REGISTRY: Record<string, React.FC<{ block: CmsBlock }>> = {
  Hero: HeroBlock,
  FeatureGrid: FeatureGridBlock,
  RichText: RichTextBlock,
  Stats: StatsBlock,
  CTA: CtaBlock,
  FAQ: FaqBlock,
  Testimonials: TestimonialsBlock,
  Pricing: PricingBlock,
};

interface BlockRendererProps {
  blocks: CmsBlock[];
  userRegion?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blocks,
  userRegion,
}) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {blocks.map((block) => {
        // 1. Skip disabled blocks
        if (block.enabled === false) {
          return null;
        }

        // 2. Region filter check
        if (
          block.regionFilter &&
          block.regionFilter.length > 0 &&
          userRegion &&
          !block.regionFilter.includes(userRegion)
        ) {
          return null;
        }

        // 3. Resolve block component from registry
        const Component = BLOCK_REGISTRY[block.type];

        if (!Component) {
          // Gracefully skip unknown block and log warning
          // eslint-disable-next-line no-console
          console.warn(
            `[BlockRenderer] Unknown block type: '${block.type}'. Skipping rendering.`,
          );
          return null;
        }

        return <Component key={block.id} block={block} />;
      })}
    </div>
  );
};
