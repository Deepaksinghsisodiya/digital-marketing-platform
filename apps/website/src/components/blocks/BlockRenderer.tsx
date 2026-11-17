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
import { ComparisonTable } from "./ComparisonTable";
import { RoiCalculator } from "./RoiCalculator";
import { ProcessSteps } from "./ProcessSteps";
import { BookingEmbed } from "./BookingEmbed";
import { LogoStripBlock } from "./LogoStripBlock";
import { BentoGridBlock } from "./BentoGridBlock";
import { CaseStudiesBlock } from "./CaseStudiesBlock";
import { Reveal } from "../motion/Reveal";

const BLOCK_REGISTRY: Record<string, React.FC<{ block: CmsBlock }>> = {
  Hero: HeroBlock,
  FeatureGrid: FeatureGridBlock,
  RichText: RichTextBlock,
  Stats: StatsBlock,
  CTA: CtaBlock,
  FAQ: FaqBlock,
  Testimonials: TestimonialsBlock,
  Pricing: PricingBlock,
  ComparisonTable: ComparisonTable,
  Comparison: ComparisonTable,
  RoiCalculator: RoiCalculator,
  ROI: RoiCalculator,
  ProcessSteps: ProcessSteps,
  Process: ProcessSteps,
  BookingEmbed: BookingEmbed,
  Booking: BookingEmbed,
  LogoStrip: LogoStripBlock,
  TrustStrip: LogoStripBlock,
  BentoGrid: BentoGridBlock,
  Bento: BentoGridBlock,
  CaseStudies: CaseStudiesBlock,
  Portfolio: CaseStudiesBlock,
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

        if (block.type === "Hero") {
          return <Component key={block.id} block={block} />;
        }

        return (
          <Reveal
            key={block.id}
            variant="fade-up"
            distance="md"
            duration="slow"
            as="div"
            className="w-full"
          >
            <Component block={block} />
          </Reveal>
        );
      })}
    </div>
  );
};
