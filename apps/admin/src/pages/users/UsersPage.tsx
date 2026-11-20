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
import { toast } from "../../utils/toast";
import {
  UserPlus,
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/button";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";

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

  // Delete User Dialog State
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
      toast.success(
        res.message || `Invitation resent to ${email} successfully!`,
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to resend invitation.");
    }
  };

  const handleSendResetPassword = async (userId: string, email: string) => {
    try {
      const res = await sendUserPasswordReset(userId).unwrap();
      toast.success(
        res.message || `Password reset link sent to ${email} successfully!`,
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to dispatch reset link.");
    }
  };

  const handleToggleSuspend = async (userId: string, isSuspended: boolean) => {
    try {
      await updateUser({ id: userId, isSuspended: !isSuspended }).unwrap();
      toast.success(
        isSuspended ? "User account reactivated." : "User account suspended.",
      );
      refetch();
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success(
        `User ${userToDelete.name || userToDelete.email} has been removed.`,
      );
      setUserToDelete(null);
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      toast.error(apiErr?.data?.error || "Failed to delete user account.");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    try {
      await inviteUser({
        email: inviteEmail.trim(),
        fullName: inviteFullName.trim(),
        role: inviteRole,
        password: invitePassword || undefined,
        mustChangePassword,
      }).unwrap();

      toast.success(`Staff user invited: ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteFullName("");
      setInvitePassword("");
      refetch();
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string } };
      setInviteError(
        apiErr?.data?.error ||
          "Failed to invite staff user. Please verify input.",
      );
    }
  };

  const canManageUsers =
    currentUser?.permissions?.includes("users.manage") ||
    currentUser?.roles?.includes("Owner");
  const isOwner = currentUser?.roles?.includes("Owner");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Staff &amp; Users
            </h1>
            <Badge variant="primary">RBAC Governed</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage agency team members, fine-grained system access, and session
            credentials
          </p>
        </div>

        {canManageUsers && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            icon={UserPlus}
            className="self-start sm:self-auto"
          >
            Invite Staff User
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:flex-1">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by name or email..."
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={5} hasControls={false} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={User}
              title="No Users Matching Criteria"
              description="No staff accounts match your active search keyword or role filter."
              action={
                canManageUsers
                  ? {
                      label: "Invite New Staff Member",
                      onClick: () => setIsInviteOpen(true),
                      icon: UserPlus,
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider shadow-2xs">
                <tr>
                  <th className="px-5 py-3.5">User Profile</th>
                  <th className="px-5 py-3.5">System Role</th>
                  <th className="px-5 py-3.5">Account State</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.items.map((u) => {
                  const isSuspended = u.status === 2;
                  const isInvited = u.status === 3;
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="primary">
                          <Shield className="w-3 h-3 mr-0.5" />
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {isInvited ? (
                          <Badge variant="warning" dot>
                            Invited
                          </Badge>
                        ) : isSuspended ? (
                          <Badge variant="danger" dot>
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="success" dot>
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAtUtc).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canManageUsers && !isSelf && (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {isInvited && (
                              <button
                                onClick={() =>
                                  handleResendInvite(u.id, u.email)
                                }
                                disabled={isResending}
                                title="Resend invitation link"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleSuspend(u.id, isSuspended)
                              }
                              title={
                                isSuspended
                                  ? "Reactivate user"
                                  : "Suspend user"
                              }
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isSuspended
                                  ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {isSelf && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            Your account
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
            <span>
              Page {data.page} of {data.totalPages} ({data.totalCount} staff
              members)
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Invite Staff Member
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Grant administrative portal credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {inviteError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={inviteFullName}
                      onChange={(e) => setInviteFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="jane@nexora.local"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned RBAC Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="Admin">Admin (Full Administrative Access)</option>
                    <option value="Editor">Editor (CMS, Pages & Blog Content)</option>
                    <option value="Sales">Sales (CRM & Inbound Leads)</option>
                    {isOwner && (
                      <option value="Owner">Owner (Platform Superuser)</option>
                    )}
                  </select>
                </div>

                {/* Password Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Initial Account Password
                    </label>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      placeholder="Enter or generate temporary password..."
                      className="w-full pl-9 pr-10 py-2 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Prompt user to change password */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={mustChangePassword}
                      onChange={(e) => setMustChangePassword(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Prompt password change on first login
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span>Credentials will be emailed automatically</span>
                  </div>
                </div>
              </div>

              <div className="p-4 px-5 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isInviting}
                  icon={Send}
                >
                  Create &amp; Email Credentials
                </Button>
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
