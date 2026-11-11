import { apiSlice } from "./baseApi";
import type {
  UserProfile,
  CsrfResponse,
  PaginatedResult,
  UserSummary,
  RoleDto,
  CreateRoleRequest,
  AuditLogDto,
  SiteSettingsDto,
  UpdateSiteSettingsRequest,
  TestSmtpConnectionRequest,
  PageSummary,
  PageDetail,
  CreatePageRequest,
  SaveDraftRequest,
  PublishPageResponse,
  PreviewTokenResponse,
  LeadSummary,
  LeadDetail,
  LeadStats,
  LeadStatus,
  EmailTemplateDto,
  UpdateEmailTemplateRequest,
  SendTestEmailRequest,
  EmailLogDto,
  ClientSummary,
  ClientDetail,
  ClientStatus,
  CreateClientRequest,
  UpdateClientRequest,
  TaskItemDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskItemStatus,
  TaskPriority,
  BlogPostSummary,
  BlogPostDetail,
  BlogPostStatus,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  PipelineStage,
  CountryRegion,
  MediaAssetDto,
  NavigationMenuDto,
  SaveMenuRequest,
  PageVersionSummaryDto,
  RollbackPageRequest,
} from "../../types";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Auth & CSRF
    getCsrfToken: builder.query<CsrfResponse, void>({
      query: () => "/api/v1/auth/csrf",
    }),
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => "/api/v1/auth/me",
      providesTags: ["CurrentProfile"],
    }),
    login: builder.mutation<
      { success: boolean; userId: string; mustChangePassword: boolean },
      { email: string; password: string; rememberMe: boolean }
    >({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentProfile"],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["CurrentProfile"],
    }),
    logoutEverywhere: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/api/v1/auth/logout-everywhere",
        method: "POST",
      }),
      invalidatesTags: ["CurrentProfile"],
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { currentPassword?: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/password/change",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentProfile"],
    }),
    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/password/forgot",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      { success: boolean; message: string },
      { email: string; token: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/api/v1/auth/password/reset",
        method: "POST",
        body,
      }),
    }),

    // Admin Users Management
    getUsers: builder.query<
      PaginatedResult<UserSummary>,
      { page?: number; pageSize?: number; search?: string; role?: string; status?: number }
    >({
      query: (params) => ({
        url: "/api/v1/admin/users",
        params,
      }),
      providesTags: ["User"],
    }),
    inviteUser: builder.mutation<
      { success: boolean; userId: string; message: string },
      { email: string; fullName: string; role: string }
    >({
      query: (body) => ({
        url: "/api/v1/admin/users/invite",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "AuditLog"],
    }),
    resendInvitation: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/v1/admin/users/${id}/resend-invitation`,
        method: "POST",
      }),
      invalidatesTags: ["User", "AuditLog"],
    }),
    sendUserPasswordReset: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/v1/admin/users/${id}/reset-password`,
        method: "POST",
      }),
      invalidatesTags: ["AuditLog"],
    }),
    updateUser: builder.mutation<
      { success: boolean; message: string },
      { id: string; role?: string; isSuspended?: boolean; suspensionReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/admin/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User", "CurrentProfile", "AuditLog"],
    }),
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/v1/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "AuditLog"],
    }),

    // Roles & Permissions
    getRoles: builder.query<RoleDto[], void>({
      query: () => "/api/v1/admin/roles",
      providesTags: ["Role"],
    }),
    createRole: builder.mutation<{ message: string }, CreateRoleRequest>({
      query: (body) => ({
        url: "/api/v1/admin/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Role", "AuditLog"],
    }),
    updateRolePermissions: builder.mutation<
      { message: string },
      { roleName: string; permissions: string[] }
    >({
      query: ({ roleName, permissions }) => ({
        url: `/api/v1/admin/roles/${encodeURIComponent(roleName)}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: ["Role", "AuditLog"],
    }),
    deleteRole: builder.mutation<{ message: string }, string>({
      query: (roleName) => ({
        url: `/api/v1/admin/roles/${encodeURIComponent(roleName)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role", "AuditLog"],
    }),
    getPermissions: builder.query<string[], void>({
      query: () => "/api/v1/admin/permissions",
    }),

    // Audit Logs
    getAuditLogs: builder.query<
      PaginatedResult<AuditLogDto>,
      { page?: number; pageSize?: number; action?: string; resourceType?: string; outcome?: string }
    >({
      query: (params) => ({
        url: "/api/v1/admin/audit-logs",
        params,
      }),
      providesTags: ["AuditLog"],
    }),

    // Site Settings
    getSettings: builder.query<SiteSettingsDto, void>({
      query: () => "/api/v1/admin/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<
      { success: boolean; versionToken: string; message: string },
      UpdateSiteSettingsRequest
    >({
      query: (body) => ({
        url: "/api/v1/admin/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings", "AuditLog"],
    }),
    testSmtpConnection: builder.mutation<
      { message: string },
      TestSmtpConnectionRequest
    >({
      query: (body) => ({
        url: "/api/v1/admin/settings/smtp/test",
        method: "POST",
        body,
      }),
    }),

    // CMS Pages
    getPages: builder.query<
      PaginatedResult<PageSummary>,
      { page?: number; pageSize?: number; search?: string; status?: number; locale?: string }
    >({
      query: (params) => ({
        url: "/api/v1/admin/pages",
        params,
      }),
      providesTags: ["CmsPage"],
    }),
    getPageById: builder.query<PageDetail, string>({
      query: (id) => `/api/v1/admin/pages/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CmsPage", id }],
    }),
    createPage: builder.mutation<{ pageId: string }, CreatePageRequest>({
      query: (body) => ({
        url: "/api/v1/admin/pages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CmsPage", "AuditLog"],
    }),
    savePageDraft: builder.mutation<
      { success: boolean; versionToken: string },
      { id: string; body: SaveDraftRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/admin/pages/${id}/draft`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CmsPage", id },
        "CmsPage",
        "AuditLog",
      ],
    }),
    publishPage: builder.mutation<PublishPageResponse, string>({
      query: (id) => ({
        url: `/api/v1/admin/pages/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "CmsPage", id },
        "CmsPage",
        "AuditLog",
      ],
    }),
    generatePreviewToken: builder.mutation<PreviewTokenResponse, string>({
      query: (id) => ({
        url: `/api/v1/admin/pages/${id}/preview-token`,
        method: "POST",
      }),
    }),

    // Leads & Inquiries
    getLeads: builder.query<
      PaginatedResult<LeadSummary>,
      { page?: number; pageSize?: number; search?: string; status?: number; region?: string; formKey?: string }
    >({
      query: (params) => ({
        url: "/api/v1/admin/leads",
        params,
      }),
      providesTags: ["Lead"],
    }),
    getLeadById: builder.query<LeadDetail, string>({
      query: (id) => `/api/v1/admin/leads/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Lead", id }],
    }),
    getLeadStats: builder.query<LeadStats, void>({
      query: () => "/api/v1/admin/leads/stats",
      providesTags: ["Lead"],
    }),
    updateLeadStatus: builder.mutation<{ success: boolean }, { id: string; status: LeadStatus }>({
      query: ({ id, status }) => ({
        url: `/api/v1/admin/leads/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Lead", id }, "Lead", "AuditLog"],
    }),
    addLeadNote: builder.mutation<{ success: boolean }, { id: string; note: string }>({
      query: ({ id, note }) => ({
        url: `/api/v1/admin/leads/${id}/notes`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Lead", id }, "Lead", "AuditLog"],
    }),

    // Email Templates & Outbox Endpoints
    getEmailTemplates: builder.query<EmailTemplateDto[], void>({
      query: () => "/api/v1/admin/email-templates",
      providesTags: ["EmailTemplate"],
    }),
    getEmailTemplateByKey: builder.query<EmailTemplateDto, string>({
      query: (key) => `/api/v1/admin/email-templates/${key}`,
      providesTags: (_res, _err, key) => [{ type: "EmailTemplate", id: key }],
    }),
    updateEmailTemplate: builder.mutation<
      { message: string },
      { key: string; data: UpdateEmailTemplateRequest }
    >({
      query: ({ key, data }) => ({
        url: `/api/v1/admin/email-templates/${key}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { key }) => [
        { type: "EmailTemplate", id: key },
        "EmailTemplate",
        "AuditLog",
      ],
    }),
    sendTestEmail: builder.mutation<{ message: string }, SendTestEmailRequest>({
      query: (body) => ({
        url: "/api/v1/admin/email-templates/test-send",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailLog"],
    }),
    getEmailLogs: builder.query<EmailLogDto[], number | void>({
      query: (count = 50) => `/api/v1/admin/email-logs?count=${count}`,
      providesTags: ["EmailLog"],
    }),
    processOutbox: builder.mutation<{ processedCount: number }, void>({
      query: () => ({
        url: "/api/v1/admin/outbox/process",
        method: "POST",
      }),
      invalidatesTags: ["EmailLog"],
    }),

    // Clients & Lite CRM Endpoints
    getClients: builder.query<
      PaginatedResult<ClientSummary>,
      { page?: number; pageSize?: number; search?: string; status?: ClientStatus; region?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.pageSize) queryParams.set("pageSize", params.pageSize.toString());
        if (params?.search) queryParams.set("search", params.search);
        if (params?.status) queryParams.set("status", params.status.toString());
        if (params?.region) queryParams.set("region", params.region);
        return `/api/v1/admin/clients?${queryParams.toString()}`;
      },
      providesTags: ["Client"],
    }),
    getClientById: builder.query<ClientDetail, string>({
      query: (id) => `/api/v1/admin/clients/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Client", id }],
    }),
    createClient: builder.mutation<{ clientId: string }, CreateClientRequest>({
      query: (body) => ({
        url: "/api/v1/admin/clients",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Client", "AuditLog"],
    }),
    updateClient: builder.mutation<{ message: string }, { id: string; data: UpdateClientRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/admin/clients/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Client", id }, "Client", "AuditLog"],
    }),
    updateClientStatus: builder.mutation<{ message: string }, { id: string; status: ClientStatus }>({
      query: ({ id, status }) => ({
        url: `/api/v1/admin/clients/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Client", id }, "Client", "AuditLog"],
    }),
    convertLeadToClient: builder.mutation<
      { clientId: string; message: string },
      { leadId: string; clientName?: string; industry?: string; taxId?: string; initialTaskTitle?: string }
    >({
      query: ({ leadId, ...body }) => ({
        url: `/api/v1/admin/leads/${leadId}/convert`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Client", "Lead", "Task", "AuditLog"],
    }),
    addClientContact: builder.mutation<
      { contactId: string },
      { clientId: string; fullName: string; email: string; phone?: string; title?: string; isPrimary?: boolean }
    >({
      query: ({ clientId, ...body }) => ({
        url: `/api/v1/admin/clients/${clientId}/contacts`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { clientId }) => [{ type: "Client", id: clientId }],
    }),
    addClientActivity: builder.mutation<
      { message: string },
      { clientId: string; activityType?: string; description: string }
    >({
      query: ({ clientId, ...body }) => ({
        url: `/api/v1/admin/clients/${clientId}/activities`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { clientId }) => [{ type: "Client", id: clientId }],
    }),

    // Tasks Endpoints
    getTasks: builder.query<
      PaginatedResult<TaskItemDto>,
      {
        page?: number;
        pageSize?: number;
        status?: TaskItemStatus;
        priority?: TaskPriority;
        clientId?: string;
        overdueOnly?: boolean;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.pageSize) queryParams.set("pageSize", params.pageSize.toString());
        if (params?.status) queryParams.set("status", params.status.toString());
        if (params?.priority) queryParams.set("priority", params.priority.toString());
        if (params?.clientId) queryParams.set("clientId", params.clientId);
        if (params?.overdueOnly !== undefined) queryParams.set("overdueOnly", params.overdueOnly.toString());
        return `/api/v1/admin/tasks?${queryParams.toString()}`;
      },
      providesTags: ["Task"],
    }),
    createTask: builder.mutation<{ taskId: string }, CreateTaskRequest>({
      query: (body) => ({
        url: "/api/v1/admin/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Task", "Client"],
    }),
    updateTask: builder.mutation<{ message: string }, { id: string; data: UpdateTaskRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/admin/tasks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Task", "Client"],
    }),
    // Blog / Content Collections
    getAdminPosts: builder.query<
      PaginatedResult<BlogPostSummary>,
      { page?: number; pageSize?: number; search?: string; category?: string; status?: BlogPostStatus } | void
    >({
      query: (params) => ({
        url: "/api/v1/admin/posts",
        params: params || {},
      }),
      providesTags: ["BlogPost"],
    }),
    getBlogPostById: builder.query<BlogPostDetail, string>({
      query: (id) => `/api/v1/admin/posts/${id}`,
      providesTags: (_res, _err, id) => [{ type: "BlogPost", id }],
    }),
    createBlogPost: builder.mutation<{ postId: string }, CreateBlogPostRequest>({
      query: (body) => ({
        url: "/api/v1/admin/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BlogPost"],
    }),
    updateBlogPost: builder.mutation<{ message: string }, { id: string; body: UpdateBlogPostRequest }>({
      query: ({ id, body }) => ({
        url: `/api/v1/admin/posts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => ["BlogPost", { type: "BlogPost", id }],
    }),
    deleteBlogPost: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/admin/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BlogPost"],
    }),

    // Lookups & Master Data Endpoints
    getPipelineStages: builder.query<PipelineStage[], { category?: string } | void>({
      query: (arg) => ({
        url: "/api/v1/lookups/pipeline-stages",
        params: arg?.category ? { category: arg.category } : undefined,
      }),
      providesTags: ["PipelineStage"],
    }),
    getAdminPipelineStages: builder.query<PipelineStage[], { category?: string } | void>({
      query: (arg) => ({
        url: "/api/v1/admin/lookups/pipeline-stages",
        params: arg?.category ? { category: arg.category } : undefined,
      }),
      providesTags: ["PipelineStage"],
    }),
    createPipelineStage: builder.mutation<PipelineStage, Partial<PipelineStage>>({
      query: (body) => ({
        url: "/api/v1/admin/lookups/pipeline-stages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PipelineStage"],
    }),
    updatePipelineStage: builder.mutation<PipelineStage, { id: string; body: Partial<PipelineStage> }>({
      query: ({ id, body }) => ({
        url: `/api/v1/admin/lookups/pipeline-stages/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PipelineStage"],
    }),
    getCountryRegions: builder.query<CountryRegion[], void>({
      query: () => "/api/v1/lookups/regions",
      providesTags: ["CountryRegion"],
    }),
    getAdminCountryRegions: builder.query<CountryRegion[], void>({
      query: () => "/api/v1/admin/lookups/regions",
      providesTags: ["CountryRegion"],
    }),
    createCountryRegion: builder.mutation<CountryRegion, Partial<CountryRegion>>({
      query: (body) => ({
        url: "/api/v1/admin/lookups/regions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CountryRegion", "Settings"],
    }),
    updateCountryRegion: builder.mutation<CountryRegion, { id: string; body: Partial<CountryRegion> }>({
      query: ({ id, body }) => ({
        url: `/api/v1/admin/lookups/regions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CountryRegion", "Settings"],
    }),

    // Media Library
    getMediaAssets: builder.query<
      PaginatedResult<MediaAssetDto>,
      { page?: number; pageSize?: number; search?: string; mimeType?: string } | void
    >({
      query: (params) => ({
        url: "/api/v1/admin/media",
        params: params ? {
          page: params.page || 1,
          pageSize: params.pageSize || 24,
          search: params.search || undefined,
          mimeType: params.mimeType || undefined,
        } : { page: 1, pageSize: 24 },
      }),
      providesTags: ["Media"],
    }),
    getMediaAssetById: builder.query<MediaAssetDto, string>({
      query: (id) => `/api/v1/admin/media/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Media", id }],
    }),
    uploadMedia: builder.mutation<MediaAssetDto, FormData>({
      query: (formData) => ({
        url: "/api/v1/admin/media/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Media"],
    }),
    deleteMediaAsset: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/admin/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Media"],
    }),

    // Navigation Menus
    getAdminMenus: builder.query<NavigationMenuDto[], void>({
      query: () => "/api/v1/admin/menus",
      providesTags: ["Menu"],
    }),
    getAdminMenuById: builder.query<NavigationMenuDto, string>({
      query: (id) => `/api/v1/admin/menus/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Menu", id }],
    }),
    saveAdminMenu: builder.mutation<NavigationMenuDto, { id?: string; request: SaveMenuRequest }>({
      query: ({ id, request }) => ({
        url: id ? `/api/v1/admin/menus/${id}` : "/api/v1/admin/menus",
        method: id ? "PUT" : "POST",
        body: request,
      }),
      invalidatesTags: ["Menu"],
    }),
    deleteAdminMenu: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/admin/menus/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),

    // Page Versions & Rollback
    getPageVersions: builder.query<PageVersionSummaryDto[], string>({
      query: (pageId) => `/api/v1/admin/pages/${pageId}/versions`,
      providesTags: (_result, _err, pageId) => [{ type: "CmsPage", id: `versions-${pageId}` }],
    }),
    rollbackPage: builder.mutation<{ success: boolean }, { pageId: string; request: RollbackPageRequest }>({
      query: ({ pageId, request }) => ({
        url: `/api/v1/admin/pages/${pageId}/rollback`,
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["CmsPage"],
    }),
  }),
});

export const {
  useGetCsrfTokenQuery,
  useGetCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useLogoutEverywhereMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetUsersQuery,
  useInviteUserMutation,
  useResendInvitationMutation,
  useSendUserPasswordResetMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetAuditLogsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useTestSmtpConnectionMutation,
  useGetPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useSavePageDraftMutation,
  usePublishPageMutation,
  useGeneratePreviewTokenMutation,
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useGetLeadStatsQuery,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  useGetEmailTemplatesQuery,
  useGetEmailTemplateByKeyQuery,
  useUpdateEmailTemplateMutation,
  useSendTestEmailMutation,
  useGetEmailLogsQuery,
  useProcessOutboxMutation,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useUpdateClientStatusMutation,
  useConvertLeadToClientMutation,
  useAddClientContactMutation,
  useAddClientActivityMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetAdminPostsQuery,
  useGetBlogPostByIdQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetPipelineStagesQuery,
  useGetAdminPipelineStagesQuery,
  useCreatePipelineStageMutation,
  useUpdatePipelineStageMutation,
  useGetCountryRegionsQuery,
  useGetAdminCountryRegionsQuery,
  useCreateCountryRegionMutation,
  useUpdateCountryRegionMutation,
  useGetMediaAssetsQuery,
  useGetMediaAssetByIdQuery,
  useUploadMediaMutation,
  useDeleteMediaAssetMutation,
  useGetAdminMenusQuery,
  useGetAdminMenuByIdQuery,
  useSaveAdminMenuMutation,
  useDeleteAdminMenuMutation,
  useGetPageVersionsQuery,
  useRollbackPageMutation,
} = adminApi;

