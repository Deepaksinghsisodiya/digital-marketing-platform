"use client";

import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { Users, ExternalLink } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string;
}

export const TeamBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const eyebrow = (content?.eyebrow as string) || "Leadership & Strategists";
  const title =
    (content?.title as string) ||
    (content?.sectionTitle as string) ||
    "Meet Our Growth Architects";
  const subtitle =
    (content?.subtitle as string) ||
    (content?.sectionSubtitle as string) ||
    "Senior performance marketers, engineers, and attribution specialists.";

  const members = Array.isArray(content?.members)
    ? (content.members as TeamMember[])
    : Array.isArray(content?.team)
      ? (content.team as TeamMember[])
      : [];

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background text-foreground w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>{eyebrow}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <div
              key={`${member.name}-${idx}`}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center shrink-0">
                    {member.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary truncate">
                    {member.role}
                  </p>
                </div>
              </div>

              {member.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>
              )}

              {member.linkedinUrl && (
                <div className="pt-2 mt-auto">
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
