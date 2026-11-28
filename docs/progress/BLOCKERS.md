# Blockers Register

| ID | Module | Blocker Description | Impact | Workaround / Resolution |
|---|---|---|---|---|
| BLK-01 | WhatsApp Cloud API | Meta WhatsApp Cloud API production credentials (`AccessToken`, `PhoneNumberId`) are not configured in local `.env`. | Live outbound WhatsApp message dispatch cannot be verified against Meta servers. | Architecture & Admin UI verified; live send marked `BLOCKED (missing external credentials)` per Section 0.4 & 1.2. |
| BLK-02 | Production Email (SES/Resend) | Production SES/Resend API keys are not configured locally. | Real external email delivery not exercised. | Local Mailpit SMTP (`127.0.0.1:1025` / `:8025`) active and verified for local/E2E email delivery. |
