import React, { useState, useMemo } from "react";
import { toast } from "../utils/toast";
import {
  useGetEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
  useSendTestEmailMutation,
  useGetEmailLogsQuery,
  useProcessOutboxMutation,
} from "../store/api/adminApi";
import type { EmailTemplateDto } from "../types";
import { TableSkeleton, CardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { SearchInput } from "../components/ui/SearchInput";
import {
  Mail,
  Send,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Sparkles,
  Search,
  Code2,
  FileText,
  Sliders,
  Play,
  ArrowLeft,
  Copy,
  Layers,
  Inbox,
  Filter,
} from "lucide-react";

interface MockVariables {
  [key: string]: string;
}

const DEFAULT_MOCK_VARIABLES: MockVariables = {
  "lead.name": "Vikram Malhotra",
  "lead.company": "Apex Global Ventures",
  "lead.email": "vikram.m@apexventures.io",
  "lead.phone": "+91 98765 43210",
  "lead.region": "US",
  "platform.companyName": "Nexora Digital",
  "action.url": "http://localhost:5173/admin",
  "support.email": "support@nexora.local",
  "user.name": "Alex Morgan",
  "user.role": "Sales",
  "invite.link":
    "http://localhost:5173/auth/setup-password?token=sample_invite_token",
  "reset.link":
    "http://localhost:5173/auth/reset-password?token=sample_reset_token",
  expires_hours: "48",
  expires_minutes: "30",
  timestamp: "2026-11-11 21:00 UTC",
  "client.name": "Sarah Jenkins",
  "client.company": "Acme Global Corp",
  "manager.name": "Rahul Verma",
  "manager.email": "rahul.v@nexora.local",
  "proposal.title": "Enterprise Performance Marketing Q1-Q2",
  "proposal.url": "http://localhost:5173/proposals/sample_scope",
  expires_at: "2026-12-01",
  "milestone.title": "Full-Funnel Tracking & Google Ads Setup",
  "project.name": "Scale2026 Growth Accelerator",
  summary:
    "Configured server-side conversion tracking, launched 4 search campaigns, and established ROI dashboards.",
  "report.month": "November 2026",
  "report.leads_count": "142 Qualified Leads",
  "report.conversion_rate": "4.8%",
  "report.pipeline_value": "$280,000",
  "report.download_url": "http://localhost:5173/reports/download/sample.pdf",
  "task.title": "Finalize Q1 Search Retargeting Ad Creatives",
  "task.priority": "High",
  "task.due_date": "2026-11-15",
  assigned_by: "Vikram Malhotra",
};

const VARIABLE_TAGS = [
  { tag: "{{lead.name}}", label: "Lead Name", sample: "Vikram Malhotra" },
  { tag: "{{lead.company}}", label: "Company", sample: "Apex Global Ventures" },
  {
    tag: "{{lead.email}}",
    label: "Lead Email",
    sample: "vikram.m@apexventures.io",
  },
  { tag: "{{user.name}}", label: "User Name", sample: "Alex Morgan" },
  { tag: "{{user.role}}", label: "Role", sample: "Sales" },
  { tag: "{{client.name}}", label: "Client Contact", sample: "Sarah Jenkins" },
  {
    tag: "{{client.company}}",
    label: "Client Company",
    sample: "Acme Global Corp",
  },
  {
    tag: "{{task.title}}",
    label: "Task Title",
    sample: "Finalize Ad Creatives",
  },
  {
    tag: "{{platform.companyName}}",
    label: "Platform Name",
    sample: "Nexora Digital",
  },
  {
    tag: "{{action.url}}",
    label: "Action URL",
    sample: "http://localhost:5173/admin",
  },
];

export const EmailTemplatesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"templates" | "logs">("templates");
  const {
    data: templates,
    isLoading: loadingTemplates,
    refetch: refetchTemplates,
  } = useGetEmailTemplatesQuery();
  const {
    data: logs,
    isLoading: loadingLogs,
    refetch: refetchLogs,
  } = useGetEmailLogsQuery(100);

  const [updateTemplate, { isLoading: updating }] =
    useUpdateEmailTemplateMutation();
  const [sendTestEmail, { isLoading: sendingTest }] =
    useSendTestEmailMutation();
  const [processOutbox, { isLoading: processingOutbox }] =
    useProcessOutboxMutation();

  // Selected template for full visual studio mode
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplateDto | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [editPlain, setEditPlain] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Editor Sub-tabs & Viewport
  const [editorTab, setEditorTab] = useState<"html" | "plain">("html");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [previewKey, setPreviewKey] = useState(0);

  // Mock variables for live rendering
  const [mockVars, setMockVars] = useState<MockVariables>(
    DEFAULT_MOCK_VARIABLES,
  );
  const [showVarsEditor, setShowVarsEditor] = useState(false);

  // Test email recipient
  const [testEmailTo, setTestEmailTo] = useState("admin@nexora.local");
  const [testFeedback, setTestFeedback] = useState<{
    success?: string;
    error?: string;
  } | null>(null);

  // Logs filters & search
  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState<number | "all">("all");

  const openEditor = (t: EmailTemplateDto) => {
    setSelectedTemplate(t);
    setEditName(t.name);
    setEditSubject(t.subjectTemplate);
    setEditHtml(t.bodyHtmlTemplate);
    setEditPlain(t.bodyPlainTextTemplate ?? "");
    setEditActive(Boolean(t.isActive ?? true));
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    setTestFeedback(null);
  };

  const handleInsertTag = (tag: string) => {
    if (editorTab === "html") {
      setEditHtml((prev) => prev + " " + tag);
    } else {
      setEditPlain((prev) => prev + " " + tag);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setSaveErrorMsg(null);
      await updateTemplate({
        key: selectedTemplate.key,
        data: {
          name: editName,
          subjectTemplate: editSubject,
          bodyHtmlTemplate: editHtml,
          bodyPlainTextTemplate: editPlain || null,
          isActive: editActive,
        },
      }).unwrap();

      setSaveSuccessMsg("Template saved and active across transactions.");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      refetchTemplates();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setSaveErrorMsg(error?.data?.error ?? "Failed to update email template.");
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !testEmailTo) return;

    try {
      setTestFeedback(null);
      await sendTestEmail({
        templateKey: selectedTemplate.key,
        toEmail: testEmailTo,
        variables: mockVars,
      }).unwrap();

      setTestFeedback({
        success: `Dispatched successfully to ${testEmailTo}! Delivered to Mailpit (:8025)`,
      });
      refetchLogs();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setTestFeedback({
        error: error?.data?.error ?? "Failed to send test email.",
      });
    }
  };

  const handleManualProcessOutbox = async () => {
    try {
      const res = await processOutbox().unwrap();
      refetchLogs();
      toast.success(
        `Outbox batch executed: ${res.processedCount} messages dispatched.`,
      );
    } catch {
      toast.error("Failed to process outbox queue.");
    }
  };

  // Render merged preview HTML with simulated mock variables
  const renderedPreviewHtml = useMemo(() => {
    let result = editHtml || "<p>Empty template content.</p>";
    Object.entries(mockVars).forEach(([key, val]) => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`{{\\s*${escaped}\\s*}}`, "g"), val);
    });
    return result;
  }, [editHtml, mockVars]);

  // Render merged preview subject
  const renderedPreviewSubject = useMemo(() => {
    let result = editSubject || "No Subject";
    Object.entries(mockVars).forEach(([key, val]) => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`{{\\s*${escaped}\\s*}}`, "g"), val);
    });
    return result;
  }, [editSubject, mockVars]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((l) => {
      const matchesSearch =
        l.recipientEmail.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.subject.toLowerCase().includes(logSearch.toLowerCase()) ||
        (l.templateKey &&
          l.templateKey.toLowerCase().includes(logSearch.toLowerCase()));

      const matchesStatus =
        logStatusFilter === "all" ? true : l.status === logStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [logs, logSearch, logStatusFilter]);

  // -------------------------------------------------------------
  // Full Visual Studio View
  // -------------------------------------------------------------
  if (selectedTemplate) {
    return (
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Templates</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {editName || selectedTemplate.name}
                </h2>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                  {selectedTemplate.key}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual transactional email designer with live merge tag
                rendering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Active Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {editActive ? "Template Active" : "Disabled"}
              </span>
            </label>

            {/* Mailpit Link */}
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
              title="Open Mailpit Webmail UI (:8025)"
            >
              <Inbox className="w-3.5 h-3.5 text-primary" />
              <span>Mailpit Inbox</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Save Template Button */}
            <button
              onClick={() => handleSave()}
              disabled={updating}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-hover shadow-xs shadow-primary/25 transition disabled:opacity-50 cursor-pointer"
            >
              {updating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{updating ? "Saving..." : "Save Template"}</span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {saveSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
        {saveErrorMsg && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        {/* Main Split Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor & Configuration (7 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4">
            {/* Template Identity Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Template Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Lead Inbound Welcome"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Subject Line Template
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    Supports merge tags
                  </span>
                </div>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Thank you for contacting Nexora, {{lead.name}}"
                />
              </div>

              {/* Merge Variable Tags Pill Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Insert Merge Variables
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVarsEditor(!showVarsEditor)}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>
                      {showVarsEditor ? "Hide Sample Data" : "Edit Sample Data"}
                    </span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLE_TAGS.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertTag(v.tag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-mono text-[11px] font-semibold border border-primary/20 transition group cursor-pointer"
                      title={`Click to append ${v.tag}`}
                    >
                      <span>{v.tag}</span>
                      <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Variables Inspector Drawer */}
              {showVarsEditor && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Sample Data for Live Preview
                    </span>
                    <button
                      onClick={() => setMockVars(DEFAULT_MOCK_VARIABLES)}
                      className="text-[10px] text-slate-500 hover:text-primary underline cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(mockVars).map(([key, val]) => (
                      <div key={key}>
                        <label className="block text-[10px] font-mono text-slate-500 truncate mb-1">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            setMockVars({ ...mockVars, [key]: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Template Body Editor Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorTab("html")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      editorTab === "html"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>HTML Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("plain")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      editorTab === "plain"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Plain Text Fallback</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {editorTab === "html"
                    ? `${editHtml.length} characters`
                    : `${editPlain.length} characters`}
                </span>
              </div>

              {editorTab === "html" ? (
                <div>
                  <textarea
                    rows={16}
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    className="w-full font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 leading-relaxed focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="<!DOCTYPE html><html><body><h1>Hello {{lead.name}}</h1></body></html>"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tip: Inline styles and standard responsive table layouts
                    ensure 100% email client compatibility.
                  </p>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={12}
                    value={editPlain}
                    onChange={(e) => setEditPlain(e.target.value)}
                    className="w-full font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 leading-relaxed focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="Plain text fallback message for text-only email clients..."
                  />
                </div>
              )}
            </div>

            {/* Test Send Dispatch Drawer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Send Live Test Delivery
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Routes to Mailpit (:8025)
                </span>
              </div>

              {testFeedback?.success && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{testFeedback.success}</span>
                </div>
              )}
              {testFeedback?.error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{testFeedback.error}</span>
                </div>
              )}

              <form onSubmit={handleSendTest} className="flex gap-2">
                <input
                  type="email"
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                  placeholder="recipient@company.com"
                  required
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-hover shadow-xs shadow-primary/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {sendingTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{sendingTest ? "Sending..." : "Dispatch Test"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Interactive Email Client Mockup (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 sticky top-20 space-y-3">
            {/* Mockup Toolbar */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Live Email Client Preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport switcher */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Desktop Preview"
                  >
                    <Laptop className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Mobile 375px Preview"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                {/* Refresh preview */}
                <button
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Re-render preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Client Simulated Envelope */}
            <div
              className={`mx-auto rounded-3xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden transition-all duration-300 ${
                previewDevice === "mobile" ? "max-w-[390px]" : "w-full"
              }`}
            >
              {/* Window Header */}
              <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    Inbox Preview
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {previewDevice === "mobile" ? "Mobile View" : "Desktop View"}
                </span>
              </div>

              {/* Email Envelope Metadata */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5 text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-400 w-16">
                    Subject:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {renderedPreviewSubject}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-slate-400 w-16">
                    From:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    Nexora Growth &lt;noreply@nexora.local&gt;
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-slate-400 w-16">To:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {mockVars["lead.email"] || "recipient@company.com"}
                  </span>
                </div>
              </div>

              {/* Interactive Iframe Rendering */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 min-h-[500px]">
                <iframe
                  key={previewKey}
                  title="Email Preview"
                  srcDoc={renderedPreviewHtml}
                  sandbox="allow-same-origin"
                  className="w-full min-h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm"
                  style={{ minHeight: "520px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default Dashboard & Directory View
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Transactional Email & Outbox Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Enterprise Outbox
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual HTML template designer, dynamic merge variable tags, live
            sandbox preview, and transactional delivery telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8025"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <Inbox className="w-3.5 h-3.5 text-primary" />
            <span>Open Mailpit (:8025)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={handleManualProcessOutbox}
            disabled={processingOutbox}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs shadow-primary/25 transition disabled:opacity-50 cursor-pointer"
          >
            <Play
              className={`w-3.5 h-3.5 ${processingOutbox ? "animate-spin" : ""}`}
            />
            <span>
              {processingOutbox ? "Processing Queue..." : "Run Outbox Worker"}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("templates")}
            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "templates"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Templates ({templates?.length ?? 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Delivery Logs ({logs?.length ?? 0})</span>
          </button>
        </nav>
      </div>

      {/* Templates Tab Content */}
      {activeTab === "templates" ? (
        loadingTemplates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton count={6} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.map((t) => (
              <div
                key={t.key}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs hover:shadow-lg hover:border-primary/40 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {t.key}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      <span>{t.isActive ? "Active" : "Disabled"}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider block mb-0.5">
                      Subject Line:
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 line-clamp-2">
                      {t.subjectTemplate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-5">
                  <span className="text-[11px] text-slate-400">
                    Updated{" "}
                    {new Date(
                      t.updatedAtUtc || t.createdAtUtc,
                    ).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => openEditor(t)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visual Studio</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Logs Tab */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="w-full sm:w-80">
              <SearchInput
                value={logSearch}
                onChange={setLogSearch}
                placeholder="Search by recipient or subject..."
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={logStatusFilter}
                onChange={(e) =>
                  setLogStatusFilter(
                    e.target.value === "all"
                      ? "all"
                      : parseInt(e.target.value, 10),
                  )
                }
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value={2}>Sent (Success)</option>
                <option value={3}>Failed (Error)</option>
                <option value={1}>Pending (In Outbox)</option>
              </select>

              <button
                type="button"
                onClick={() => refetchLogs()}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
                title="Refresh logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <TableSkeleton rows={8} columns={6} hasControls={false} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800 shadow-2xs">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Timestamp (UTC)</th>
                    <th className="px-5 py-3.5 text-left">Recipient</th>
                    <th className="px-5 py-3.5 text-left">Subject</th>
                    <th className="px-5 py-3.5 text-left">Template Key</th>
                    <th className="px-5 py-3.5 text-left">Delivery Status</th>
                    <th className="px-5 py-3.5 text-left">Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {filteredLogs.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(l.createdAtUtc).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {l.recipientEmail}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {l.subject}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {l.templateKey ?? "custom"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            l.status === 2
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                              : l.status === 3
                                ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              l.status === 2
                                ? "bg-emerald-500"
                                : l.status === 3
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          <span>
                            {l.status === 2
                              ? "Dispatched"
                              : l.status === 3
                                ? "Failed"
                                : "Queued"}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {l.errorMessage ? (
                          <span className="text-red-500 truncate max-w-xs block font-mono text-[11px]">
                            {l.errorMessage}
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-[11px] font-mono">
                            Mailpit OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <EmptyState
                          title="No delivery logs matched"
                          description="No email outbox delivery records matched your search query or filter."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
