import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Marquee } from "@/components/ui/marquee";
import { Counter } from "@/components/ui/counter";
import { Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function DesignSystemPage() {
  // Production guard: 404 in production
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="border-b border-slate-800 pb-8">
        <Badge variant="sample">Dev Only Environment</Badge>
        <h1 className="text-4xl font-black tracking-tight text-white mt-4">
          Nexora Design System & Primitives
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Live reference of all token variables, Radix primitives, interactive
          widgets, and typography rhythms.
        </p>
      </div>

      {/* 1. Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" /> Buttons & Triggers
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="default">Default Solid</Button>
          <Button variant="gradient">
            Gradient Pill <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary Dark</Button>
          <Button variant="ghost">Ghost Trigger</Button>
          <Button variant="accent">Accent Cyan</Button>
          <Button variant="link">Inline Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large Hero CTA</Button>
        </div>
      </section>

      {/* 2. Badges */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Status Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Primary Indigo</Badge>
          <Badge variant="secondary">Secondary Slate</Badge>
          <Badge variant="accent">Accent Cyan</Badge>
          <Badge variant="success">Active / 99.9% Uptime</Badge>
          <Badge variant="warning">Under Review</Badge>
          <Badge variant="destructive">Critical Alert</Badge>
          <Badge variant="sample">Sample Data Disclaimer</Badge>
        </div>
      </section>

      {/* 3. Cards & Bento Grid Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          Cards & Glass Elevation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all">
            <CardHeader>
              <CardTitle>Performance SEO</CardTitle>
              <CardDescription>
                Enterprise commercial search visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                Data-driven architecture driving verified organic revenue and
                pipeline capture.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link">Learn more &rarr;</Button>
            </CardFooter>
          </Card>

          <Card className="hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all">
            <CardHeader>
              <CardTitle>Animated Counter</CardTitle>
              <CardDescription>Real-time metric telemetry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">
                <Counter end={340} suffix="%" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Average enterprise conversion lift
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all">
            <CardHeader>
              <CardTitle>Compliance Verified</CardTitle>
              <CardDescription>Zero data leaks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Tabs & Accordion */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Tabs Interface</h2>
          <Tabs defaultValue="strategy">
            <TabsList>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="attribution">Attribution</TabsTrigger>
            </TabsList>
            <TabsContent
              value="strategy"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700"
            >
              High-intent audience modeling and commercial ICP mapping.
            </TabsContent>
            <TabsContent
              value="execution"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700"
            >
              Multi-channel programmatic deployment and split-testing.
            </TabsContent>
            <TabsContent
              value="attribution"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700"
            >
              Deterministic server-side multi-touch conversion tracking.
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Radix Accordion
          </h2>
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                How are theme tokens injected?
              </AccordionTrigger>
              <AccordionContent>
                Theme tokens are persisted in SQL Server and dynamically
                injected into the Next.js HTML head as CSS variables.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is reduced motion supported?</AccordionTrigger>
              <AccordionContent>
                Yes, system reduced-motion preferences and admin animation
                toggle instantly disable CSS animations.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 5. Inputs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Form Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Input placeholder="Enter your business email" type="email" />
          <Textarea placeholder="Describe your project scope..." />
        </div>
      </section>

      {/* 6. Marquee */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Infinite Marquee</h2>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Marquee speed="normal">
            {[
              "Acme Corp",
              "TechWave",
              "GlobalScale",
              "DataStream",
              "CloudSphere",
            ].map((brand, i) => (
              <span
                key={i}
                className="text-slate-400 font-bold text-lg tracking-wider px-6 flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-400" /> {brand}
              </span>
            ))}
          </Marquee>
        </div>
      </section>
    </div>
  );
}
