import React from "react";
import type { CmsBlock } from "../../lib/cms";

export const RichTextBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const body = (content.body as string) || "";

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto prose prose-slate prose-lg">
      <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans">
        {body}
      </div>
    </section>
  );
};
