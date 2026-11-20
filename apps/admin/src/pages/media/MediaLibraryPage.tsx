import React, { useState, useRef } from "react";
import { toast } from "../../utils/toast";
import {
  useGetMediaAssetsQuery,
  useUploadMediaMutation,
  useDeleteMediaAssetMutation,
} from "../../store/api/adminApi";
import { API_BASE_URL } from "../../store/api/baseApi";
import type { MediaAssetDto } from "../../types";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  UploadCloud,
  Search,
  Trash2,
  Copy,
  Check,
  FileText,
  AlertCircle,
  X,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Folder,
  FolderOpen,
  Info,
  AlertTriangle,
} from "lucide-react";

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  let cleanPath = url.trim();
  if (!cleanPath.startsWith("/") && !cleanPath.startsWith("api/")) {
    cleanPath = `/api/v1/public/media/${cleanPath}`;
  } else if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  // In browser with local Vite dev proxy, relative /api path is completely immune to CORS,
  // cross-port mismatch (5173 vs 5174), and private network restrictions.
  if (typeof window !== "undefined") {
    return cleanPath;
  }

  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}${cleanPath}`;
}

export function resolveAbsoluteMediaUrl(
  url: string | null | undefined,
): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  let cleanPath = url.trim();
  if (!cleanPath.startsWith("/") && !cleanPath.startsWith("api/")) {
    cleanPath = `/api/v1/public/media/${cleanPath}`;
  } else if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }
  const base = (API_BASE_URL || "http://localhost:5201").replace(/\/$/, "");
  return `${base}${cleanPath}`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText?: string, asset?: MediaAssetDto) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetDto | null>(
    null,
  );
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useGetMediaAssetsQuery({
    page,
    pageSize: 18,
    search: search.trim() || undefined,
  });

  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      const msg = "File size exceeds 5MB limit. Please upload an optimized web image.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const created = await uploadMedia(formData).unwrap();
      onSelect(created.url, created.altText || created.fileName, created);
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      setUploadError(errorObj?.data?.error || "Failed to upload media asset.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Choose Media Asset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an asset from your library or upload a new one
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search assets..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isUploading ? "Uploading..." : "Upload New"}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Grid Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <CardSkeleton count={12} />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No media assets found"
              description="Upload images, graphics, or PDFs to attach to your content."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.items.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const isImage = asset.mimeType.startsWith("image/");
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    onDoubleClick={() => {
                      onSelect(
                        asset.url,
                        asset.altText || asset.fileName,
                        asset,
                      );
                      onClose();
                    }}
                    className={`group relative rounded-xl border p-2 cursor-pointer transition flex flex-col items-center text-center ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="w-full h-24 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                      {isImage && !failedImages[asset.id] ? (
                        <img
                          src={resolveMediaUrl(asset.url)}
                          alt={asset.altText || asset.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          loading="lazy"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [asset.id]: true,
                            }))
                          }
                        />
                      ) : isImage ? (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <ImageIcon className="w-7 h-7 text-primary" />
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                            {asset.mimeType.split("/")[1] || "IMG"}
                          </span>
                        </div>
                      ) : (
                        <FileText className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200 truncate w-full">
                      {asset.fileName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatBytes(asset.sizeBytes)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="text-xs text-slate-500">
            {selectedAsset ? (
              <span>
                Selected:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {selectedAsset.fileName}
                </strong>{" "}
                ({formatBytes(selectedAsset.sizeBytes)})
              </span>
            ) : (
              <span>Click to select an asset</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedAsset) {
                  onSelect(
                    selectedAsset.url,
                    selectedAsset.altText || selectedAsset.fileName,
                    selectedAsset,
                  );
                  onClose();
                }
              }}
              disabled={!selectedAsset}
              className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl shadow-xs transition disabled:opacity-40"
            >
              Insert Selected Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MediaLibraryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [mimeFilter, setMimeFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [inspectedAsset, setInspectedAsset] = useState<MediaAssetDto | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<MediaAssetDto | null>(
    null,
  );
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const FOLDERS = [
    { id: "all", name: "All Assets" },
    { id: "banners", name: "Hero Banners", term: "banner" },
    { id: "blog", name: "Blog & Editorial", term: "post" },
    { id: "brand", name: "Brand & Logos", term: "logo" },
    { id: "testimonials", name: "Avatars & Clients", term: "avatar" },
    { id: "docs", name: "Documents (PDF)", mime: "application/pdf" },
  ];

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useGetMediaAssetsQuery({
    page,
    pageSize: 18,
    search: search.trim() || undefined,
    mimeType: mimeFilter || undefined,
  });

  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMediaAsset, { isLoading: isDeleting }] =
    useDeleteMediaAssetMutation();

  const handleCopyUrl = (asset: MediaAssetDto) => {
    navigator.clipboard.writeText(resolveAbsoluteMediaUrl(asset.url));
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        const msg = "File size exceeds 5MB limit. Please upload an optimized web image.";
        setUploadError(msg);
        toast.error(msg);
        return;
      }
      setUploadFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadError(null);
    const formData = new FormData();
    formData.append("file", uploadFile);
    if (uploadAltText.trim()) {
      formData.append("altText", uploadAltText.trim());
    }

    try {
      await uploadMedia(formData).unwrap();
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadAltText("");
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      setUploadError(errorObj?.data?.error || "Failed to upload media file.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    try {
      await deleteMediaAsset(assetToDelete.id).unwrap();
      setAssetToDelete(null);
      refetch();
    } catch {
      // Handled by query cache invalidation or error display
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Media & Digital Assets
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Validated image and document repository with instant CDN delivery
          </p>
        </div>

        <button
          onClick={() => {
            setUploadFile(null);
            setUploadAltText("");
            setUploadError(null);
            setIsUploadModalOpen(true);
          }}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Media Category Folders Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FOLDERS.map((f) => {
          const isSelected = selectedFolder === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelectedFolder(f.id);
                setPage(1);
                if (f.id === "all") {
                  setSearch("");
                  setMimeFilter("");
                } else if (f.mime) {
                  setMimeFilter(f.mime);
                  setSearch("");
                } else if (f.term) {
                  setSearch(f.term);
                  setMimeFilter("");
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-primary/40"
              }`}
            >
              {isSelected ? (
                <FolderOpen className="w-3.5 h-3.5" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{f.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by file name or alt text..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={mimeFilter}
            onChange={(e) => {
              setMimeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Formats</option>
            <option value="image/jpeg">JPEG Images</option>
            <option value="image/png">PNG Images</option>
            <option value="image/webp">WebP Images</option>
            <option value="image/svg+xml">SVG Vectors</option>
            <option value="application/pdf">PDF Documents</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CardSkeleton count={12} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No media assets found"
            description="Upload images, graphics, or PDFs to use across your website pages, blogs, and marketing campaigns."
            action={{
              label: "Upload First Asset",
              onClick: () => setIsUploadModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {data.items.map((asset) => {
              const isImage = asset.mimeType.startsWith("image/");
              return (
                <div
                  key={asset.id}
                  className="group relative bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/50 transition flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {isImage && !failedImages[asset.id] ? (
                      <img
                        src={resolveMediaUrl(asset.url)}
                        alt={asset.altText || asset.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [asset.id]: true,
                          }))
                        }
                      />
                    ) : isImage ? (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400">
                        <ImageIcon className="w-9 h-9 text-primary" />
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                          {asset.mimeType.split("/")[1] || "IMG"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <FileText className="w-10 h-10" />
                        <span className="text-[10px] font-mono uppercase font-bold">
                          {asset.mimeType.split("/")[1] || "FILE"}
                        </span>
                      </div>
                    )}

                    {/* Quick actions hover overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => setInspectedAsset(asset)}
                        title="Inspect Asset Details & Usage"
                        className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition"
                      >
                        <Info className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(asset)}
                        title="Copy Public URL"
                        className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition"
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={resolveAbsoluteMediaUrl(asset.url)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in new tab"
                        className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setAssetToDelete(asset)}
                        title="Delete asset"
                        className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
                        title={asset.fileName}
                      >
                        {asset.fileName}
                      </h4>
                      {asset.altText && (
                        <p
                          className="text-[11px] text-slate-400 italic truncate mt-0.5"
                          title={asset.altText}
                        >
                          &quot;{asset.altText}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatBytes(asset.sizeBytes)}</span>
                      {asset.width && asset.height && (
                        <span>
                          {asset.width}×{asset.height}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {data.page} of {data.totalPages} ({data.totalCount}{" "}
              total assets)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload New Media Asset
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                {uploadFile ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatBytes(uploadFile.size)} •{" "}
                      {uploadFile.type || "Unknown type"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Click or drag file to upload
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, WebP, SVG, PDF up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alt Text / Accessibility Description (Optional)
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g. Modern agency dashboard interface showcase"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  {isUploading ? "Uploading & Validating..." : "Upload Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Media Asset?
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {assetToDelete.fileName}
              </strong>
              ? Any web pages or blog posts referencing this URL will no longer
              be able to display it.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Usage & Metadata Inspector Modal */}
      {inspectedAsset && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Media Asset Dossier
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
                  {inspectedAsset.fileName}
                </p>
              </div>
              <button
                onClick={() => setInspectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Asset Preview */}
            <div className="w-full h-48 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/80 dark:border-slate-800">
              {inspectedAsset.mimeType.startsWith("image/") ? (
                <img
                  src={resolveMediaUrl(inspectedAsset.url)}
                  alt={inspectedAsset.altText || inspectedAsset.fileName}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 space-y-2">
                  <FileText className="w-12 h-12 mx-auto" />
                  <span className="text-xs font-mono uppercase font-bold">{inspectedAsset.mimeType}</span>
                </div>
              )}
            </div>

            {/* Asset Metadata Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">File Size</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatBytes(inspectedAsset.sizeBytes)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">MIME Format</span>
                <span className="font-mono text-slate-900 dark:text-white truncate block">{inspectedAsset.mimeType}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Public CDN Link</span>
                <span className="font-mono text-[11px] text-primary truncate block">
                  {resolveAbsoluteMediaUrl(inspectedAsset.url)}
                </span>
              </div>
            </div>

            {/* Usage Alert Reference Box */}
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Usage Reference &amp; Safe Deletion Check</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400/90 leading-relaxed">
                This asset may be embedded across CMS Landing Pages, Hero Carousel Slides, or Editorial Blog Posts. Deleting it will permanently break public image rendering where referenced.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAssetToDelete(inspectedAsset);
                  setInspectedAsset(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Asset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(inspectedAsset)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CDN URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
