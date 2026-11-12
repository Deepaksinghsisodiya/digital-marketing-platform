# Third-Party Dependencies & Open-Source Licenses

All packages and dependencies used across the Nexora platform must use permissive open-source licenses (MIT, Apache-2.0, BSD, ISC, OFL).
Runtime usage of GPL, AGPL, or proprietary paid dependencies is strictly prohibited.

## 1. Backend (.NET 10 / ASP.NET Core)

| Package                                           | Version | License      | Purpose                              |
| ------------------------------------------------- | ------- | ------------ | ------------------------------------ |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 9.0.0   | MIT          | Core Authentication & RBAC Identity  |
| Microsoft.EntityFrameworkCore.SqlServer           | 9.0.0   | MIT          | Database Provider (SQL Server)       |
| Serilog.AspNetCore                                | 8.0.3   | Apache-2.0   | Structured Logging                   |
| FluentValidation                                  | 11.10.0 | Apache-2.0   | Request Payload Validation           |
| MailKit                                           | 4.8.0   | MIT          | Smtp Mail Sending                    |
| MimeKit                                           | 4.8.0   | MIT          | RFC MIME Message Composition         |
| xunit                                             | 2.9.2   | Apache-2.0   | Unit & Integration Test Runner       |
| Shouldly                                          | 4.2.1   | BSD-2-Clause | Test Assertion Engine                |
| NetArchTest.eNhancedEdition                       | 1.4.3   | MIT          | Clean Architecture Rules Enforcement |

## 2. Frontend Admin (`apps/admin`)

| Package          | Version | License | Purpose                      |
| ---------------- | ------- | ------- | ---------------------------- |
| react            | ^19.0.0 | MIT     | UI Framework                 |
| @reduxjs/toolkit | ^2.3.0  | MIT     | State Management & RTK Query |
| lucide-react     | ^1.70.0 | ISC     | Iconography                  |
| tailwindcss      | ^3.4.17 | MIT     | Utility Styling              |
| vite             | ^6.0.0  | MIT     | Bundler & Dev Server         |

## 3. Frontend Website (`apps/website`)

| Package                   | Version | License    | Purpose                        |
| ------------------------- | ------- | ---------- | ------------------------------ |
| next                      | 15.5.29 | MIT        | React Framework with SSR & RSC |
| react                     | ^19.0.0 | MIT        | UI Framework                   |
| lucide-react              | ^1.70.0 | ISC        | Iconography                    |
| tailwindcss               | ^3.4.17 | MIT        | Styling                        |
| @radix-ui/react-dialog    | ^1.1.6  | MIT        | Accessible Modal / Drawer      |
| @radix-ui/react-accordion | ^1.2.3  | MIT        | Accessible Collapsible FAQ     |
| @radix-ui/react-tabs      | ^1.1.3  | MIT        | Accessible Tab Panels          |
| class-variance-authority  | ^0.7.1  | Apache-2.0 | Type-safe Component Variants   |

## 4. Fonts

| Font Family       | Source             | License                   | Hosting Mode                |
| ----------------- | ------------------ | ------------------------- | --------------------------- |
| Inter             | Google Fonts / OFL | SIL Open Font License 1.1 | Self-hosted via `next/font` |
| Plus Jakarta Sans | Google Fonts / OFL | SIL Open Font License 1.1 | Self-hosted via `next/font` |
