import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Code2,
  Undo2,
  Redo2,
  Minus,
} from "lucide-react";
import { MediaPickerModal, resolveMediaUrl } from "../pages/media/MediaLibraryPage";

interface RichWysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichWysiwygEditor: React.FC<RichWysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your engaging article content...",
  minHeight = "280px",
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync editor content with incoming value when not typing internally
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const insertLink = () => {
    const url = prompt("Enter hyperlink destination URL:", "https://");
    if (url && url !== "https://") {
      executeCommand("createLink", url);
    }
  };

  const handleInsertMedia = (mediaUrl: string, altText?: string) => {
    const resolved = resolveMediaUrl(mediaUrl);
    const imgHtml = `<figure class="my-4"><img src="${resolved}" alt="${altText || "Article image"}" class="rounded-xl max-w-full h-auto mx-auto border border-slate-200 dark:border-slate-800 shadow-sm" /></figure><p><br></p>`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, imgHtml);
    handleInput();
    setIsMediaModalOpen(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-2 gap-2">
        {/* Formatting Actions Toolbar */}
        {activeTab === "visual" ? (
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h2>")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h3>")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Bulleted List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<blockquote>")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<pre>")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Code Block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertHorizontalRule")}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Horizontal Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition"
              title="Insert Hyperlink"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs transition"
              title="Insert Asset from Media Library"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Insert Image</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1">
            {activeTab === "html" ? "Source HTML Editor Mode" : "Reader Preview Mode"}
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              activeTab === "visual"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              activeTab === "html"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
              activeTab === "preview"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-4" style={{ minHeight }}>
        {activeTab === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 outline-none focus:outline-none min-h-[240px]"
            data-placeholder={placeholder}
          />
        )}

        {activeTab === "html" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="<p>Write raw HTML here...</p>"
          />
        )}

        {activeTab === "preview" && (
          <div
            className="prose dark:prose-invert max-w-none text-xs sm:text-sm p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800"
            dangerouslySetInnerHTML={{ __html: value || "<p class='text-slate-400 italic'>Nothing to preview yet.</p>" }}
          />
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url, altText) => handleInsertMedia(url, altText)}
      />
    </div>
  );
};
