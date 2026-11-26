import React, { useState, useEffect } from "react";
import {
  useTestOutboundWebhookMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useGetBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useGetAdminFormsQuery,
  useSaveAdminFormMutation,
  useUpdateSettingsMutation,
} from "../../store/api/adminApi";
import { toast } from "../../utils/toast";
import {
  Webhook,
  Database,
  Globe,
  Key,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Send,
  FileCode2,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/button";
import type { SiteSettingsDto } from "../../types";

interface SettingsExtProps {
  settings: SiteSettingsDto | undefined;
  onSettingsUpdated: (newVersionToken: string) => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "data" in err &&
    typeof (err as { data?: { error?: string } }).data?.error === "string"
  ) {
    return (err as { data: { error: string } }).data.error;
  }
  return fallback;
}

export const WebhooksTab: React.FC<SettingsExtProps> = ({ settings, onSettingsUpdated }) => {
  const [webhookUrl, setWebhookUrl] = useState(settings?.webhookUrl || "");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [testWebhook, { isLoading: isTesting }] = useTestOutboundWebhookMutation();

  useEffect(() => {
    if (settings) {
      setWebhookUrl(settings.webhookUrl || "");
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      const res = await updateSettings({
        companyName: settings.companyName,
        legalName: settings.legalName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        address: settings.address,
        defaultRegion: settings.defaultRegion,
        supportedRegions: settings.supportedRegions,
        timeZoneId: settings.timeZoneId,
        logoMediaId: settings.logoMediaId,
        versionToken: settings.versionToken,
        webhookUrl: webhookUrl.trim(),
        webhookSecret: webhookSecret.trim() || undefined,
      }).unwrap();
      onSettingsUpdated(res.versionToken);
      setWebhookSecret("");
      toast.success("Outbound webhook configuration saved.");
    } catch {
      toast.error("Failed to save webhook configuration.");
    }
  };

  const handleTest = async () => {
    try {
      const res = await testWebhook({ webhookUrl: webhookUrl.trim() }).unwrap();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Webhook test failed."));
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Webhook className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Outbound Webhooks (Slack / Zapier / CRM)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dispatch real-time signed JSON payloads whenever leads are captured or converted.
            </p>
          </div>
        </div>
        {settings?.webhookSecretConfigured && <Badge variant="success">HMAC Secret Configured</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Webhook Destination URL
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Signing Secret (Optional — leave blank to keep existing)
          </label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="whsec_..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Webhook Settings"}
        </Button>
        <Button variant="outline" onClick={handleTest} disabled={isTesting || !webhookUrl.trim()}>
          <Send className="w-3.5 h-3.5 mr-1.5" />
          {isTesting ? "Sending..." : "Test Webhook"}
        </Button>
      </div>
    </Card>
  );
};

export const BackupsTab: React.FC = () => {
  const { data: backups, isLoading, refetch } = useGetBackupsQuery();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();

  const handleCreate = async () => {
    try {
      const res = await createBackup().unwrap();
      toast.success(`Backup created: ${res.fileName}`);
      refetch();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create database backup."));
    }
  };

  const handleRestore = async (fileName: string) => {
    try {
      const res = await restoreBackup({ fileName }).unwrap();
      toast.success(res.message);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to verify/stage backup."));
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Database Backup &amp; Restore</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create full SQL Server `.bak` snapshots and verify archives for recovery.
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isCreating ? "animate-spin" : ""}`} />
          {isCreating ? "Creating Backup..." : "Create Backup Now"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500">Loading backup archives...</p>
      ) : !backups || backups.length === 0 ? (
        <p className="text-xs text-slate-500">No `.bak` archives found in `backend/backups`.</p>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {backups.map((b) => (
            <div key={b.fileName} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{b.fileName}</div>
                <div className="text-[11px] text-slate-500">
                  {(b.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {new Date(b.createdAtUtc).toLocaleString()}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleRestore(b.fileName)} disabled={isRestoring}>
                Verify &amp; Stage Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export const DomainSslTab: React.FC<SettingsExtProps> = ({ settings, onSettingsUpdated }) => {
  const [customDomain, setCustomDomain] = useState(settings?.customDomain || "");
  const [sslStatus, setSslStatus] = useState(settings?.sslStatus || "Pending");
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  useEffect(() => {
    if (settings) {
      setCustomDomain(settings.customDomain || "");
      setSslStatus(settings.sslStatus || "Pending");
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      const res = await updateSettings({
        companyName: settings.companyName,
        legalName: settings.legalName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        address: settings.address,
        defaultRegion: settings.defaultRegion,
        supportedRegions: settings.supportedRegions,
        timeZoneId: settings.timeZoneId,
        logoMediaId: settings.logoMediaId,
        versionToken: settings.versionToken,
        customDomain: customDomain.trim(),
        sslStatus,
      }).unwrap();
      onSettingsUpdated(res.versionToken);
      toast.success("Custom domain & SSL settings saved.");
    } catch {
      toast.error("Failed to update domain settings.");
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Domain &amp; SSL/TLS Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bind your production agency domain and track TLS certificate provisioning status.
            </p>
          </div>
        </div>
        <Badge variant={sslStatus === "Active" ? "success" : "warning"}>SSL: {sslStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Custom Domain
          </label>
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="www.nexoradigital.com"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            SSL Certificate Status
          </label>
          <select
            value={sslStatus}
            onChange={(e) => setSslStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          >
            <option value="Pending">Pending DNS Verification</option>
            <option value="Provisioning">Provisioning TLS</option>
            <option value="Active">Active (HTTPS Enforced)</option>
          </select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Domain & SSL"}
      </Button>
    </Card>
  );
};

export const ApiKeysTab: React.FC = () => {
  const { data: keys, isLoading, refetch } = useGetApiKeysQuery();
  const [createKey, { isLoading: isCreating }] = useCreateApiKeyMutation();
  const [revokeKey] = useRevokeApiKeyMutation();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("leads:read,cms:read");
  const [newPlaintext, setNewPlaintext] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await createKey({ name: name.trim(), scopes: scopes.trim() }).unwrap();
      setNewPlaintext(res.plaintextKey);
      setName("");
      refetch();
      toast.success("API key generated. Copy it now — it will not be shown again.");
    } catch {
      toast.error("Failed to create API key.");
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Key className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Key Management</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate scoped integration keys for external CRM sync, CI/CD, and reporting pipelines.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold mb-1">Key Label</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HubSpot Sync"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold mb-1">Scopes</label>
          <input
            type="text"
            value={scopes}
            onChange={(e) => setScopes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>
        <Button type="submit" disabled={isCreating}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Generate Key
        </Button>
      </form>

      {newPlaintext && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-emerald-700 dark:text-emerald-300 break-all">{newPlaintext}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(newPlaintext);
              toast.success("Copied API key to clipboard");
            }}
          >
            <Copy className="w-3.5 h-3.5 mr-1" /> Copy
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-500">Loading API keys...</p>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(keys || []).map((k) => (
            <div key={k.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{k.name}</span>
                  <Badge variant={k.isActive ? "success" : "danger"}>{k.isActive ? "Active" : "Revoked"}</Badge>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {k.keyPrefix}•••••••• • Scopes: {k.scopes}
                </div>
              </div>
              {k.isActive && (
                <Button size="sm" variant="destructive" onClick={() => revokeKey(k.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

interface FormFieldItem {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required: boolean;
}

export const FormBuilderTab: React.FC = () => {
  const { data: forms, refetch } = useGetAdminFormsQuery();
  const [saveForm, { isLoading: isSaving }] = useSaveAdminFormMutation();
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>(undefined);
  const [formKey, setFormKey] = useState("custom-growth-brief");
  const [formName, setFormName] = useState("Custom Growth Brief");
  const [fields, setFields] = useState<FormFieldItem[]>([
    { id: "f1", name: "fullName", label: "Full Name", type: "text", required: true },
    { id: "f2", name: "email", label: "Work Email", type: "email", required: true },
    { id: "f3", name: "monthlyBudget", label: "Monthly Ad Spend", type: "select", required: false },
  ]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const loadForm = (f: { id: string; formKey: string; name: string; fieldsJson: string }) => {
    setSelectedFormId(f.id);
    setFormKey(f.formKey);
    setFormName(f.name);
    try {
      const parsed = JSON.parse(f.fieldsJson);
      if (Array.isArray(parsed)) setFields(parsed);
    } catch {
      // keep current
    }
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...fields];
    const [moved] = next.splice(dragIdx, 1);
    if (!moved) return;
    next.splice(targetIdx, 0, moved);
    setFields(next);
    setDragIdx(null);
  };

  const handleSave = async () => {
    try {
      await saveForm({
        id: selectedFormId,
        formKey: formKey.trim(),
        name: formName.trim(),
        fieldsJson: JSON.stringify(fields),
        isActive: true,
      }).unwrap();
      refetch();
      toast.success("Form definition saved.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save form definition."));
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <FileCode2 className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Drag-and-Drop Form Builder</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assemble and reorder dynamic lead capture forms backed by `/api/v1/admin/forms`.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedFormId(undefined);
            setFormKey(`form-${Date.now()}`);
            setFormName("New Lead Form");
          }}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> New Form
        </Button>
      </div>

      {forms && forms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {forms.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => loadForm(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                selectedFormId === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {f.name} ({f.formKey})
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Form Name</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Form Key (Slug)</label>
          <input
            type="text"
            value={formKey}
            onChange={(e) => setFormKey(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fields (Drag to reorder)</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setFields([
                ...fields,
                { id: `f-${Date.now()}`, name: `field_${fields.length + 1}`, label: "New Field", type: "text", required: false },
              ])
            }
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
          </Button>
        </div>

        {fields.map((field, idx) => (
          <div
            key={field.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 cursor-grab"
          >
            <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={field.label}
              onChange={(e) => {
                const next = [...fields];
                next[idx] = { ...field, label: e.target.value };
                setFields(next);
              }}
              placeholder="Field Label"
              className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
            />
            <select
              value={field.type}
              onChange={(e) => {
                const next = [...fields];
                next[idx] = { ...field, type: e.target.value as FormFieldItem["type"] };
                setFields(next);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="tel">Phone</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
            </select>
            <label className="inline-flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => {
                  const next = [...fields];
                  next[idx] = { ...field, required: e.target.checked };
                  setFields(next);
                }}
              />
              Required
            </label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFields(fields.filter((_, i) => i !== idx))}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
        {isSaving ? "Saving..." : "Save Form Schema"}
      </Button>
    </Card>
  );
};
