# Backend Endpoint Authorization & Permission Matrix

Every administrative endpoint in the Nexora platform requires explicit permission gating using standard policies. No administrative endpoint relies merely on unparameterized `.RequireAuthorization()`.

## 1. Authentication & Profile Endpoints

| Route                            | Method | Required Policy / Permission | Description                                       |
| -------------------------------- | ------ | ---------------------------- | ------------------------------------------------- |
| `/api/v1/auth/csrf`              | `GET`  | _Anonymous_                  | Retrieve anti-forgery token                       |
| `/api/v1/auth/login`             | `POST` | _Anonymous_                  | User credential authentication                    |
| `/api/v1/auth/forgot-password`   | `POST` | _Anonymous_                  | Request password reset token                      |
| `/api/v1/auth/reset-password`    | `POST` | _Anonymous_                  | Consume reset token & set password                |
| `/api/v1/auth/setup-password`    | `POST` | _Anonymous_                  | Invited user activation & initial password        |
| `/api/v1/auth/logout`            | `POST` | `Authenticated`              | Invalidate current session cookie                 |
| `/api/v1/auth/logout-everywhere` | `POST` | `Authenticated`              | Invalidate all sessions via SecurityStamp refresh |
| `/api/v1/auth/change-password`   | `POST` | `Authenticated`              | User password change                              |
| `/api/v1/auth/me`                | `GET`  | `Authenticated`              | Current user profile, roles, and permissions      |

## 2. User & Access Governance

| Route                                        | Method   | Required Policy / Permission          | Description                            |
| -------------------------------------------- | -------- | ------------------------------------- | -------------------------------------- |
| `/api/v1/admin/users`                        | `GET`    | `Permissions.UsersView`               | Paginated team member directory        |
| `/api/v1/admin/users/invite`                 | `POST`   | `Permissions.UsersManage`             | Send team invitation                   |
| `/api/v1/admin/users/{id}/resend-invitation` | `POST`   | `Permissions.UsersManage`             | Resend activation link to invited user |
| `/api/v1/admin/users/{id}/reset-password`    | `POST`   | `Permissions.UsersManage`             | Dispatch password reset email to user  |
| `/api/v1/admin/users/{id}`                   | `PATCH`  | `Permissions.UsersManage`             | Update role or toggle suspension       |
| `/api/v1/admin/users/{id}`                   | `DELETE` | `Permissions.UsersManage`             | Permanently delete user                |
| `/api/v1/admin/roles`                        | `GET`    | `Permissions.RolesView`               | List system & custom roles             |
| `/api/v1/admin/roles`                        | `POST`   | `Permissions.RolesView` (Owner/Admin) | Create custom role                     |
| `/api/v1/admin/roles/{roleName}`             | `PUT`    | `Permissions.RolesView` (Owner/Admin) | Update role permission grants          |
| `/api/v1/admin/roles/{roleName}`             | `DELETE` | `Permissions.RolesView` (Owner/Admin) | Delete custom role                     |
| `/api/v1/admin/permissions`                  | `GET`    | `Permissions.RolesView`               | List catalog of system permissions     |

## 3. Leads & CRM Pipeline

| Route                                | Method   | Required Policy / Permission | Description                    |
| ------------------------------------ | -------- | ---------------------------- | ------------------------------ |
| `/api/v1/admin/leads`                | `GET`    | `Permissions.LeadsView`      | List leads with filter/sort    |
| `/api/v1/admin/leads/{id}`           | `GET`    | `Permissions.LeadsView`      | Get detailed lead record       |
| `/api/v1/admin/leads/export`         | `GET`    | `Permissions.LeadsExport`    | Formula-sanitized CSV export   |
| `/api/v1/admin/leads/{id}/status`    | `PATCH`  | `Permissions.LeadsManage`    | Transition lead status         |
| `/api/v1/admin/leads/{id}`           | `PATCH`  | `Permissions.LeadsManage`    | Update notes or lead fields    |
| `/api/v1/admin/pipeline/stages`      | `GET`    | `Permissions.SettingsView`   | List pipeline stages           |
| `/api/v1/admin/pipeline/stages`      | `POST`   | `Permissions.SettingsManage` | Add custom pipeline stage      |
| `/api/v1/admin/pipeline/stages/{id}` | `PUT`    | `Permissions.SettingsManage` | Update pipeline stage metadata |
| `/api/v1/admin/pipeline/stages/{id}` | `DELETE` | `Permissions.SettingsManage` | Delete pipeline stage          |

## 4. Clients & Tasks

