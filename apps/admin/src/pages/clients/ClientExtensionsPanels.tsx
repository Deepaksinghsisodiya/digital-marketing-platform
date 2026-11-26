import React, { useState } from "react";
import {
  useGetClientMilestonesQuery,
  useCreateClientMilestoneMutation,
  useUpdateClientMilestoneStatusMutation,
  useDeleteClientMilestoneMutation,
  useGetClientDocumentsQuery,
  useCreateClientDocumentMutation,
  useDeleteClientDocumentMutation,
  useGenerateClientPortalLinkMutation,
} from "../../store/api/adminApi";
import { toast } from "../../utils/toast";
import {
  Flag,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Link2,
} from "lucide-react";
import { Button } from "../../components/ui/button";

interface MilestoneItem {
  id: string;
  title: string;
  status: number;
  dueDateUtc?: string | null;
}

interface DocumentItem {
  id: string;
  title: string;
  fileUrl: string;
  category?: string | null;
}

interface ClientExtensionsProps {
  clientId: string;
  portalEnabled?: boolean;
  portalToken?: string | null;
}

export const ClientExtensionsPanels: React.FC<ClientExtensionsProps> = ({
  clientId,
  portalEnabled,
  portalToken,
}) => {
  const [activeSection, setActiveSection] = useState<"milestones" | "documents" | "portal">("milestones");

  const { data: milestones = [] } = useGetClientMilestonesQuery(clientId);
  const [createMilestone, { isLoading: creatingMs }] = useCreateClientMilestoneMutation();
  const [updateMilestoneStatus] = useUpdateClientMilestoneStatusMutation();
  const [deleteMilestone] = useDeleteClientMilestoneMutation();
  const [msTitle, setMsTitle] = useState("");
  const [msDue, setMsDue] = useState("");

  const { data: documents = [] } = useGetClientDocumentsQuery(clientId);
  const [createDoc, { isLoading: creatingDoc }] = useCreateClientDocumentMutation();
  const [deleteDoc] = useDeleteClientDocumentMutation();
  const [docTitle, setDocTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const [generatePortalLink, { isLoading: updatingPortal }] = useGenerateClientPortalLinkMutation();
  const [latestPortalPath, setLatestPortalPath] = useState<string | null>(
    portalEnabled && portalToken ? `/client-portal/${portalToken}` : null,
  );

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim()) return;
    try {
      await createMilestone({
        clientId,
        title: msTitle.trim(),
        dueDateUtc: msDue ? new Date(msDue).toISOString() : undefined,
      }).unwrap();
      setMsTitle("");
      setMsDue("");
      toast.success("Milestone added.");
    } catch {
      toast.error("Failed to create milestone.");
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docUrl.trim()) return;
    try {
      await createDoc({
        clientId,
        title: docTitle.trim(),
        fileUrl: docUrl.trim(),
        category: "Deliverable",
      }).unwrap();
      setDocTitle("");
      setDocUrl("");
      toast.success("Document attached.");
    } catch {
      toast.error("Failed to attach document.");
    }
  };

  const handleTogglePortal = async (enabled: boolean, regenerate = false) => {
    try {
      const res = await generatePortalLink({ clientId, enabled, regenerate }).unwrap();
      setLatestPortalPath(res.portalPath || null);
      toast.success(enabled ? "Client portal link active." : "Client portal disabled.");
    } catch {
      toast.error("Failed to update portal link.");
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
        {(
          [
            { id: "milestones", label: `Campaign Milestones (${milestones.length})`, icon: Flag },
            { id: "documents", label: `Strategy Docs (${documents.length})`, icon: FileText },
            { id: "portal", label: "Client Portal", icon: Link2 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                activeSection === tab.id
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSection === "milestones" && (
        <div className="space-y-3">
          <form onSubmit={handleAddMilestone} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              placeholder="Milestone title (e.g. GTM Server-Side Launch)"
              className="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <input
              type="date"
              value={msDue}
              onChange={(e) => setMsDue(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <Button size="sm" type="submit" disabled={creatingMs}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone
            </Button>
          </form>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {(milestones as MilestoneItem[]).map((ms) => (
              <div key={ms.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{ms.title}</span>
                  {ms.dueDateUtc && (
                    <span className="ml-2 text-[11px] text-slate-500">
                      Due {new Date(ms.dueDateUtc).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Milestone status"
                    value={ms.status}
                    onChange={(e) =>
                      updateMilestoneStatus({ milestoneId: ms.id, status: Number(e.target.value) })
                    }
                    className="text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1"
                  >
                    <option value={1}>Pending</option>
                    <option value={2}>In Progress</option>
                    <option value={3}>Completed</option>
                  </select>
                  <button type="button" onClick={() => deleteMilestone(ms.id)} className="text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "documents" && (
        <div className="space-y-3">
          <form onSubmit={handleAddDoc} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title (e.g. Q4 Growth Roadmap)"
              className="w-44 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <input
              type="url"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="File URL (Media Library or Cloud Link)"
              className="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <Button size="sm" type="submit" disabled={creatingDoc}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Attach
            </Button>
          </form>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {(documents as DocumentItem[]).map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>{doc.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button type="button" onClick={() => deleteDoc(doc.id)} className="text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "portal" && (
        <div className="space-y-3 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Generate a read-only Client Portal link so the client can inspect campaign milestones and shared deliverables.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => handleTogglePortal(true, !latestPortalPath)} disabled={updatingPortal}>
              {latestPortalPath ? "Regenerate Portal Link" : "Enable & Generate Portal Link"}
            </Button>
            {latestPortalPath && (
              <Button size="sm" variant="outline" onClick={() => handleTogglePortal(false)} disabled={updatingPortal}>
                Disable Portal
              </Button>
            )}
          </div>
          {latestPortalPath && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-2">
              <span className="font-mono text-primary truncate">{latestPortalPath}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${latestPortalPath}`);
                  toast.success("Portal URL copied.");
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
