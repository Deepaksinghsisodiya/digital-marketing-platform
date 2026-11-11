import React, { useState, useMemo } from "react";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetClientsQuery,
} from "../../store/api/adminApi";
import type { TaskItemDto, TaskItemStatus, TaskPriority } from "../../types";
import {
  Plus,
  AlertCircle,
  Clock,
  Briefcase,
  Kanban,
  ListFilter,
  ChevronRight,
} from "lucide-react";

const PRIORITY_MAP: Record<number, { label: string; badgeClass: string }> = {
  1: { label: "Low", badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700" },
  2: { label: "Medium", badgeClass: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60" },
  3: { label: "High", badgeClass: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60" },
  4: { label: "Urgent", badgeClass: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60" },
};

const STATUS_MAP: Record<number, { label: string; badgeClass: string; dotClass: string }> = {
  1: { label: "Pending", badgeClass: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60", dotClass: "bg-amber-500" },
  2: { label: "In Progress", badgeClass: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60", dotClass: "bg-blue-500" },
  3: { label: "Completed", badgeClass: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60", dotClass: "bg-emerald-500" },
  4: { label: "Cancelled", badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700", dotClass: "bg-slate-400" },
};

const KANBAN_TASK_COLUMNS = [
  { status: 1, label: "Pending & Backlog", color: "amber", nextAction: "Start Task", nextStatus: 2 },
  { status: 2, label: "In Progress", color: "blue", nextAction: "Complete Task", nextStatus: 3 },
  { status: 3, label: "Completed Deliverables", color: "emerald", nextAction: null, nextStatus: 1 },
];

export const TasksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedStatus, setSelectedStatus] = useState<TaskItemStatus | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | undefined>(undefined);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const page = 1;

  const { data: tasksData, isLoading, refetch } = useGetTasksQuery({
    page: viewMode === "kanban" ? 1 : page,
    pageSize: viewMode === "kanban" ? 100 : 20,
    status: selectedStatus,
    priority: selectedPriority,
    overdueOnly: overdueOnly || undefined,
  });

  const { data: clientsData } = useGetClientsQuery({ page: 1, pageSize: 100 });
  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(2);
  const [newTaskClientId, setNewTaskClientId] = useState("");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        dueDateUtc: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
        priority: newTaskPriority,
        clientId: newTaskClientId || undefined,
      }).unwrap();

      setCreateModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDueDate("");
      setNewTaskClientId("");
      refetch();
    } catch {
      alert("Failed to create task.");
    }
  };

  const handleSetStatus = async (task: TaskItemDto, targetStatus: TaskItemStatus) => {
    try {
      await updateTask({
        id: task.id,
        data: {
          title: task.title,
          description: task.description || undefined,
          dueDateUtc: task.dueDateUtc || undefined,
          priority: task.priority,
          status: targetStatus,
          assignedUserId: task.assignedUserId || task.assignedToUserId || undefined,
        },
      }).unwrap();
      refetch();
    } catch {
      alert("Failed to update task status.");
    }
  };

  const toggleTaskStatus = async (task: TaskItemDto) => {
    const nextStatus: TaskItemStatus = task.status === 3 ? 1 : 3;
    await handleSetStatus(task, nextStatus);
  };

  // Group tasks for Kanban
  const kanbanColumns = useMemo(() => {
    const items = tasksData?.items || [];
    return KANBAN_TASK_COLUMNS.map((col) => ({
      ...col,
      tasks: items.filter((t) => t.status === col.status),
    }));
  }, [tasksData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Tasks & Client Deliverables
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              {tasksData?.totalCount ?? 0} Actions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Operations board, account kickoff deliverables, proposal deadlines, and automated follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
            overdueOnly
              ? "bg-red-500 text-white border-red-600 shadow-sm"
              : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          {overdueOnly ? "✕ Filtering Overdue Only" : "⚠ Overdue Tasks Only"}
        </button>

        {viewMode === "list" && (
          <select
            value={selectedStatus ?? ""}
            onChange={(e) => setSelectedStatus(e.target.value ? (Number(e.target.value) as TaskItemStatus) : undefined)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="1">Pending</option>
            <option value="2">In Progress</option>
            <option value="3">Completed</option>
            <option value="4">Cancelled</option>
          </select>
        )}

        <select
          value={selectedPriority ?? ""}
          onChange={(e) => setSelectedPriority(e.target.value ? (Number(e.target.value) as TaskPriority) : undefined)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="1">Low Priority</option>
          <option value="2">Medium Priority</option>
          <option value="3">High Priority</option>
          <option value="4">Urgent Attention</option>
        </select>
      </div>

      {/* Main Board vs List View */}
      {viewMode === "kanban" ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-4">
          {kanbanColumns.map((col) => (
            <div
              key={col.status}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4 space-y-3 min-h-[500px] flex flex-col shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      col.color === "amber"
                        ? "bg-amber-500"
                        : col.color === "blue"
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {col.label}
                  </h3>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {col.tasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {col.tasks.map((task: TaskItemDto) => {
                  const isOverdue =
                    task.dueDateUtc &&
                    new Date(task.dueDateUtc) < new Date() &&
                    task.status !== 3 &&
                    task.status !== 4;

                  const pri = PRIORITY_MAP[task.priority] || PRIORITY_MAP[2]!;

                  return (
                    <div
                      key={task.id}
                      className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/50 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pri.badgeClass}`}>
                          {pri.label}
                        </span>

                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-200 dark:border-red-800/60 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4
                          className={`font-bold text-xs leading-snug ${
                            task.status === 3
                              ? "line-through text-slate-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {task.clientName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{task.clientName}</span>
                        </div>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {task.dueDateUtc
                              ? new Date(task.dueDateUtc).toLocaleDateString()
                              : "No deadline"}
                          </span>
                        </span>

                        {col.nextAction && (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(task, col.nextStatus as TaskItemStatus)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold transition text-[10px]"
                          >
                            <span>{col.nextAction}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {col.tasks.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No tasks in this column
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">Loading tasks...</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="w-10 px-4 py-3.5"></th>
                  <th className="px-5 py-3.5 text-left">Task</th>
                  <th className="px-5 py-3.5 text-left">Associated Client</th>
                  <th className="px-5 py-3.5 text-left">Priority</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-left">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {tasksData?.items.map((task: TaskItemDto) => {
                  const isOverdue =
                    task.dueDateUtc &&
                    new Date(task.dueDateUtc) < new Date() &&
                    task.status !== 3 &&
                    task.status !== 4;

                  const pri = PRIORITY_MAP[task.priority] || PRIORITY_MAP[2]!;
                  const stat = STATUS_MAP[task.status] || STATUS_MAP[1]!;

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={task.status === 3}
                          onChange={() => toggleTaskStatus(task)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className={`font-bold ${
                            task.status === 3 ? "line-through text-slate-400" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {task.clientName ? (
                          <span className="font-semibold text-slate-900 dark:text-white">{task.clientName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Internal Agency Task</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${pri.badgeClass}`}>
                          {pri.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stat.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${stat.dotClass}`} />
                          <span>{stat.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px] font-mono">
                        {task.dueDateUtc ? (
                          <span
                            className={`font-medium ${
                              isOverdue ? "text-red-500 font-bold" : "text-slate-500"
                            }`}
                          >
                            {isOverdue && "⚠ "}
                            {new Date(task.dueDateUtc).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Create New Task</h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Prepare Q4 Attribution Audit"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Optional deliverables or notes..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(Number(e.target.value) as TaskPriority)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                    <option value={4}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Associated Client Account
                </label>
                <select
                  value={newTaskClientId}
                  onChange={(e) => setNewTaskClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Internal Agency Task</option>
                  {clientsData?.items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
