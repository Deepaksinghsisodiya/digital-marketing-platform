import React, { useState } from "react";
import { toast } from "../../utils/toast";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  useGetAdminPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} from "../../store/api/adminApi";
import { BlogPostStatus } from "../../types";
import type { BlogPostSummary, CreateBlogPostRequest } from "../../types";
import { MediaPickerModal, resolveMediaUrl } from "../media/MediaLibraryPage";
import { RichWysiwygEditor } from "../../components/RichWysiwygEditor";
import { Image as ImageIcon, Trash2, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";

export const PostsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | undefined>(
    undefined,
  );

  const { data, isLoading, refetch } = useGetAdminPostsQuery({
    page,
    pageSize: 10,
    search: search || undefined,
    category: category || undefined,
    status: statusFilter,
  });

  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteBlogPostMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostSummary | null>(null);
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateBlogPostRequest>({
    slug: "",
    title: "",
    excerpt: "",
    contentHtml: "",
    category: "Digital Marketing",
    tags: "",
    coverImageUrl: "",
    authorName: "Nexora Team",
    status: BlogPostStatus.Draft,
    metaTitle: "",
    metaDescription: "",
  });

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      slug: "",
      title: "",
      excerpt: "",
      contentHtml: "",
      category: "Digital Marketing",
      tags: "",
      coverImageUrl: "",
      authorName: "Nexora Team",
      status: BlogPostStatus.Draft,
      metaTitle: "",
      metaDescription: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPostSummary) => {
    setEditingPost(post);
    setFormData({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      contentHtml: "<p>Loading post body or edit directly...</p>",
      category: post.category,
      tags: post.tags,
      coverImageUrl: post.coverImageUrl || "",
      authorName: post.authorName,
      status: post.status,
      metaTitle: post.title,
      metaDescription: post.excerpt,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await updatePost({
          id: editingPost.id,
          body: {
            slug: formData.slug,
            title: formData.title,
            excerpt: formData.excerpt,
            contentHtml: formData.contentHtml,
            category: formData.category || "Digital Marketing",
            tags: formData.tags || "",
            coverImageUrl: formData.coverImageUrl || null,
            authorName: formData.authorName || "Nexora Team",
            status: formData.status ?? BlogPostStatus.Draft,
            metaTitle: formData.metaTitle || null,
            metaDescription: formData.metaDescription || null,
          },
        }).unwrap();
      } else {
        await createPost(formData).unwrap();
      }
      setIsModalOpen(false);
      refetch();
      toast.success(editingPost ? "Blog post updated successfully!" : "Blog post created successfully!");
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      toast.error(errObj?.data?.error || "Failed to save post.");
    }
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete.id).unwrap();
      refetch();
      toast.success(`Post "${postToDelete.title}" deleted successfully.`);
      setPostToDelete(null);
    } catch (err: unknown) {
      const errObj = err as { data?: { error?: string } };
      toast.error(errObj?.data?.error || "Failed to delete post.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Blog & Thought Leadership
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish playbooks, insights, case studies, and SEO strategy
            briefings.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Write New Post</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search articles..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>

        <input
          type="text"
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={statusFilter !== undefined ? statusFilter : ""}
          onChange={(e) => {
            setStatusFilter(
              e.target.value === "" ? undefined : Number(e.target.value),
            );
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value={BlogPostStatus.Draft}>Draft</option>
          <option value={BlogPostStatus.Published}>Published</option>
          <option value={BlogPostStatus.Archived}>Archived</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} hasControls={false} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No blog posts found"
            description="No articles match your current search query or filter."
            action={{
              label: "Write First Post",
              onClick: openCreateModal,
            }}
          />
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800 shadow-2xs">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Category & Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {data.items.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 mr-1">
                        {post.category}
                      </span>
                      {post.tags && (
                        <span className="text-slate-400 text-[11px] block mt-1">
                          {post.tags}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {post.authorName}
                    </td>
                    <td className="px-6 py-4">
                      {post.status === BlogPostStatus.Published ? (
                        <Badge variant="success" dot>
                          Published
                        </Badge>
                      ) : post.status === BlogPostStatus.Draft ? (
                        <Badge variant="warning" dot>
                          Draft
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {post.publishedAtUtc
                        ? new Date(post.publishedAtUtc).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="text-primary hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setPostToDelete({ id: post.id, title: post.title })
                        }
                        disabled={isDeleting}
                        className="text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Page {data.page ?? page} of {data.totalPages} ({data.totalCount}{" "}
              total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPost ? "Edit Blog Post" : "Create New Editorial Article"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: editingPost ? prev.slug : slug,
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug (URL Path)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) =>
                        setFormData({ ...formData, authorName: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="e.g. SEO, Growth, B2B, CRO"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cover Image
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.coverImageUrl ? (
                      <div className="relative group w-28 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        <img
                          src={resolveMediaUrl(formData.coverImageUrl)}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              coverImageUrl: "",
                            }))
                          }
                          className="absolute inset-0 bg-rose-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          title="Remove cover image"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        <span className="text-[10px] mt-1">No cover</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Choose from Media Library
                      </button>
                      <input
                        type="text"
                        placeholder="Or enter direct image URL..."
                        value={formData.coverImageUrl || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            coverImageUrl: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Excerpt / Summary
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Article Content &amp; Media (Rich WYSIWYG)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Supports formatted text, headings, lists &amp; media assets</span>
                  </label>
                  <RichWysiwygEditor
                    value={formData.contentHtml}
                    onChange={(val) =>
                      setFormData({ ...formData, contentHtml: val })
                    }
                    placeholder="Draft your editorial content here..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: Number(e.target.value) as BlogPostStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value={BlogPostStatus.Draft}>Draft</option>
                    <option value={BlogPostStatus.Published}>Published</option>
                    <option value={BlogPostStatus.Archived}>Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  isLoading={isCreating || isUpdating}
                >
                  {editingPost ? "Update Post" : "Publish / Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, coverImageUrl: url }));
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(postToDelete)}
        title="Delete Blog Post"
        description={
          postToDelete
            ? `Are you sure you want to permanently delete "${postToDelete.title}"? This cannot be undone.`
            : ""
        }
        confirmText="Delete Post"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeletePost}
        onClose={() => setPostToDelete(null)}
      />
    </div>
  );
};
