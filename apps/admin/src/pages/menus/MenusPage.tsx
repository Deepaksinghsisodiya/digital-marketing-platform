import React, { useState, useEffect } from "react";
import {
  useGetAdminMenusQuery,
  useSaveAdminMenuMutation,
  useDeleteAdminMenuMutation,
} from "../../store/api/adminApi";
import type {
  NavigationMenuDto,
  NavigationMenuItemDto,
  SaveMenuItemRequest,
  SaveMenuRequest,
} from "../../types";
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  AlertCircle,
  FolderTree,
} from "lucide-react";

export const MenusPage: React.FC = () => {
  const { data: menus = [], isLoading, refetch } = useGetAdminMenusQuery();
  const [saveMenu, { isLoading: isSaving }] = useSaveAdminMenuMutation();
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteAdminMenuMutation();

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  // Form State for Active Menu
  const [activeMenuKey, setActiveMenuKey] = useState("");
  const [activeMenuTitle, setActiveMenuTitle] = useState("");
  const [activeMenuRegion, setActiveMenuRegion] = useState("");
  const [items, setItems] = useState<NavigationMenuItemDto[]>([]);

  // Item Modal / Editing state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemLabel, setItemLabel] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemParentId, setItemParentId] = useState<string>("");

  // Create Menu Modal state
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false);
  const [newMenuKey, setNewMenuKey] = useState("");
  const [newMenuTitle, setNewMenuTitle] = useState("");
  const [newMenuRegion, setNewMenuRegion] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Select first menu once loaded if none selected
  useEffect(() => {
    if (menus.length > 0 && !selectedMenuId) {
      const first = menus[0];
      if (first) {
        setSelectedMenuId(first.id);
        setActiveMenuKey(first.key);
        setActiveMenuTitle(first.title);
        setActiveMenuRegion(first.regionCode || "");
        setItems(first.items || []);
      }
    }
  }, [menus, selectedMenuId]);

  const handleSelectMenu = (m: NavigationMenuDto) => {
    setSelectedMenuId(m.id);
    setActiveMenuKey(m.key);
    setActiveMenuTitle(m.title);
    setActiveMenuRegion(m.regionCode || "");
    setItems(m.items || []);
    setFeedback(null);
  };

  const handleCreateMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuKey.trim() || !newMenuTitle.trim()) return;

    try {
      const req: SaveMenuRequest = {
        key: newMenuKey.trim().toLowerCase(),
        title: newMenuTitle.trim(),
        regionCode: newMenuRegion.trim() || null,
        items: [],
      };
      const created = await saveMenu({ request: req }).unwrap();
      setIsCreateMenuModalOpen(false);
      setNewMenuKey("");
      setNewMenuTitle("");
      setNewMenuRegion("");
      await refetch();
      handleSelectMenu(created);
      setFeedback({
        type: "success",
        message: "Navigation menu created successfully.",
      });
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      setFeedback({
        type: "error",
        message: errorObj?.data?.error || "Failed to create menu.",
      });
    }
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenuId) return;
    if (
      !window.confirm("Are you sure you want to delete this navigation menu?")
    )
      return;

    try {
      await deleteMenu(selectedMenuId).unwrap();
      setSelectedMenuId(null);
      await refetch();
      setFeedback({
        type: "success",
        message: "Navigation menu deleted successfully.",
      });
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      setFeedback({
        type: "error",
        message: errorObj?.data?.error || "Failed to delete menu.",
      });
    }
  };

  // Flatten items into flat list with hierarchical display
  const flattenItems = (
    list: NavigationMenuItemDto[],
    depth = 0,
  ): { item: NavigationMenuItemDto; depth: number }[] => {
    let result: { item: NavigationMenuItemDto; depth: number }[] = [];
    const sorted = [...list].sort((a, b) => a.displayOrder - b.displayOrder);
    for (const item of sorted) {
      result.push({ item, depth });
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenItems(item.children, depth + 1));
      }
    }
    return result;
  };

  // Flat representation of all items for SaveMenuRequest
  const buildSavePayloadItems = (
    itemList: NavigationMenuItemDto[],
  ): SaveMenuItemRequest[] => {
    const flattened: SaveMenuItemRequest[] = [];
    const traverse = (
      nodes: NavigationMenuItemDto[],
      parentId?: string | null,
    ) => {
      nodes.forEach((n, idx) => {
        flattened.push({
          label: n.label,
          url: n.url,
          displayOrder: idx,
          parentItemId: parentId || null,
        });
        if (n.children && n.children.length > 0) {
          traverse(n.children, n.id);
        }
      });
    };
    traverse(itemList, null);
    return flattened;
  };

  const handleSaveMenu = async () => {
    if (!selectedMenuId) return;
    setFeedback(null);

    const payload: SaveMenuRequest = {
      key: activeMenuKey.trim().toLowerCase(),
      title: activeMenuTitle.trim(),
      regionCode: activeMenuRegion.trim() || null,
      items: buildSavePayloadItems(items),
    };

    try {
      const updated = await saveMenu({
        id: selectedMenuId,
        request: payload,
      }).unwrap();
      handleSelectMenu(updated);
      await refetch();
      setFeedback({
        type: "success",
        message: "Navigation menu and links saved successfully.",
      });
    } catch (err: unknown) {
      const errorObj = err as { data?: { error?: string } };
      setFeedback({
        type: "error",
        message: errorObj?.data?.error || "Failed to save menu.",
      });
    }
  };

  const handleOpenAddItem = () => {
    setEditingItemId(null);
    setItemLabel("");
    setItemUrl("");
    setItemParentId("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: NavigationMenuItemDto) => {
    setEditingItemId(item.id);
    setItemLabel(item.label);
    setItemUrl(item.url);
    setItemParentId(item.parentItemId || "");
    setIsItemModalOpen(true);
  };

  const handleSaveItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemLabel.trim() || !itemUrl.trim()) return;

    if (editingItemId) {
      // Update existing item in state
      const updateNode = (
        nodes: NavigationMenuItemDto[],
      ): NavigationMenuItemDto[] => {
        return nodes.map((node) => {
          if (node.id === editingItemId) {
            return {
              ...node,
              label: itemLabel.trim(),
              url: itemUrl.trim(),
              parentItemId: itemParentId || null,
            };
          }
          if (node.children && node.children.length > 0) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      setItems(updateNode(items));
    } else {
      // Add new item
      const newItem: NavigationMenuItemDto = {
        id: crypto.randomUUID(),
        label: itemLabel.trim(),
        url: itemUrl.trim(),
        displayOrder: items.length,
        parentItemId: itemParentId || null,
        children: [],
      };

      if (!itemParentId) {
        setItems([...items, newItem]);
      } else {
        const addToParent = (
          nodes: NavigationMenuItemDto[],
        ): NavigationMenuItemDto[] => {
          return nodes.map((node) => {
            if (node.id === itemParentId) {
              return {
                ...node,
                children: [...(node.children || []), newItem],
              };
            }
            if (node.children && node.children.length > 0) {
              return { ...node, children: addToParent(node.children) };
            }
            return node;
          });
        };
        setItems(addToParent(items));
      }
    }

    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    const removeNode = (
      nodes: NavigationMenuItemDto[],
    ): NavigationMenuItemDto[] => {
      return nodes
        .filter((node) => node.id !== itemId)
        .map((node) => ({
          ...node,
          children: node.children ? removeNode(node.children) : [],
        }));
    };
    setItems(removeNode(items));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const currentItem = newItems[index];
    const targetItem = newItems[targetIdx];
    if (!currentItem || !targetItem) return;

    newItems[index] = targetItem;
    newItems[targetIdx] = currentItem;

    // re-assign display orders
    newItems.forEach((it, idx) => {
      it.displayOrder = idx;
    });
    setItems(newItems);
  };

  const flatItemList = flattenItems(items);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-indigo-600" />
            <span>Navigation Menus</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control dynamic header navigation, footer link groups, and regional
            menus
          </p>
        </div>

        <button
          onClick={() => {
            setNewMenuKey("");
            setNewMenuTitle("");
            setNewMenuRegion("");
            setIsCreateMenuModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Menu Group</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Sidebar + Menu Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: List of Menus */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
            Menu Collections
          </span>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading menus...
            </div>
          ) : menus.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No menus created yet.
            </div>
          ) : (
            menus.map((m) => {
              const isSelected = m.id === selectedMenuId;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMenu(m)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between group ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="truncate">
                    <span className="block text-sm truncate">{m.title}</span>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      key: {m.key}{" "}
                      {m.regionCode ? `(${m.regionCode})` : "(Global)"}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-indigo-500/50 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {m.items?.length || 0}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          {!selectedMenuId ? (
            <div className="py-24 text-center text-slate-400 text-sm">
              Select or create a menu to view and configure its links.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Menu Metadata Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Menu Title
                  </label>
                  <input
                    type="text"
                    value={activeMenuTitle}
                    onChange={(e) => setActiveMenuTitle(e.target.value)}
                    placeholder="e.g. Main Header"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Key (e.g. header, footer)
                  </label>
                  <input
                    type="text"
                    value={activeMenuKey}
                    onChange={(e) =>
                      setActiveMenuKey(e.target.value.toLowerCase())
                    }
                    placeholder="e.g. header"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Region Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={activeMenuRegion}
                    onChange={(e) =>
                      setActiveMenuRegion(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. IN, US (leave blank for Global)"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Items Table / Structure */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Navigation Link Structure
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure URLs, hierarchy, and ordering
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddItem}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link Item</span>
                  </button>
                </div>

                {flatItemList.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                    No links added to this menu yet. Click &quot;Add Link
                    Item&quot; above.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                    {flatItemList.map(({ item, depth }, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition gap-4"
                        style={{
                          paddingLeft: `${Math.max(14, depth * 28 + 14)}px`,
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {depth > 0 && (
                            <span className="text-slate-300 dark:text-slate-700">
                              └─
                            </span>
                          )}
                          <div className="truncate">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.label}
                            </span>
                            <span className="ml-2 text-xs font-mono text-slate-400">
                              {item.url}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder Buttons (only for top-level for now) */}
                          {depth === 0 && (
                            <>
                              <button
                                onClick={() => handleMoveItem(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 rounded"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveItem(idx, "down")}
                                disabled={idx === flatItemList.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 rounded"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Link"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={handleDeleteMenu}
                  disabled={isDeleting}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                >
                  {isDeleting ? "Deleting..." : "Delete Menu Group"}
                </button>

                <button
                  onClick={handleSaveMenu}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving ? "Saving Changes..." : "Save Navigation Menu"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Link Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItemId ? "Edit Link Item" : "Add New Navigation Link"}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Link Label
                </label>
                <input
                  type="text"
                  required
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                  placeholder="e.g. Services or Contact"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target URL / Path
                </label>
                <input
                  type="text"
                  required
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  placeholder="e.g. /services or https://..."
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Item (Optional for nested dropdowns)
                </label>
                <select
                  value={itemParentId}
                  onChange={(e) => setItemParentId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None (Top-Level Item)</option>
                  {items
                    .filter((i) => i.id !== editingItemId)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label} ({i.url})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
                >
                  {editingItemId ? "Apply Changes" : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Menu Modal */}
      {isCreateMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Navigation Menu
              </h3>
              <button
                onClick={() => setIsCreateMenuModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Menu Title
                </label>
                <input
                  type="text"
                  required
                  value={newMenuTitle}
                  onChange={(e) => setNewMenuTitle(e.target.value)}
                  placeholder="e.g. Header Navigation"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lookup Key
                </label>
                <input
                  type="text"
                  required
                  value={newMenuKey}
                  onChange={(e) => setNewMenuKey(e.target.value.toLowerCase())}
                  placeholder="e.g. header or footer"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Region Code (Optional)
                </label>
                <input
                  type="text"
                  value={newMenuRegion}
                  onChange={(e) =>
                    setNewMenuRegion(e.target.value.toUpperCase())
                  }
                  placeholder="e.g. IN, US (leave blank for Global)"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateMenuModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? "Creating..." : "Create Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
