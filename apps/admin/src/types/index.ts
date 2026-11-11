export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  status: number; // 1 = Active, 2 = Suspended, 3 = Invited
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
  createdAtUtc: string;
  lastLoginAtUtc?: string | null;
}

export interface CsrfResponse {
  token: string;
  headerName: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  status: number;
  role: string;
  createdAtUtc: string;
  lastLoginAtUtc?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RoleDto {
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRolePermissionsRequest {
  permissions: string[];
}

export interface AuditLogDto {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  metadataJson?: string | null;
  timestampUtc: string;
}

export interface SiteSettingsDto {
  companyName: string;
  legalName?: string | null;
  supportEmail: string;
  supportPhone: string;
  address?: string | null;
  defaultRegion: string;
  supportedRegions: string[];
  timeZoneId: string;
  logoMediaId?: string | null;
  logoUrl?: string | null;
  faviconMediaId?: string | null;
  faviconUrl?: string | null;
  versionToken: string;
  updatedAtUtc: string;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUseSsl?: boolean;
  smtpUserName?: string | null;
  smtpPassword?: string | null;
  smtpFromEmail?: string | null;
  smtpFromName?: string | null;
  smtpIsConfigured?: boolean;
  sectionVisibilityJson?: string | null;
  themeTokensJson?: string | null;
  socialLinksJson?: string | null;
  trackingCodesJson?: string | null;
  bookingUrl?: string | null;
  announcementBarJson?: string | null;
}

export interface UpdateSiteSettingsRequest {
  companyName: string;
  legalName?: string | null;
  supportEmail: string;
  supportPhone: string;
  address?: string | null;
  defaultRegion: string;
  supportedRegions: string[];
  timeZoneId: string;
  logoMediaId?: string | null;
  logoUrl?: string | null;
  faviconMediaId?: string | null;
  faviconUrl?: string | null;
  versionToken: string;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUseSsl?: boolean;
  smtpUserName?: string | null;
  smtpPassword?: string | null;
  smtpFromEmail?: string | null;
  smtpFromName?: string | null;
  sectionVisibilityJson?: string | null;
  themeTokensJson?: string | null;
  socialLinksJson?: string | null;
  trackingCodesJson?: string | null;
  bookingUrl?: string | null;
  announcementBarJson?: string | null;
}

export interface TestSmtpConnectionRequest {
  host: string;
  port: number;
  useSsl: boolean;
  userName?: string | null;
  password?: string | null;
  fromEmail: string;
  fromName: string;
  recipientEmail: string;
}

// Dynamic Pipeline & Regions
export interface PipelineStage {
  id: string;
  category: "Lead" | "Client" | "Task" | string;
  stageKey: string;
  value: number;
  displayName: string;
  colorHex: string;
  badgeClass?: string | null;
  orderIndex: number;
  isSystem: boolean;
  isActive: boolean;
}

export interface CountryRegion {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  flagEmoji: string;
  phonePrefix: string;
  taxLabel: string;
  isDefault: boolean;
  isEnabled: boolean;
  orderIndex: number;
}

// CMS Types
export interface CmsBlock {
  id: string;
  type: "Hero" | "FeatureGrid" | "RichText" | "Stats" | "CTA" | "FAQ" | string;
  schemaVersion: number;
  settings: Record<string, unknown>;
  content: Record<string, unknown>;
  enabled: boolean;
  regionFilter?: string[] | null;
}

export interface PageSummary {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: number; // 0 = Draft, 1 = Published, 2 = Archived
  isEnabled: boolean;
  versionNumber: number;
  publishedAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface PageDetail {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: number;
  isEnabled: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  currentDraftVersionId?: string | null;
  publishedVersionId?: string | null;
  blocks: CmsBlock[];
  versionNumber: number;
  versionToken?: string | null;
  publishedAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface CreatePageRequest {
  slug: string;
  locale: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
}

export interface UpdatePageRequest {
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  blocks: CmsBlock[];
  note?: string;
}

export interface SaveDraftRequest {
  title?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  blocks: CmsBlock[];
  versionToken?: string;
  note?: string;
}

export interface PublishPageResponse {
  pageId: string;
  versionNumber: number;
  publishedAtUtc: string;
}

export interface PreviewTokenResponse {
  token: string;
  expiresAtUtc: string;
}

// Leads Types
export enum LeadStatus {
  New = 0,
  InProgress = 1,
  Contacted = 2,
  Qualified = 3,
  Closed = 4,
  Spam = 5,
}

export interface LeadSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  region: string;
  status: LeadStatus;
  utmSource?: string | null;
  utmCampaign?: string | null;
  createdAtUtc: string;
}

export interface LeadDetail {
  id: string;
  formKey: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  region: string;
  state?: string | null;
  postalCode?: string | null;
  status: LeadStatus;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  consentGiven?: boolean;
  consentRecorded?: boolean;
  consentWordingVersion?: string | null;
  ipAddress?: string | null;
  customFields: Record<string, unknown>;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  convertedToClientId?: string | null;
  activities: LeadActivityDto[];
}

export interface LeadActivityDto {
  id: string;
  activityType: string;
  description: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  metadataJson?: string | null;
  createdAtUtc: string;
}

export interface LeadStatsDto {
  totalLeads: number;
  newLeads: number;
  newCount?: number;
  inProgressLeads: number;
  inProgressCount?: number;
  qualifiedLeads: number;
  qualifiedCount?: number;
  closedLeads: number;
  closedWonCount?: number;
}

export type LeadStats = LeadStatsDto;

// CRM / Client Types
export type ClientStatus = 1 | 2 | 3 | 4; // 1 = Active, 2 = Prospect, 3 = Inactive, 4 = Churned

export interface ClientSummary {
  id: string;
  name: string;
  region: string;
  industry?: string | null;
  status: ClientStatus;
  primaryContactEmail: string;
  primaryContactPhone?: string | null;
  activeTasksCount: number;
  createdAtUtc: string;
}

export interface ClientDetail {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  region: string;
  status: ClientStatus;
  primaryContactEmail: string;
  primaryContactPhone?: string | null;
  convertedFromLeadId?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  notes?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  contacts: ContactDto[];
  tasks: TaskItemDto[];
  activities: ClientActivityDto[];
}

export interface CreateClientRequest {
  name: string;
  primaryContactEmail: string;
  primaryContactPhone?: string | null;
  industry?: string | null;
  region: string;
}

export interface UpdateClientRequest {
  name: string;
  status: ClientStatus;
  primaryContactEmail: string;
  primaryContactPhone?: string | null;
  industry?: string | null;
  region: string;
}

export interface ContactDto {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  jobTitle?: string | null;
  isPrimary: boolean;
}

export interface ClientActivityDto {
  id: string;
  activityType: string;
  description: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  createdAtUtc: string;
}

export enum TaskItemStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export interface TaskItemDto {
  id: string;
  title: string;
  description?: string | null;
  dueDateUtc?: string | null;
  priority: number;
  status: number;
  clientId?: string | null;
  clientName?: string | null;
  assignedUserId?: string | null;
  assignedToUserId?: string | null;
  assignedUserEmail?: string | null;
  isOverdue: boolean;
  createdAtUtc: string;
  completedAtUtc?: string | null;
}

export interface CreateTaskRequest {
  clientId?: string | null;
  title: string;
  description?: string | null;
  dueDateUtc?: string | null;
  priority?: number;
  assignedUserId?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  dueDateUtc?: string | null;
  priority?: number;
  status?: number;
  assignedUserId?: string | null;
}

// Email & Outbox Types
export interface EmailTemplateSummary {
  id: string;
  key: string;
  name: string;
  subjectTemplate: string;
  isSystem: boolean;
  updatedAtUtc: string;
}

export interface EmailTemplateDetail {
  id: string;
  key: string;
  name: string;
  subjectTemplate: string;
  bodyHtmlTemplate: string;
  bodyPlainTextTemplate: string;
  isSystem: boolean;
  isActive?: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type EmailTemplateDto = EmailTemplateDetail;

export interface UpdateEmailTemplateRequest {
  name: string;
  subjectTemplate: string;
  bodyHtmlTemplate: string;
  bodyPlainTextTemplate?: string | null;
  isActive?: boolean;
}

export interface SendTestEmailRequest {
  templateKey?: string;
  recipientEmail?: string;
  toEmail?: string;
  variables?: Record<string, string>;
}

export interface EmailLogDto {
  id: string;
  templateKey?: string | null;
  recipientEmail: string;
  subject: string;
  status: number;
  errorMessage?: string | null;
  sentAtUtc?: string | null;
  createdAtUtc: string;
}

// Blog Post Types
export enum BlogPostStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string;
  coverImageUrl?: string | null;
  authorName: string;
  status: BlogPostStatus;
  publishedAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  tags: string;
  coverImageUrl?: string | null;
  authorName: string;
  status: BlogPostStatus;
  publishedAtUtc?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface CreateBlogPostRequest {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category?: string;
  tags?: string;
  coverImageUrl?: string | null;
  authorName?: string;
  status?: BlogPostStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateBlogPostRequest {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: string;
  tags: string;
  coverImageUrl?: string | null;
  authorName: string;
  status: BlogPostStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

// Step 4: Media, Menus, Versioning
export interface MediaAssetDto {
  id: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  url: string;
  createdAtUtc: string;
}

export interface NavigationMenuItemDto {
  id: string;
  label: string;
  url: string;
  displayOrder: number;
  parentItemId?: string | null;
  children: NavigationMenuItemDto[];
}

export interface NavigationMenuDto {
  id: string;
  key: string;
  title: string;
  regionCode?: string | null;
  items: NavigationMenuItemDto[];
}

export interface SaveMenuItemRequest {
  label: string;
  url: string;
  displayOrder: number;
  parentItemId?: string | null;
}

export interface SaveMenuRequest {
  key: string;
  title: string;
  regionCode?: string | null;
  items?: SaveMenuItemRequest[] | null;
}

export interface PageVersionSummaryDto {
  id: string;
  versionNumber: number;
  note?: string | null;
  isPublished: boolean;
  createdAtUtc: string;
  publishedAtUtc?: string | null;
  createdByUserId?: string | null;
}

export interface RollbackPageRequest {
  versionNumber: number;
}
