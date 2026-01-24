# How to Use Your Portfolio System

## Step-by-Step Guide

### 1. **Create Your Portfolio Site**

1. Go to **Portfolio** in the left sidebar (Globe icon 🌐)
2. You'll see: "You don't have a portfolio site yet. Create one to get started!"
3. Click **"Create Site"** button
4. Fill out the form:
   - **Site Name**: e.g., "My Portfolio"
   - **Subdomain**: e.g., "myportfolio" (will be `myportfolio.yourdomain.com`)
   - **Template** (optional): Choose Developer, Artist, or other templates
5. Click **"Create Site"**

### 2. **View Your Site Overview**

After creating a site, you'll see:

- **Site Name** (large heading)
- **Site URL** with Globe icon
- **Published/Draft** badge
- **"Settings"** and **"View Site"** buttons
- **Pages Section** showing all your pages
- **"New Page"** button

### 3. **Edit a Page**

1. In the **Pages** section, find the page you want to edit
2. Click **"Edit"** button on the page card
3. This opens the **Visual Editor** at `/portfolio/editor/[pageId]`

### 4. **Create a New Page**

1. Click **"New Page"** button in the Pages section
2. Enter:
   - **Page Title**: e.g., "About Me"
   - **URL Slug**: e.g., "about-me" (will be `yoursite.com/about-me`)
3. Click **"Create Page"**
4. You'll be taken to the editor automatically

### 5. **Using the Visual Editor**

The editor has:

- **Left Sidebar**: Pages, Blocks, Styles panels
- **Center Canvas**: Your page content (drag and drop blocks)
- **Right Sidebar**: Block settings when a block is selected
- **Top Toolbar**: Save, Publish, Preview modes

### 6. **Add Blocks to Your Page**

1. Click **"+"** button between blocks or at the top/bottom
2. Choose a block type:
   - Hero
   - Text
   - Image
   - Gallery
   - Projects
   - Skills
   - Stats
   - etc.
3. The block appears on your page
4. Click the block to edit its content and settings

### 7. **View Your Public Site**

1. Click **"View Site"** button in the site overview
2. Or click **"View"** on any page card
3. This opens your public portfolio site in a new tab

## Troubleshooting

### "I don't see my site overview"

1. **Check if you created a site**: Look for "Create Site" button
2. **After creating**: The page should refresh automatically
3. **If it doesn't refresh**: Manually refresh the page (F5 or Cmd+R)
4. **Check browser console**: Open DevTools (F12) for errors

### "I don't see the editor"

1. **Make sure you have a site**: Create one first
2. **Make sure you have pages**: A default "Home" page should be created automatically
3. **Click "Edit"** on a page card to open the editor
4. **URL should be**: `/[locale]/portfolio/editor/[pageId]`

### "I can't create a site"

1. **Check browser console** for errors
2. **Check network tab** for failed API calls
3. **Verify you're logged in**
4. **Check subdomain**: Must be 3+ characters, lowercase, letters/numbers/hyphens only

## Quick Links

- **Portfolio Overview**: `/[locale]/portfolio`
- **Editor**: `/[locale]/portfolio/editor/[pageId]`
- **Debug Page**: `/[locale]/portfolio/debug` (shows site status)

## What You Should See

### After Creating a Site:
✅ Site name and URL  
✅ Pages list (at least "Home" page)  
✅ "Edit" and "View" buttons on each page  
✅ "New Page" button  

### In the Editor:
✅ Left sidebar with panels  
✅ Center canvas with your blocks  
✅ Right sidebar with block settings  
✅ Top toolbar with save/publish buttons  

If you don't see these, check the browser console for errors!
