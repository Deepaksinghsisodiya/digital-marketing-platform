import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { HeroBlock } from "./HeroBlock";
import { FeatureGridBlock } from "./FeatureGridBlock";
import { RichTextBlock } from "./RichTextBlock";
import { StatsBlock } from "./StatsBlock";
import { CtaBlock } from "./CtaBlock";
import { FaqBlock } from "./FaqBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { ProcessSteps } from "./ProcessSteps";
import { BookingEmbed } from "./BookingEmbed";
import { LogoStripBlock } from "./LogoStripBlock";
import { BentoGridBlock } from "./BentoGridBlock";
import { CaseStudiesBlock } from "./CaseStudiesBlock";
import { ChannelsGrowthDiagram } from "./ChannelsGrowthDiagram";
import { TechEcosystemBlock } from "./TechEcosystemBlock";
import { PricingBlock } from "./PricingBlock";
import { ROICalculatorBlock } from "./ROICalculatorBlock";
import { ComparisonTableBlock } from "./ComparisonTableBlock";
import { CaseStudyShowcaseBlock } from "./CaseStudyShowcaseBlock";
import { ProcessTimelineBlock } from "./ProcessTimelineBlock";
import { IndustryBlock } from "./IndustryBlock";
import { TeamBlock } from "./TeamBlock";
import { Reveal } from "../motion/Reveal";

const BLOCK_REGISTRY: Record<string, React.FC<{ block: CmsBlock }>> = {
  Hero: HeroBlock,
  FeatureGrid: FeatureGridBlock,
  RichText: RichTextBlock,
  Stats: StatsBlock,
  CTA: CtaBlock,
  FAQ: FaqBlock,
  Testimonials: TestimonialsBlock,
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
  ChannelsGrowth: ChannelsGrowthDiagram,
  GrowthEngine: ChannelsGrowthDiagram,
  TechEcosystem: TechEcosystemBlock,
  Ecosystem: TechEcosystemBlock,
  Pricing: PricingBlock,
  PricingBlock: PricingBlock,
  PricingTiers: PricingBlock,
  RoiCalculator: ROICalculatorBlock,
  ROICalculator: ROICalculatorBlock,
  Roi: ROICalculatorBlock,
  ComparisonTable: ComparisonTableBlock,
  Comparison: ComparisonTableBlock,
  CaseStudyShowcase: CaseStudyShowcaseBlock,
  CaseStudySpotlight: CaseStudyShowcaseBlock,
  ProcessTimeline: ProcessTimelineBlock,
  Timeline: ProcessTimelineBlock,
  Industry: IndustryBlock,
  IndustryBlock: IndustryBlock,
  Industries: IndustryBlock,
  Team: TeamBlock,
  TeamBlock: TeamBlock,
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
          return null;
        }

        const tone = (block.settings?.tone as string) || "light";
        const toneClass =
          tone === "dark"
            ? "bg-slate-50 text-slate-900 border-y border-slate-200/80"
            : tone === "alt"
              ? "bg-slate-50/70 text-slate-900 border-y border-slate-200/80"
              : tone === "brand-gradient"
                ? "bg-gradient-to-br from-slate-50 via-primary/5 to-white text-slate-900"
                : "";

        const animation = (block.settings?.animation as string) || "subtle";

        if (block.type === "Hero" || animation === "none") {
          return (
            <div key={block.id} className={`w-full ${toneClass}`}>
              <Component block={block} />
            </div>
          );
        }

        return (
          <Reveal
            key={block.id}
            variant="fade-up"
            distance={animation === "rich" ? "lg" : "md"}
            duration={animation === "rich" ? "slower" : "slow"}
            as="div"
            className={`w-full ${toneClass}`}
          >
            <Component block={block} />
          </Reveal>
        );
      })}
    </div>
  );
};
