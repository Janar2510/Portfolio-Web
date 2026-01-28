# Email UI Components

## Overview

The email UI provides a complete interface for managing email accounts, composing emails with templates, and viewing email threads in the CRM context.

## Components

### 1. EmailCompose

**Location**: `components/email/EmailCompose.tsx`

Full-featured email composition dialog with template support.

**Features:**
- Account selection (from connected accounts)
- Template selection and variable substitution
- To, CC, BCC fields
- Subject and body editing
- Template variable editor
- Send email functionality
- Pre-filled fields for replies/forwards

**Props:**
- `isOpen`: Whether dialog is open
- `onClose`: Callback to close dialog
- `onSend`: Callback to send email
- `accounts`: Array of EmailAccount objects
- `templates`: Array of EmailTemplate objects (optional)
- `initialTo`: Pre-filled "To" address
- `initialSubject`: Pre-filled subject
- `initialBody`: Pre-filled body
- `contactId`: Associated contact ID (optional)
- `dealId`: Associated deal ID (optional)

**Template Variables:**
- Templates can contain variables like `{{first_name}}`, `{{company}}`, etc.
- Variable editor allows filling in values before applying template
- Variables are replaced in both subject and body

### 2. EmailThreadView

**Location**: `components/email/EmailThreadView.tsx`

Threaded email conversation view for CRM.

**Features:**
- Display all emails in a thread chronologically
- Expandable/collapsible email messages
- Visual distinction between inbound and outbound emails
- Reply, Reply All, and Forward actions
- Contact and deal context display
- Email metadata (from, to, cc, date)
- Read/unread indicators
- Attachment indicators

**Props:**
- `emails`: Array of Email objects in the thread
- `accountEmail`: Email address of the connected account
- `contact`: Associated Contact object (optional)
- `deal`: Associated Deal object (optional)
- `onReply`: Callback for reply action
- `onReplyAll`: Callback for reply all action
- `onForward`: Callback for forward action
- `onCompose`: Callback for new email

**Email Display:**
- Inbound emails: Left-aligned, gray background
- Outbound emails: Right-aligned, blue background
- Latest email expanded by default
- Click to expand/collapse individual emails

### 3. Enhanced Email Accounts Page

**Location**: `app/[locale]/(admin)/email/accounts/page.tsx`

**Route**: `/email/accounts`

Enhanced account management with sync functionality.

**Features:**
- List all connected email accounts
- Connect Microsoft account (OAuth)
- Connect Apple Mail account (IMAP credentials)
- Sync button for each account
- Toggle account active/inactive
- Delete accounts
- Last sync time display
- Success/error message display

**New Features:**
- Manual sync trigger per account
- Sync status indicators
- Improved account card layout
- Better error handling

### 4. Contact Email Threads Page

**Location**: `app/[locale]/(admin)/crm/contacts/[id]/emails/page.tsx`

**Route**: `/crm/contacts/[id]/emails`

Dedicated page for viewing and managing email threads for a contact.

**Features:**
- Thread list sidebar
- Thread detail view
- Compose new email
- Reply to emails
- Reply all to emails
- Forward emails
- Contact and deal context
- Template support in compose

**Layout:**
- Left sidebar: List of email threads
- Right panel: Selected thread view
- Header: Contact info and compose button
- Compose dialog: Modal for composing emails

## Usage

### Compose Email

```tsx
import { EmailCompose } from '@/components/email';

<EmailCompose
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSend={async (emailData) => {
    // Send email
  }}
  accounts={accounts}
  templates={templates}
  initialTo="contact@example.com"
  contactId={contactId}
/>
```

### View Email Thread

```tsx
import { EmailThreadView } from '@/components/email';

<EmailThreadView
  emails={threadEmails}
  accountEmail={account.email_address}
  contact={contact}
  deal={deal}
  onReply={(email) => {
    // Handle reply
  }}
  onReplyAll={(email) => {
    // Handle reply all
  }}
  onForward={(email) => {
    // Handle forward
  }}
/>
```

## Email Templates

### Template Format

Templates use double curly braces for variables:

```
Subject: Follow up with {{first_name}}

Body:
Hi {{first_name}},

Thank you for your interest in {{company}}.

Best regards,
{{your_name}}
```

### Variable Substitution

When a template is selected:
1. Variables are extracted from subject and body
2. Variable editor appears with input fields
3. User fills in values
4. "Apply Template" button replaces variables
5. Rendered subject and body are inserted into compose form

## Thread Grouping

Emails are automatically grouped into threads based on:
- Normalized subject (removed Re:/Fwd: prefixes)
- Participants (from + to addresses)
- Thread ID from provider (if available)

Threads are displayed chronologically with the latest email first.

## Integration with CRM

### Contact Integration

- Emails are linked to contacts via `contact_id`
- Contact detail page shows "View Email Threads" button
- Email threads page shows all emails for a contact
- Compose pre-fills contact email address

### Deal Integration

- Emails can be linked to deals via `deal_id`
- Deal association shown in thread view
- Compose can associate email with active deal

### Activity Creation

- Emails automatically create CRM activities (via database trigger)
- Activities appear in contact timeline
- Email metadata stored in activity

## File Structure

```
src/
├── components/email/
│   ├── EmailCompose.tsx        # Compose dialog
│   ├── EmailThreadView.tsx     # Thread view component
│   └── index.ts                 # Exports
├── app/[locale]/(admin)/
│   ├── email/accounts/
│   │   └── page.tsx             # Accounts management
│   └── crm/contacts/[id]/
│       ├── emails/
│       │   └── page.tsx         # Email threads page
│       └── page.tsx              # Contact detail (with email link)
```

## Future Enhancements

- [ ] Rich text editor for email body
- [ ] Attachment support
- [ ] Email search and filtering
- [ ] Email signatures
- [ ] Scheduled sending
- [ ] Email drafts
- [ ] Email forwarding in UI
- [ ] Email printing
- [ ] Email export
- [ ] Email archiving
- [ ] Bulk email operations
- [ ] Email templates management UI
- [ ] Email analytics
- [ ] Email read receipts
- [ ] Email tracking
