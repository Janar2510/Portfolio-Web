# A/B Testing Documentation

## Overview

The A/B testing system allows you to create experiments to test different versions of your portfolio content and measure which performs better. You can test pages, blocks, or styles with configurable conversion goals.

## Features

- **Experiment Creation**: Create A/B tests for pages, blocks, or styles
- **Variant Management**: Create and manage multiple variants for each experiment
- **Traffic Splitting**: Configure how traffic is distributed between variants
- **Conversion Tracking**: Track conversions based on pageviews, clicks, or form submissions
- **Results Visualization**: View detailed performance metrics and statistical comparisons
- **Experiment Lifecycle**: Manage experiment status (draft, running, paused, completed)

## Database Schema

### `ab_experiments` Table

- `id`: UUID primary key
- `user_id`: Reference to user profile
- `site_id`: Reference to portfolio site
- `name`: Experiment name
- `description`: Optional description
- `target_type`: 'page', 'block', or 'style'
- `target_id`: ID of the target being tested
- `status`: 'draft', 'running', 'paused', or 'completed'
- `traffic_split`: Percentage of traffic for variant B (default: 50)
- `goal_type`: 'pageview', 'click', or 'form_submit'
- `goal_target`: Specific element or action (for click/form_submit goals)
- `started_at`: When experiment started
- `ended_at`: When experiment ended
- `created_at`: Creation timestamp

### `ab_variants` Table

- `id`: UUID primary key
- `experiment_id`: Reference to experiment
- `name`: Variant name (e.g., "Control", "Variant A")
- `is_control`: Boolean indicating if this is the control variant
- `content_diff`: JSONB object describing differences from control
- `visitors`: Number of visitors who saw this variant
- `conversions`: Number of conversions for this variant
- `created_at`: Creation timestamp

## Usage

### Creating an Experiment

1. Navigate to `/analytics/ab-testing`
2. Select a portfolio site
3. Click "New Experiment"
4. Fill in the experiment details:
   - **Name**: Descriptive name for the experiment
   - **Description**: Optional explanation of what you're testing
   - **What to Test**: Choose page, block, or style
   - **Target**: Select the specific page/block to test
   - **Traffic Split**: Percentage for variant B (default: 50%)
   - **Conversion Goal**: What counts as a conversion
   - **Goal Target**: Specific element (for click/form_submit goals)

### Managing Variants

1. Create an experiment (status: draft)
2. Click "Add Variants" on the experiment card
3. Create variants:
   - **Control Variant**: The baseline version (created automatically or manually)
   - **Test Variants**: Alternative versions to test
4. For each variant, specify:
   - **Name**: Variant identifier
   - **Control Variant**: Check if this is the control
   - **Content Differences**: JSON object describing changes

Example content differences:
```json
{
  "title": "New Hero Title",
  "buttonText": "Get Started Now",
  "buttonColor": "#FF5733"
}
```

### Running an Experiment

1. Ensure you have at least one control variant and one test variant
2. Click "Start" on the experiment card
3. The experiment status changes to "running"
4. Traffic is automatically split based on the configured percentage
5. Conversions are tracked based on the goal type

### Viewing Results

1. Click "Results" on a running experiment
2. View metrics:
   - Total visitors and conversions
   - Conversion rate per variant
   - Improvement percentage vs control
   - Statistical significance indicators
3. Compare variant performance with visual charts

### Experiment Status

- **Draft**: Experiment is being set up, variants can be added
- **Running**: Experiment is active, collecting data
- **Paused**: Experiment is temporarily stopped
- **Completed**: Experiment has ended, results are final

## Components

### ExperimentForm

Form component for creating new A/B test experiments.

**Props:**
- `siteId`: Portfolio site ID
- `pages`: Array of available pages
- `blocks`: Array of available blocks
- `onCreate`: Callback when experiment is created

### VariantManager

Component for managing variants within an experiment.

**Props:**
- `experimentId`: Experiment ID to manage variants for

**Features:**
- Create new variants
- Edit existing variants
- Delete variants (except control)
- View variant statistics (visitors, conversions, conversion rate)

### ExperimentResults

Component for visualizing experiment results and performance metrics.

**Props:**
- `experimentId`: Experiment ID to show results for

**Features:**
- Summary metrics (total visitors, conversions, overall rate)
- Variant comparison with improvement percentages
- Visual charts for visitors and conversions
- Statistical significance warnings

## API Integration

The A/B testing system uses the Supabase client directly for data operations:

```typescript
// Create experiment
const { data, error } = await supabase
  .from('ab_experiments')
  .insert({ ...experimentData })
  .select()
  .single();

// Get variants
const { data, error } = await supabase
  .from('ab_variants')
  .select('*')
  .eq('experiment_id', experimentId);

// Update variant stats (typically done by tracking system)
const { error } = await supabase
  .from('ab_variants')
  .update({ visitors: newCount, conversions: newCount })
  .eq('id', variantId);
```

## Tracking Integration

To track A/B test performance, you need to:

1. **Assign Variants**: When a visitor arrives, assign them to a variant based on the traffic split
2. **Track Visitors**: Increment the `visitors` count for the assigned variant
3. **Track Conversions**: When a conversion goal is met, increment the `conversions` count

Example tracking logic:
```typescript
// Assign variant (deterministic based on visitor_id)
const variantIndex = hash(visitorId) % variants.length;
const assignedVariant = variants[variantIndex];

// Track visitor
await supabase
  .from('ab_variants')
  .update({ visitors: supabase.raw('visitors + 1') })
  .eq('id', assignedVariant.id);

// Track conversion
await supabase
  .from('ab_variants')
  .update({ conversions: supabase.raw('conversions + 1') })
  .eq('id', assignedVariant.id);
```

## Best Practices

1. **Sample Size**: Ensure sufficient traffic (recommended: 1,000+ visitors per variant) for statistical significance
2. **One Variable**: Test one change at a time for clear results
3. **Clear Goals**: Define specific, measurable conversion goals
4. **Run Duration**: Run experiments long enough to account for day-of-week effects
5. **Control Variant**: Always have a control variant to compare against
6. **Documentation**: Document what you're testing and why in the experiment description

## Future Enhancements

- Automatic variant assignment in public portfolio pages
- Real-time conversion tracking
- Statistical significance calculations (p-values, confidence intervals)
- Multi-variate testing support
- Experiment templates
- Automated winner selection
- Integration with analytics events table for detailed tracking
