# Pipeline Management Documentation

## Overview

The pipeline management system provides a Kanban-style board for managing sales deals through customizable pipeline stages. It includes deal management, stage customization, and drag-and-drop functionality.

## Components

### 1. PipelineBoard

**Location**: `components/crm/PipelineBoard.tsx`

Main board component with drag-and-drop for stages and deals.

**Features:**
- Drag-and-drop stage reordering (horizontal)
- Drag-and-drop deal movement between stages
- Drag-and-drop deal reordering within stages
- Visual feedback during drag operations
- Horizontal scrolling for multiple stages

**Props:**
- `stages`: Array of PipelineStage objects
- `deals`: Array of Deal objects
- `onStagesReorder`: Callback when stages are reordered
- `onDealMove`: Callback when deal is moved to new stage/position
- `onDealClick`: Callback when deal is clicked
- `onAddDeal`: Optional callback to add new deal
- `onStageSettings`: Optional callback for stage settings

### 2. PipelineStage

**Location**: `components/crm/PipelineStage.tsx`

Individual pipeline stage column component with sortable deals.

**Features:**
- Draggable stage header
- Sortable deal list within stage
- Deal count display
- Total value calculation for stage
- Color-coded stage indicator
- Win probability display
- Add deal button
- Stage settings button

**Props:**
- `stage`: PipelineStage object
- `deals`: Array of Deal objects in this stage
- `onDealClick`: Callback when deal is clicked
- `onAddDeal`: Optional callback to add new deal
- `onStageSettings`: Optional callback for stage settings

### 3. DealCard

**Location**: `components/crm/DealCard.tsx`

Individual deal card component.

**Features:**
- Draggable deal card
- Deal value display with currency
- Probability indicator
- Expected close date with overdue indicator
- Contact/company indicators
- Visual feedback during drag

**Props:**
- `deal`: Deal object
- `onClick`: Callback when card is clicked
- `isDragging`: Whether card is currently being dragged

### 4. DealDetailModal

**Location**: `components/crm/DealDetailModal.tsx`

Modal for viewing and editing deal details.

**Features:**
- View deal details (title, value, stage, contact, company, dates, probability, notes)
- Edit deal details inline
- Change deal stage
- Update deal value and currency
- Link/unlink contact and company
- Set expected close date
- Update probability
- Delete deal functionality

**Props:**
- `deal`: Deal object or null
- `stages`: Array of PipelineStage objects
- `contacts`: Array of Contact objects
- `companies`: Array of Company objects
- `isOpen`: Whether modal is open
- `onClose`: Callback to close modal
- `onUpdate`: Callback to update deal
- `onDelete`: Callback to delete deal

### 5. StageCustomization

**Location**: `components/crm/StageCustomization.tsx`

Component for managing pipeline stages.

**Features:**
- List all stages
- Create new stages
- Edit stage details (name, color, probability, won/lost flags)
- Delete stages
- Reorder stages (up/down buttons)
- Stage type indicators (won/lost)

**Props:**
- `stages`: Array of PipelineStage objects
- `onStageCreate`: Callback to create new stage
- `onStageUpdate`: Callback to update stage
- `onStageDelete`: Callback to delete stage
- `onStagesReorder`: Callback when stages are reordered

### 6. PipelinePage

**Location**: `app/[locale]/(admin)/crm/pipeline/page.tsx`

Main page component that orchestrates all pipeline functionality.

**Features:**
- React Query integration for all data fetching
- Pipeline board view
- Deal detail modal
- Stage customization dialog
- Create deal dialog
- All CRUD operations with optimistic updates
- Automatic query invalidation on mutations

**Route**: `/crm/pipeline`

## Data Flow

```
PipelinePage
  ├── React Query: Fetch stages, deals, contacts, companies
  ├── PipelineBoard (DndContext)
  │   ├── PipelineStage (SortableContext: deals)
  │   │   └── DealCard (SortableItem)
  │   └── DragOverlay
  ├── DealDetailModal
  ├── StageCustomization Dialog
  └── Create Deal Dialog
```

## Drag-and-Drop Implementation

