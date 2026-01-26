# User Flow Map

> Complete user journey from landing page through all modules

---

## 1. Landing Page → Sign Up Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE                                  │
│  ┌──────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  ┌───────────────┐ │
│  │ Hero │→ │ Features │→ │ Pricing│→ │ Examples│→ │ Call to Action│ │
│  └──────┘  └──────────┘  └────────┘  └─────────┘  └───────────────┘ │
│                              │                            │          │
│                              ▼                            ▼          │
│                      ┌─────────────┐              ┌─────────────┐    │
│                      │   Sign In   │              │   Sign Up   │    │
│                      └─────────────┘              └─────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING FLOW                               │
│                                                                      │
│  Step 1    Step 2     Step 3      Step 4     Step 5    Step 6   7   │
│  Welcome → Profile → Template → Customize → Content → Tour → Publish│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard → Module Navigation

```
                    ┌──────────────────────────────────────┐
                    │              DASHBOARD               │
                    │  • Quick stats                       │
                    │  • Recent activity                   │
                    │  • Pending tasks                     │
                    └──────────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │            │               │               │            │
        ▼            ▼               ▼               ▼            ▼
   ┌─────────┐ ┌──────────┐   ┌──────────┐   ┌──────────┐  ┌──────────┐
   │Portfolio│ │   CRM    │   │ Projects │   │Analytics │  │  Email   │
   └─────────┘ └──────────┘   └──────────┘   └──────────┘  └──────────┘
```

---

