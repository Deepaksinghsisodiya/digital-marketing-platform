import React, { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  useGetUsersQuery,
  useInviteUserMutation,
  useResendInvitationMutation,
  useSendUserPasswordResetMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../store/api/adminApi";
import { useAppSelector } from "../../store/hooks";
import { toast } from "sonner";
import {
  UserPlus,
  Search,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  AlertCircle,
  X,
  Mail,
  User,
  Key,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Send,
} from "lucide-react";

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);

  // Helper to generate an enterprise 14-char secure temporary password
  const generateSecurePassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const special = "!@#$%^&*";
    let pwd = "";
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];
    const all = upper + lower + numbers + special;
    for (let i = 0; i < 10; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    setInvitePassword(pwd);
    setShowPassword(true);
  };

  // Action feedback
  const [actionMsg, setActionMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const { data, isLoading, refetch } = useGetUsersQuery({
    page,
    pageSize: 10,
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const [inviteUser, { isLoading: isInviting }] = useInviteUserMutation();
  const [resendInvitation, { isLoading: isResending }] =
    useResendInvitationMutation();
  const [sendUserPasswordReset, { isLoading: isResetting }] =
    useSendUserPasswordResetMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  const handleResendInvite = async (userId: string, email: string) => {
    try {
      const res = await resendInvitation(userId).unwrap();
      toast.success(res.message || `Invitation resent to ${email} successfully!`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to resend invitation.");
    }
  };

  const handleSendResetPassword = async (userId: string, email: string) => {
    try {
      const res = await sendUserPasswordReset(userId).unwrap();
      toast.success(res.message || `Password reset link sent to ${email} successfully!`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to send password reset.");
    }
  };

  const isOwner = currentUser?.roles?.includes("Owner");
  const canManageUsers =
    isOwner || currentUser?.permissions?.includes("users.manage");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (invitePassword.trim() && invitePassword.trim().length < 8) {
      setInviteError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await inviteUser({
        email: inviteEmail.trim(),
        fullName: inviteFullName.trim(),
        role: inviteRole,
        password: invitePassword.trim() || undefined,
        mustChangePassword,
      }).unwrap();

      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteFullName("");
      setInvitePassword("");
      toast.success(
        res.message ||
          `Staff member added successfully! Login credentials dispatched to ${inviteEmail}.`
      );
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setInviteError(apiErr?.data?.error || "Failed to create staff account.");
      toast.error(apiErr?.data?.error || "Failed to create staff account.");
    }
  };

  const handleToggleSuspend = async (
    targetUserId: string,
    isCurrentlySuspended: boolean,
  ) => {
    try {
      await updateUser({
        id: targetUserId,
        isSuspended: !isCurrentlySuspended,
        suspensionReason: isCurrentlySuspended
          ? undefined
          : "Manual administrative suspension",
      }).unwrap();

      toast.success(
        `User ${isCurrentlySuspended ? "reactivated" : "suspended"} successfully.`
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to update user status.");
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success(`User ${userToDelete.email} removed successfully.`);
      setUserToDelete(null);
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff & Users
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage agency operators, roles, and status
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Staff User
          </button>
        )}
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            actionMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="Owner">Owner</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((u) => {
                  const isSuspended = u.status === 2;
                  const isInvited = u.status === 3;
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {u.fullName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isInvited ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Invited
                          </span>
                        ) : isSuspended ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(u.createdAtUtc).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManageUsers && !isSelf && (
                          <div className="inline-flex items-center gap-2">
                            {isInvited && (
                              <button
                                onClick={() =>
                                  handleResendInvite(u.id, u.email)
                                }
                                disabled={isResending}
                                title="Resend invitation link"
                                className="p-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors disabled:opacity-40"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleSendResetPassword(u.id, u.email)
                              }
                              disabled={isResetting}
                              title="Send password reset link"
                              className="p-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-40"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleSuspend(u.id, isSuspended)
                              }
                              title={
                                isSuspended ? "Reactivate user" : "Suspend user"
                              }
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                isSuspended
                                  ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                  : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              }`}
                            >
                              {isSuspended ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Ban className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setUserToDelete({
                                  id: u.id,
                                  email: u.email,
                                  name: u.fullName,
                                })
                              }
                              title="Delete user"
                              className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {isSelf && (
                          <span className="text-[11px] text-slate-500 font-medium italic">
                            Your account
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
            <span>
              Page {data.page} of {data.totalPages} ({data.totalCount} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Invite New Team Member
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jane@nexora.local"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="Admin">Admin (Full Administrative Access)</option>
                  <option value="Editor">Editor (CMS, Pages & Blog Content)</option>
                  <option value="Sales">Sales (CRM & Inbound Leads)</option>
                  {isOwner && <option value="Owner">Owner (Platform Superuser)</option>}
                </select>
              </div>

              {/* Password Field & Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Initial Account Password
                  </label>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-generate</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    placeholder="Enter or generate initial password..."
                    className="w-full pl-9 pr-10 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  This password and portal URL will be automatically emailed to the new staff member.
                </p>
              </div>

              {/* Credentials & Password Change Option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                  />
                  <span className="font-medium">
                    Prompt user to change password upon first login
                  </span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Login credentials will be sent to their email automatically</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isInviting
                      ? "Creating & Sending..."
                      : "Create Staff & Email Credentials"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Remove Staff User"
        description={
          userToDelete
            ? `Are you sure you want to permanently remove "${userToDelete.name || userToDelete.email}" (${userToDelete.email}) from the platform? This will revoke all session access and role bindings.`
            : ""
        }
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingUser}
        onConfirm={confirmDeleteUser}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
