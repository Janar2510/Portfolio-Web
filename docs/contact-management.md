# Contact Management Documentation

## Overview

The contact management system provides a comprehensive interface for managing contacts and companies in the CRM module. It includes contact listing with advanced filtering, contact detail pages with activity timelines, and company management.

## Components

### 1. ContactList

**Location**: `components/crm/ContactList.tsx`

Sidebar component for managing contacts with advanced filtering and search.

**Features:**
- Search contacts by name, email, or phone
- Filter by company
- Filter by tags (multi-select)
- Create new contacts
- Edit contacts inline
- Delete contacts
- Visual contact cards with avatars
- Company association display
- Tag badges

**Props:**
- `contacts`: Array of Contact objects
- `companies`: Array of Company objects
- `onContactSelect`: Callback when contact is selected
- `onContactCreate`: Callback to create new contact
- `onContactUpdate`: Callback to update contact
- `onContactDelete`: Callback to delete contact

**Filtering:**
- **Search**: Searches first_name, last_name, email, phone
- **Company**: Filter by specific company
- **Tags**: Multi-select tag filtering
- **Combined**: All filters work together

### 2. ContactDetailPage

**Location**: `app/[locale]/(admin)/crm/contacts/[id]/page.tsx`

Full-page contact detail view with comprehensive information and activity timeline.

**Features:**
- Contact information display
  - Name, job title, company
  - Email, phone, address
  - Lead source, tags
  - Last contacted date
- Deals associated with contact
- Activity timeline with all interactions
- Add new activities
- Edit/delete contact
- Navigation back to contacts list

**Route**: `/crm/contacts/[id]`

**Data Fetched:**
- Contact details
- Associated company
- All activities for the contact
- All deals for the contact

### 3. ActivityTimeline

**Location**: `components/crm/ActivityTimeline.tsx`

Component for displaying and managing CRM activities in a timeline format.

**Features:**
- Display activities chronologically (newest first)
- Activity type icons and colors
  - Email (blue)
  - Call (green)
  - Meeting (purple)
  - Note (gray)
  - Task (orange)
- Activity status indicators (completed/pending)
- Add new activities
- Activity details (title, description, due date)
- Timestamps

**Props:**
- `activities`: Array of CRMActivity objects
- `onActivityCreate`: Callback to create activity
- `onActivityUpdate`: Callback to update activity
- `onActivityDelete`: Callback to delete activity
- `contactId`: Optional contact ID
- `dealId`: Optional deal ID

### 4. CompanyList

**Location**: `components/crm/CompanyList.tsx`

Sidebar component for managing companies.

**Features:**
- List all companies
- Create new companies
- Edit companies
- Delete companies
- Company contact counts
- Visual company cards
- Company details (website, industry, size)

**Props:**
- `companies`: Array of Company objects
- `currentCompanyId`: Currently selected company ID
- `onCompanySelect`: Callback when company is selected
- `onCompanyCreate`: Callback to create new company
- `onCompanyUpdate`: Callback to update company
- `onCompanyDelete`: Callback to delete company
- `contactCounts`: Record of company ID to contact count

### 5. CompaniesPage

**Location**: `app/[locale]/(admin)/crm/companies/page.tsx`

Main page for company management with integrated contact list.

**Features:**
- Three-panel layout:
  - Companies list (left)
  - Contacts for selected company (middle)
  - Company details (right, placeholder)
- Company selection
- Filter contacts by company
- Create contacts within company context

**Route**: `/crm/companies`

## Pages

### ContactsPage

**Location**: `app/[locale]/(admin)/crm/contacts/page.tsx`

Main contacts page with list and detail view.

**Layout:**
- Left sidebar: ContactList
- Right panel: Empty state or contact detail (when selected)

**Route**: `/crm/contacts`

**Features:**
- Full contact list with filtering
- Create/edit/delete contacts
- Navigate to contact detail page

### ContactDetailPage

**Location**: `app/[locale]/(admin)/crm/contacts/[id]/page.tsx`

Individual contact detail page.

**Route**: `/crm/contacts/[id]`

**Features:**
- Full contact information
- Activity timeline
- Associated deals
- Edit/delete actions

### CompaniesPage

**Location**: `app/[locale]/(admin)/crm/companies/page.tsx`

Company management page.

**Route**: `/crm/companies`

**Features:**
- Company list
- Company contacts
- Company details (placeholder)

## Data Flow

```
ContactsPage
  ├── React Query: Fetch contacts, companies
  ├── ContactList: Display and filter contacts
  └── Navigate to ContactDetailPage on select

ContactDetailPage
  ├── React Query: Fetch contact, company, activities, deals
  ├── Display contact information
  ├── ActivityTimeline: Show and manage activities
  └── Display associated deals

CompaniesPage
  ├── React Query: Fetch companies, contacts
  ├── CompanyList: Display companies
  ├── ContactList: Display company contacts
  └── Company details (placeholder)
```

## Features

### ✅ Contact Management
- Create, edit, delete contacts
- Search contacts
- Filter by company
- Filter by tags
- Company association
- Tag management
- Lead source tracking

### ✅ Contact Detail
- Full contact information
- Activity timeline
- Associated deals
- Last contacted tracking
- Edit/delete actions

### ✅ Company Management
- Create, edit, delete companies
- Company contact counts
- Filter contacts by company
- Company details (website, industry, size, address)

### ✅ Activity Timeline
- View all activities chronologically
- Add new activities (email, call, meeting, note, task)
- Activity type indicators
- Status tracking (completed/pending)
- Due dates for tasks

## Usage

### View Contacts
Navigate to `/crm/contacts` to see all contacts with filtering options.

### View Contact Details
Click on any contact to view full details at `/crm/contacts/[id]`.

### Manage Companies
Navigate to `/crm/companies` to manage companies and view their contacts.

### Add Activity
On a contact detail page, click "Add Activity" to record an interaction.

## File Structure

```
src/
├── components/crm/
│   ├── ContactList.tsx          # Contact list with filtering
│   ├── CompanyList.tsx          # Company list
│   ├── ActivityTimeline.tsx     # Activity timeline component
│   └── index.ts                 # Exports
├── app/[locale]/(admin)/crm/
│   ├── contacts/
│   │   ├── page.tsx             # Contacts list page
│   │   └── [id]/
│   │       └── page.tsx         # Contact detail page
│   └── companies/
│       └── page.tsx             # Companies page
└── components/ui/
    └── badge.tsx                # Badge component
```

## Dependencies

- `@tanstack/react-query`: Data fetching and caching
- `date-fns`: Date formatting
- `lucide-react`: Icons
- Shadcn UI components: Button, Input, Dialog, Select, Badge, etc.

## Future Enhancements

- [ ] Contact import/export (CSV)
- [ ] Bulk contact operations
- [ ] Contact merge functionality
- [ ] Advanced search with multiple criteria
- [ ] Contact notes/rich text editor
- [ ] Contact custom fields UI
- [ ] Contact email integration
- [ ] Contact social media links
- [ ] Contact photo upload
- [ ] Company detail page with full information
- [ ] Company hierarchy (parent/child companies)
- [ ] Activity attachments
- [ ] Activity email integration
- [ ] Activity calendar view