## 3. Portfolio Module Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PORTFOLIO MODULE                                │
│                                                                      │
│  /portfolio                                                          │
│  ├── Site Overview                                                   │
│  │   ├── [Edit Site] ──────────→ /portfolio/editor                  │
│  │   ├── [Settings] ───────────→ /portfolio/settings                │
│  │   └── [View Site] ──────────→ {subdomain}.supale.com             │
│  │                                                                   │
│  /portfolio/editor                                                   │
│  ├── Pages Panel                                                     │
│  │   ├── Add Page                                                    │
│  │   ├── Edit Page                                                   │
│  │   └── Delete Page                                                 │
│  ├── Blocks Panel                                                    │
│  │   ├── Add Block                                                   │
│  │   ├── Reorder Blocks                                              │
│  │   └── Delete Block                                                │
│  ├── Styles Panel                                                    │
│  │   ├── Colors                                                      │
│  │   ├── Typography                                                  │
│  │   └── Spacing                                                     │
│  └── Settings Panel                                                  │
│      ├── SEO                                                         │
│      ├── Domain                                                      │
│      └── Analytics                                                   │
│                                                                      │
│  /portfolio/settings                                                 │
│  ├── General Settings                                                │
│  ├── Projects (Portfolio Items)                                      │
│  ├── Form Submissions                                                │
│  └── Domain Settings                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. CRM Module Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CRM MODULE                                  │
│                                                                      │
│  /crm/contacts                                                       │
│  ├── Contact List                                                    │
│  │   ├── Search & Filter                                             │
│  │   ├── [Add Contact] ────────→ Create Contact Dialog              │
│  │   └── [View Contact] ───────→ /crm/contacts/{id}                 │
│  │                                                                   │
│  /crm/contacts/{id}                                                  │
│  ├── Contact Details                                                 │
│  ├── Activity Timeline                                               │
│  ├── Related Deals                                                   │
│  ├── Email History ────────────→ /crm/contacts/{id}/emails          │
│  └── [Send Email] ─────────────→ Email Compose Dialog               │
│                                                                      │
│  /crm/companies                                                      │
│  ├── Company List                                                    │
│  │   ├── [Add Company]                                               │
│  │   └── [View Company] ───────→ /crm/companies/{id}                │
│  │                                                                   │
│  /crm/pipeline                                                       │
│  ├── Pipeline Board (Kanban)                                         │
│  │   ├── Stages                                                      │
│  │   │   ├── Drag & Drop Deals                                       │
│  │   │   └── Stage Customization                                     │
│  │   └── [Add Deal] ───────────→ Create Deal Dialog                 │
│  │                                                                   │
│  /crm/activities                                                     │
│  ├── Activities List                                                 │
│  ├── Follow-up Reminders                                             │
│  └── Notifications                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Projects Module Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PROJECTS MODULE                                │
│                                                                      │
│  /projects                                                           │
│  ├── Project List                                                    │
│  │   ├── [Add Project] ────────→ Create Project Dialog              │
│  │   └── [View Project] ───────→ Project Kanban Board               │
│  │                                                                   │
│  Project Kanban Board                                                │
│  ├── Columns                                                         │
│  │   ├── To Do                                                       │
│  │   ├── In Progress                                                 │
│  │   └── Done                                                        │
│  ├── Tasks                                                           │
│  │   ├── Drag & Drop                                                 │
│  │   ├── [Add Task]                                                  │
│  │   └── [View Task] ──────────→ Task Detail Modal                  │
│  │                                                                   │
│  Task Detail Modal                                                   │
│  ├── Title & Description                                             │
│  ├── Priority & Due Date                                             │
│  ├── Subtasks                                                        │
│  ├── Comments                                                        │
│  └── Attachments                                                     │
│                                                                      │
│  /projects/calendar                                                  │
│  ├── Month View                                                      │
│  ├── Week View                                                       │
│  └── Day View                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Analytics Module Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ANALYTICS MODULE                                │
│                                                                      │
│  /analytics/portfolio                                                │
│  ├── Site Selection                                                  │
│  ├── Time Period Filter                                              │
│  ├── Key Metrics                                                     │
│  │   ├── Pageviews                                                   │
│  │   ├── Unique Visitors                                             │
│  │   ├── Form Submissions                                            │
│  │   └── Session Duration                                            │
│  └── Breakdowns                                                      │
│      ├── Top Pages                                                   │
│      ├── Device Types                                                │
│      └── Referrers                                                   │
│                                                                      │
│  /analytics/crm                                                      │
│  ├── CRM Metrics                                                     │
│  │   ├── Contacts                                                    │
│  │   ├── Companies                                                   │
│  │   ├── Deals                                                       │
│  │   └── Pipeline Value                                              │
│  └── Breakdowns                                                      │
│      ├── Deals by Stage                                              │
│      ├── Activity Types                                              │
│      └── Top Companies                                               │
│                                                                      │
│  /analytics/ab-testing                                               │
│  ├── Experiments List                                                │
│  ├── [Create Experiment]                                             │
│  ├── Experiment Details                                              │
│  │   ├── Variants                                                    │
│  │   ├── Traffic Split                                               │
│  │   └── Results                                                     │
│  └── Statistical Analysis                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Email Module Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EMAIL MODULE                                  │
│                                                                      │
│  /email/accounts                                                     │
│  ├── Connected Accounts                                              │
│  │   ├── Microsoft/Outlook                                           │
│  │   ├── Apple Mail (IMAP)                                           │
│  │   └── [Add Account]                                               │
│  ├── Sync Status                                                     │
│  └── Account Settings                                                │
│                                                                      │
│  /email/inbox (PLANNED)                                              │
│  ├── Email List                                                      │
│  ├── Thread View                                                     │
│  ├── Compose Email                                                   │
│  └── Search & Filter                                                 │
│                                                                      │
│  /email/templates (PLANNED)                                          │
│  ├── Template List                                                   │
│  ├── Create Template                                                 │
│  └── Template Variables                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Settings Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SETTINGS                                     │
│                                                                      │
│  /settings                                                           │
│  ├── Profile                                                         │
│  │   ├── Display Name                                                │
│  │   ├── Avatar                                                      │
│  │   └── Timezone                                                    │
│  ├── Preferences                                                     │
│  │   ├── Language (EN/ET)                                            │
│  │   ├── Theme (Dark/Light)                                          │
│  │   └── Notifications                                               │
│  ├── Billing (PLANNED)                                               │
│  │   ├── Current Plan                                                │
│  │   ├── Payment Methods                                             │
│  │   └── Invoices                                                    │
│  └── Integrations (PLANNED)                                          │
│      ├── Connected Services                                          │
│      └── API Keys                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PAYMENT FLOW                                   │
│                                                                      │
│  User selects plan                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────────────────────────────────────────┐            │
│  │              PAYMENT METHOD SELECTION               │            │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐     │            │
│  │  │  Stripe  │  │Apple Pay │  │   Montonio    │     │            │
│  │  │  (Card)  │  │          │  │(Estonian Bank)│     │            │
│  │  └──────────┘  └──────────┘  └───────────────┘     │            │
│  └─────────────────────────────────────────────────────┘            │
│         │                                                            │
│         ▼                                                            │
│  Payment Provider Checkout                                           │
│         │                                                            │
│         ▼                                                            │
│  Webhook → Update Subscription                                       │
│         │                                                            │
│         ▼                                                            │
│  Success → Dashboard with new plan                                   │
└─────────────────────────────────────────────────────────────────────┘
```