### Stage Reordering
- Stages can be dragged horizontally to reorder
- Uses `horizontalListSortingStrategy` from `@dnd-kit/sortable`
- Updates `sort_order` in database

### Deal Movement
- Deals can be dragged between stages
- Deals can be reordered within stages
- Uses `verticalListSortingStrategy` for deals within stages
- Updates both `stage_id` and `sort_order` in database
- Automatically sets `actual_close_date` and `probability = 100` when moved to won stage (via database trigger)

### Drag ID System
- Stages: `stage-{stageId}`
- Deals: `deal-{dealId}`
- Helper functions: `getStageDragId`, `getDealDragId`, `getStageIdFromDragId`, `getDealIdFromDragId`

## Features

### ✅ Pipeline Board
- Drag-and-drop stage reordering
- Drag-and-drop deal movement
- Deal reordering within stages
- Visual feedback
- Stage statistics (deal count, total value)

### ✅ Deal Management
- Create deals
- View deal details
- Edit deal (title, value, stage, contact, company, dates, probability, notes)
- Delete deals
- Move deals between stages
- Value tracking with currency support
- Probability tracking
- Expected close date with overdue indicators

### ✅ Stage Customization
- Create pipeline stages
- Edit stage details (name, color, probability)
- Delete stages
- Reorder stages
- Mark stages as won/lost
- Stage color coding
- Win probability per stage

## Usage

### View Pipeline
Navigate to `/crm/pipeline` to see the pipeline board.

### Customize Stages
Click "Customize Stages" button to manage pipeline stages.

### Add Deal
Click "Add Deal" button on any stage to create a new deal.

### Edit Deal
Click on any deal card to view and edit deal details.

### Move Deal
Drag and drop deals between stages or within a stage to reorder.

## Stage Management

### Default Stages
When creating a new pipeline, you should create default stages:
- Lead
- Qualified
- Proposal
- Negotiation
- Won (is_won = true)
- Lost (is_lost = true)

### Stage Properties
- **Name**: Display name for the stage
- **Color**: Visual indicator color
- **Probability**: Win probability percentage (0-100)
- **Won Stage**: Marks deals as won when moved here
- **Lost Stage**: Marks deals as lost when moved here
- **Sort Order**: Determines stage position

## Deal Properties

- **Title**: Deal name/description
- **Value**: Deal monetary value
- **Currency**: EUR, USD, GBP (default: EUR)
- **Stage**: Current pipeline stage
- **Contact**: Associated contact (optional)
- **Company**: Associated company (optional)
- **Expected Close Date**: Target close date
- **Actual Close Date**: Automatically set when moved to won stage
- **Probability**: Win probability (0-100)
- **Notes**: Additional deal information

## Database Triggers

The pipeline uses database triggers for automatic updates:
- **Deal Won Trigger**: When a deal is moved to a won stage, it automatically sets:
  - `actual_close_date` = current date
  - `probability` = 100

## File Structure

```
apps/web/
├── components/crm/
│   ├── PipelineBoard.tsx          # Main board component
│   ├── PipelineStage.tsx         # Stage column component
│   ├── DealCard.tsx              # Deal card component
│   ├── DealDetailModal.tsx       # Deal detail modal
│   ├── StageCustomization.tsx    # Stage management component
│   └── index.ts                  # Exports
├── app/[locale]/(admin)/crm/pipeline/
│   └── page.tsx                  # Main pipeline page
```

## Dependencies

- `@dnd-kit/core`: Core drag-and-drop functionality
- `@dnd-kit/sortable`: Sortable items and contexts
- `@dnd-kit/utilities`: Utility functions
- `@tanstack/react-query`: Data fetching and caching
- Shadcn UI components: Button, Dialog, Input, Select, etc.

## Future Enhancements

- [ ] Deal value forecasting
- [ ] Pipeline analytics and reporting
- [ ] Deal probability automation based on stage
- [ ] Deal templates
- [ ] Bulk deal operations
- [ ] Deal email integration
- [ ] Deal activity timeline
- [ ] Deal attachments
- [ ] Pipeline views (list, table)
- [ ] Deal filtering and search
- [ ] Stage-based deal automation
- [ ] Deal conversion tracking
- [ ] Revenue forecasting
