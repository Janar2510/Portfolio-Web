# Quick Start: Using the New Pipedrive-Style CRM

## 🎯 What's New

I've created a complete Pipedrive-style CRM upgrade with:

1. **New Database Tables** - 18 new tables for advanced CRM features
2. **Enhanced Service Layer** - `CRMEnhancedService` with all new methods
3. **New Components** - LabelPicker, CustomFieldRenderer, ProductsList, LeadsList, NotesList
4. **New Pages** - Products and Leads management pages
5. **Example Integration** - Enhanced person detail page showing new features

## 📍 Where to See the Changes

### New Pages (Ready to Use)
1. **Products Page**: Navigate to `/crm/products`
   - Full product catalog management
   - Create, edit, delete products
   - Set pricing, tax, categories

2. **Leads Page**: Navigate to `/crm/leads`
   - Manage leads
   - Convert leads to deals
   - Track lead status

### Example Enhanced Page
- **Location**: `apps/web/app/[locale]/(admin)/crm/contacts/[id]/page-enhanced.tsx`
- This shows how to integrate:
  - Labels (LabelPicker component)
  - Notes (NotesList component)
  - Enhanced activities
  - Multiple emails/phones support

## 🚀 Quick Integration Example

Here's how to use the new service in any page:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CRMEnhancedService } from '@/lib/services/crm-enhanced';
import { LabelPicker } from '@/components/crm/LabelPicker';

export default function MyPage() {
  const supabase = createClient();
  const crmService = new CRMEnhancedService(supabase);

  // Fetch persons (new name for contacts)
  const { data: persons } = useQuery({
    queryKey: ['crm-persons'],
    queryFn: () => crmService.getPersons(),
  });

  // Fetch labels
  const { data: labels } = useQuery({
    queryKey: ['crm-labels'],
    queryFn: () => crmService.getLabels('person'),
  });

  return (
    <div>
      <h1>Persons</h1>
      {persons?.map((person) => (
        <div key={person.id}>
          <h2>{person.name}</h2>
          <LabelPicker
            labels={labels || []}
            selectedLabelIds={person.label_ids || []}
            onLabelsChange={(ids) => {
              crmService.updatePerson(person.id, { label_ids: ids });
            }}
            entityType="person"
          />
        </div>
      ))}
    </div>
  );
}
```

## 📦 Available Components

### LabelPicker
```tsx
<LabelPicker
  labels={labels}
  selectedLabelIds={selectedIds}
  onLabelsChange={handleChange}
  onCreateLabel={handleCreate}
  entityType="person" // or "organization", "deal", "lead"
/>
```

### CustomFieldRenderer
```tsx
<CustomFieldRenderer
  field={fieldDefinition}
  value={currentValue}
  onChange={handleChange}
/>
```

### ProductsList
```tsx
<ProductsList
  products={products}
  onCreateProduct={handleCreate}
  onUpdateProduct={handleUpdate}
  onDeleteProduct={handleDelete}
/>
```

### LeadsList
```tsx
<LeadsList
  leads={leads}
  labels={labels}
  onCreateLead={handleCreate}
  onUpdateLead={handleUpdate}
  onConvertLead={handleConvert}
  onCreateLabel={handleCreateLabel}
/>
```

### NotesList
```tsx
<NotesList
  notes={notes}
  onCreateNote={handleCreate}
  onUpdateNote={handleUpdate}
  onDeleteNote={handleDelete}
  entityType="person"
  entityId={personId}
/>
```

## 🔧 Service Methods Available

### Organizations
- `getOrganizations()`
- `getOrganizationById(id)`
- `createOrganization(data)`
- `updateOrganization(id, updates)`
- `deleteOrganization(id)`

### Persons
- `getPersons(filters?)`
- `getPersonById(id)`
- `createPerson(data)`
- `updatePerson(id, updates)`
- `deletePerson(id)`

### Pipelines & Stages
- `getPipelines()`
- `getPipelineStages(pipelineId?)`
- `createPipeline(data)`
- `createPipelineStage(data)`
- `reorderPipelineStages(stageIds)`

### Deals
- `getDeals(filters?)`
- `getDealById(id)`
- `createDeal(data)`
- `updateDeal(id, updates)`
- `moveDeal(dealId, stageId, stageOrder)`
- `markDealWon(dealId)`
- `markDealLost(dealId, reason?)`

### Products
- `getProducts()`
- `createProduct(data)`
- `updateProduct(id, updates)`
- `deleteProduct(id)`
- `getDealProducts(dealId)`
- `addProductToDeal(data)`

### Leads
- `getLeads(filters?)`
- `getLeadById(id)`
- `createLead(data)`
- `updateLead(id, updates)`
- `convertLeadToDeal(leadId, dealData)`

### Labels
- `getLabels(entityType)`
- `createLabel(data)`
- `updateLabel(id, updates)`
- `deleteLabel(id)`

### Notes
- `getNotes(filters?)`
- `createNote(data)`
- `updateNote(id, updates)`
- `deleteNote(id)`

### Activities
- `getActivities(filters?)`
- `createActivity(data)`
- `updateActivity(id, updates)`
- `deleteActivity(id)`

### Custom Fields
- `getCustomFields(entityType)`
- `createCustomField(data)`
- `updateCustomField(id, updates)`
- `deleteCustomField(id)`

## 📝 Next Steps

1. **Test the new pages**:
   - Go to `/crm/products` to see the products page
   - Go to `/crm/leads` to see the leads page

2. **Run the database migration**:
   - Apply `supabase/migrations/20240109000000_upgrade_crm_to_pipedrive_style.sql`
   - Execute the data migration functions if you have existing data

3. **Integrate into existing pages**:
   - Use `CRMEnhancedService` instead of `CRMService`
   - Add `LabelPicker` to detail pages
   - Add `NotesList` to detail pages
   - Use new types from `@/lib/crm/types`

4. **Check the example**:
   - Look at `apps/web/app/[locale]/(admin)/crm/contacts/[id]/page-enhanced.tsx`
   - This shows a complete integration example

## 🎨 Files Created

All files are in your project. Check:
- `apps/web/lib/services/crm-enhanced.ts` - Service layer
- `apps/web/lib/crm/types.ts` - TypeScript types
- `apps/web/components/crm/` - New components
- `apps/web/app/[locale]/(admin)/crm/products/page.tsx` - Products page
- `apps/web/app/[locale]/(admin)/crm/leads/page.tsx` - Leads page
- `supabase/migrations/20240109000000_upgrade_crm_to_pipedrive_style.sql` - Migration