| Route                                 | Method   | Required Policy / Permission | Description                        |
| ------------------------------------- | -------- | ---------------------------- | ---------------------------------- |
| `/api/v1/admin/clients`               | `GET`    | `Permissions.ClientsView`    | Paginated client roster            |
| `/api/v1/admin/clients/{id}`          | `GET`    | `Permissions.ClientsView`    | Detailed client record             |
| `/api/v1/admin/clients`               | `POST`   | `Permissions.ClientsManage`  | Create client from lead or scratch |
| `/api/v1/admin/clients/{id}`          | `PUT`    | `Permissions.ClientsManage`  | Update client record               |
| `/api/v1/admin/clients/{id}/status`   | `PATCH`  | `Permissions.ClientsManage`  | Update client status               |
| `/api/v1/admin/clients/{id}`          | `DELETE` | `Permissions.ClientsManage`  | Delete client                      |
| `/api/v1/admin/clients/{id}/contacts` | `POST`   | `Permissions.ClientsManage`  | Add client contact                 |
| `/api/v1/admin/clients/{id}/timeline` | `POST`   | `Permissions.ClientsManage`  | Record interaction event           |
| `/api/v1/admin/tasks`                 | `GET`    | `Permissions.TasksView`      | Paginated task list                |
| `/api/v1/admin/tasks`                 | `POST`   | `Permissions.TasksManage`    | Create client task                 |
| `/api/v1/admin/tasks/{id}`            | `PATCH`  | `Permissions.TasksManage`    | Update task status or assignment   |

## 5. CMS, Pages, Media & Navigation Menus

| Route                                    | Method   | Required Policy / Permission | Description                                 |
| ---------------------------------------- | -------- | ---------------------------- | ------------------------------------------- |
| `/api/v1/admin/pages`                    | `GET`    | `Permissions.PagesView`      | List CMS pages with versions                |
| `/api/v1/admin/pages/{id}`               | `GET`    | `Permissions.PagesView`      | Fetch page draft blocks                     |
| `/api/v1/admin/pages`                    | `POST`   | `Permissions.PagesEdit`      | Create new CMS page                         |
| `/api/v1/admin/pages/{id}/draft`         | `PUT`    | `Permissions.PagesEdit`      | Save page draft                             |
| `/api/v1/admin/pages/{id}/publish`       | `POST`   | `Permissions.PagesPublish`   | Publish page version to live                |
| `/api/v1/admin/pages/{id}`               | `DELETE` | `Permissions.PagesEdit`      | Archive/delete page                         |
| `/api/v1/admin/pages/{id}/preview-token` | `POST`   | `Permissions.PagesView`      | Generate signed preview token               |
| `/api/v1/admin/pages/{id}/rollback/{v}`  | `POST`   | `Permissions.PagesPublish`   | Rollback to specific version                |
| `/api/v1/admin/media`                    | `GET`    | `Permissions.PagesView`      | List uploaded media assets                  |
| `/api/v1/admin/media/{id}`               | `GET`    | `Permissions.PagesView`      | Asset metadata                              |
| `/api/v1/admin/media/upload`             | `POST`   | `Permissions.PagesEdit`      | Multipart upload with magic-byte validation |
| `/api/v1/admin/media/{id}`               | `DELETE` | `Permissions.PagesEdit`      | Delete media asset                          |
| `/api/v1/admin/menus`                    | `GET`    | `Permissions.PagesView`      | List navigation menus                       |
| `/api/v1/admin/menus/{id}`               | `GET`    | `Permissions.PagesView`      | Get menu tree with items                    |
| `/api/v1/admin/menus`                    | `POST`   | `Permissions.PagesEdit`      | Create menu                                 |
| `/api/v1/admin/menus/{id}`               | `PUT`    | `Permissions.PagesEdit`      | Update menu tree & items                    |
| `/api/v1/admin/menus/{id}`               | `DELETE` | `Permissions.PagesEdit`      | Delete menu                                 |

## 6. Email Templates & Outbox

| Route                                          | Method | Required Policy / Permission | Description                            |
| ---------------------------------------------- | ------ | ---------------------------- | -------------------------------------- |
| `/api/v1/admin/email-templates`                | `GET`  | `Permissions.SettingsView`   | List registered email templates        |
| `/api/v1/admin/email-templates/{key}`          | `GET`  | `Permissions.SettingsView`   | Get template subject & body            |
| `/api/v1/admin/email-templates/{key}`          | `PUT`  | `Permissions.SettingsManage` | Update template variables & HTML       |
| `/api/v1/admin/email-templates/{key}/test`     | `POST` | `Permissions.SettingsManage` | Send test preview to admin             |
| `/api/v1/admin/email-templates/outbox`         | `GET`  | `Permissions.SettingsView`   | Inspect transactional outbox           |
| `/api/v1/admin/email-templates/outbox/process` | `POST` | `Permissions.SettingsManage` | Trigger immediate outbox delivery tick |

## 7. Site Settings & Audit Trails

| Route                              | Method | Required Policy / Permission | Description                            |
| ---------------------------------- | ------ | ---------------------------- | -------------------------------------- |
| `/api/v1/admin/settings`           | `GET`  | `Permissions.SettingsView`   | Read site settings & configuration     |
| `/api/v1/admin/settings`           | `PUT`  | `Permissions.SettingsManage` | Update settings (theme, SEO, branding) |
| `/api/v1/admin/settings/test-smtp` | `POST` | `Permissions.SettingsManage` | Test SMTP server handshake             |
| `/api/v1/admin/audit`              | `GET`  | `Permissions.AuditView`      | Paginated immutable audit trail        |
