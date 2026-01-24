# Portfolio Navigation Guide

## Where to Find Your Portfolio Site Overview

### 1. **In the Sidebar (Left Side)**
   - Look for the **"Portfolio"** menu item with a **Globe icon** 🌐
   - It's located in the left sidebar navigation
   - Click on it to navigate to `/portfolio`

### 2. **In the Main Content Area (Right Side)**
   - After clicking "Portfolio" in the sidebar, the site overview appears in the **main content area** (the large area on the right)
   - This is NOT in the sidebar or top nav
   - It appears in the same area where Dashboard, Projects, CRM, etc. appear

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  TopNav (Header)                                 │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Main Content Area                  │
│          │  (This is where Portfolio           │
│ Portfolio│   overview appears)                  │
│ Projects │                                      │
│ CRM      │                                      │
│ ...      │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

## What You Should See

When you click "Portfolio" in the sidebar, you should see in the main content area:

1. **If you have a site:**
   - Site name (large heading)
   - Site URL with Globe icon
   - Published/Draft badge
   - "Settings" and "View Site" buttons
   - List of pages with Edit/View buttons
   - "New Page" button

2. **If you don't have a site:**
   - "Portfolio" heading
   - Message: "You don't have a portfolio site yet. Create one to get started!"
   - "Create Site" button

## Troubleshooting

If you don't see the portfolio overview:

1. **Check the URL**: Should be `/[locale]/portfolio` (e.g., `/en/portfolio` or `/et/portfolio`)
2. **Check the sidebar**: Make sure you clicked "Portfolio" (Globe icon)
3. **Check browser console**: Open DevTools (F12) and look for errors
4. **Check if you're logged in**: You need to be authenticated to see the portfolio

## Quick Test

1. Look at the left sidebar
2. Find "Portfolio" (with Globe icon 🌐)
3. Click it
4. Look at the main content area (right side)
5. You should see your portfolio site overview there
