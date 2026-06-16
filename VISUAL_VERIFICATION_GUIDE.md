# 📸 Visual Verification Guide - GuestsTabContent & InvitesTabContent Redesigns

**Date:** June 16, 2026  
**Event Details URL:** http://localhost:3000/dashboard/events/1  
**Status:** Ready for visual inspection in browser

---

## 🎯 Quick Verification Steps

1. **Open the event details page** at: http://localhost:3000/dashboard/events/1
2. **Click on "Guests" tab** to verify GuestsTabContent
3. **Click on "Send Invites" tab** to verify InvitesTabContent
4. **Use the checklists below** to verify each element

---

## ✅ Guests Tab - Visual Verification Checklist

### Section 1: "Add Individual Guest"
- [ ] **Header** has a `+` (Plus) icon before "Add Individual Guest"
- [ ] Background is **light slate** (pale gray)
- [ ] Has **rounded corners** with subtle border
- [ ] **Three input fields** present:
  - [ ] "Full Name *" (required field)
  - [ ] "Phone (optional)"
  - [ ] "Email (optional)"
- [ ] Input fields have:
  - [ ] Clean white background
  - [ ] Gray border that becomes **dark on focus**
  - [ ] Proper padding and spacing
- [ ] **"Add Guest" button** at bottom:
  - [ ] Dark slate background
  - [ ] White text
  - [ ] Lighter shade on hover
  - [ ] Full width
- [ ] **Capacity display** (if applicable):
  - [ ] Shows "Capacity: 10 / 50" format
  - [ ] Shows remaining spots in lighter gray text

### Section 2: "Bulk Import (CSV)"
- [ ] **Header** has an `↑` (Upload) icon
- [ ] Background is **light slate** with border
- [ ] **Instructions text** above file input:
  - [ ] Says "Upload a CSV file with columns: name, phone, email"
  - [ ] Code format is in a monospace box
- [ ] **File input** with custom styling:
  - [ ] Upload button has **dark slate background**
  - [ ] Filename shown in input
  - [ ] Proper spacing
- [ ] **Upload button**:
  - [ ] Standard button styling
  - [ ] Disabled when no file selected
  - [ ] Shows loading spinner when uploading
- [ ] **Success message** displays in **green/emerald** text after upload

### Section 3: "Guest List"
- [ ] **Header** has a `👥` (Users) icon
- [ ] Shows total guest count: "Guest List (X)"

#### Empty State (if no guests):
- [ ] Dashed border box
- [ ] Centered placeholder text
- [ ] Light gray background

#### When Guests Exist:
- [ ] **Search & Filter bar** at top:
  - [ ] Search input field with placeholder "Search guests..."
  - [ ] Dropdown for "All RSVP / Accepted / Declined / Pending"
  - [ ] "Clear" button appears when filters active
  - [ ] All with proper spacing and styling

- [ ] **Guest cards** displaying guests:
  - [ ] Card has **white background** with subtle border
  - [ ] Card has **shadow on hover** effect
  - [ ] Shows **guest name** in bold
  - [ ] Shows **contact info** (email or phone) below name in smaller text
  - [ ] **RSVP status badge**:
    - [ ] "accepted" = **emerald green background** (✓)
    - [ ] "declined" = **red background** (✗)
    - [ ] "pending" = **amber/yellow background** (⏳)
  - [ ] Additional status badges (if applicable):
    - [ ] "Invited" badge
    - [ ] View count "X/3" (attempt counter)
    - [ ] "Viewed" badge
  - [ ] **Action buttons** on the right:
    - [ ] **Mail icon** - send individual invite
    - [ ] **Zap icon** - generate QR code (spinner when loading)
    - [ ] **Pencil icon** - edit guest
    - [ ] **Trash icon** - delete guest (red on hover)
  - [ ] Buttons are small, icon-only, with proper spacing

- [ ] **Pagination** at bottom (if multiple pages):
  - [ ] First page (`|<`) button
  - [ ] Previous (`<`) button
  - [ ] Page number buttons (1, 2, 3, etc.)
    - [ ] Current page has **dark slate background** and white text
    - [ ] Other pages have light border
  - [ ] Next (`>`) button
  - [ ] Last page (`>|`) button

---

## ✅ Invites/Send Invites Tab - Visual Verification Checklist

### Main Section: "Send Invitations"
- [ ] **Header** has a `✉️` (Send/Mail) icon before "Send Invitations"
- [ ] Background is **light slate** with border and padding

#### Channel Selection:
- [ ] **Label** says "Delivery Channels" or similar
- [ ] **Three channel buttons**:
  - [ ] "Email"
  - [ ] "WhatsApp"  
  - [ ] "SMS"
- [ ] **Button styling**:
  - [ ] Inactive = white background with gray border
  - [ ] **Active = dark slate background with white text**
  - [ ] Custom checkbox inside each button
  - [ ] Multiple channels can be selected at once

#### Cost Estimate (appears when channels selected):
- [ ] **Card** showing pricing breakdown:
  - [ ] Title "Cost Estimate"
  - [ ] List of selected channels with prices:
    - [ ] "email: NGN 100,000" (example)
    - [ ] "whatsapp: NGN 200,000" (example)
  - [ ] **Total line** at bottom with bold text
  - [ ] Proper currency formatting with commas

#### Info Alerts:
- [ ] **Blue info alert** with:
  - [ ] 💡 (Lightbulb) icon
  - [ ] Blue background and blue text
  - [ ] Text: "Sends to eligible guests through all selected channels..."
  
- [ ] **Amber warning alert** (if there are validation issues):
  - [ ] ⚠️ (Alert triangle) icon
  - [ ] Amber/yellow background
  - [ ] Warning text about invalid phone numbers or missing contacts

#### Action Buttons:
- [ ] **"Send Invites"** button (primary):
  - [ ] Dark slate background
  - [ ] White text
  - [ ] `✉️` icon before text
  - [ ] Loading spinner when sending
  - [ ] Disabled when no channels selected
  
- [ ] **"Resend All"** button (secondary):
  - [ ] Border style with gray border
  - [ ] Proper spacing from other buttons
  
- [ ] **"Send All QR Codes"** button:
  - [ ] Border style
  - [ ] Proper spacing
  
- [ ] **"Test Send"** button:
  - [ ] Border style
  - [ ] For testing functionality

#### Success/Error Messages:
- [ ] **Success message** (when invites sent):
  - [ ] ✅ (Checkmark) icon
  - [ ] **Emerald/green background**
  - [ ] Text: "Success! Sent X of Y invitations via [channel]"
  
- [ ] **Error message** (if failure):
  - [ ] ⚠️ (Alert) icon
  - [ ] **Red background**
  - [ ] Error details displayed

### Delivery History Section:
- [ ] **Header** with ✓ (Checkmark) icon: "Delivery History"
- [ ] **Log entries** showing past send attempts:
  - [ ] Channel name (Email, WhatsApp, SMS)
  - [ ] Total sent count
  - [ ] **Status badge**:
    - [ ] "Complete" = ✓ (Checkmark) icon with **emerald green**
    - [ ] "In Progress" = ⏳ (Spinning loader) with **amber yellow**
    - [ ] "Failed" = ⚠️ (Alert) icon with **red**

---

## 🎨 Overall Design Verification

### Color Scheme Check:
- [ ] **Primary dark color**: Dark slate/gray (`#1e293b` or similar)
- [ ] **Light backgrounds**: Very light slate/gray (`#f1f5f9` or similar)
- [ ] **Borders**: Medium gray (`#cbd5e1` or similar)
- [ ] **Success green**: Emerald/teal colors
- [ ] **Warning yellow**: Amber/orange colors
- [ ] **Error red**: Red colors
- [ ] **Info blue**: Blue colors

### Typography Check:
- [ ] **Headers** (section titles): Bold, larger text, dark color
- [ ] **Labels**: Regular weight, slightly lighter color
- [ ] **Body text**: Regular weight, medium gray color
- [ ] **Small text** (helper text, badges): Smaller font size

### Spacing & Layout Check:
- [ ] **Consistent padding** inside cards/boxes
- [ ] **Proper gaps** between elements
- [ ] **Clean alignment** of form fields
- [ ] **Responsive** on different screen sizes
- [ ] **No overlapping** elements
- [ ] **Proper indentation** and hierarchy

### Icon Check:
- [ ] **All icons are from Lucide React** (professional, consistent style)
- [ ] **Icons are properly sized** (not too big, not too small)
- [ ] **Icons have proper color** (match surrounding text or default)
- [ ] **Icons are aligned** properly with text
- [ ] **Icons visible** and clear

### Interaction States Check:
- [ ] **Hover effects** on buttons and links (color change, shadow)
- [ ] **Focus states** on inputs (blue ring or border highlight)
- [ ] **Active/pressed states** on toggle buttons (darker background)
- [ ] **Disabled states** (reduced opacity, no pointer)
- [ ] **Loading states** (spinner animation)

---

## 📊 Summary of Expected Features

### Guests Tab Features:
✓ Add individual guests one by one  
✓ Bulk import guests from CSV  
✓ Search guests by name  
✓ Filter by RSVP status  
✓ View guest details and contact info  
✓ See RSVP status at a glance (badges with colors)  
✓ Track invite status (invited, viewed, attempts)  
✓ Send individual invites  
✓ Generate QR codes per guest  
✓ Edit guest information  
✓ Delete guests  
✓ Paginate through large guest lists  

### Invites Tab Features:
✓ Select delivery channels (Email, WhatsApp, SMS)  
✓ See cost estimate for each channel  
✓ Validate guest contact info before sending  
✓ Show warnings about invalid contacts  
✓ Send invitations in bulk  
✓ Resend to specific guests  
✓ Send QR codes  
✓ Test send functionality  
✓ View delivery history  
✓ Track send status (complete, in progress, failed)  

---

## ✅ Final Verification Checklist

After reviewing the Guests and Invites tabs, check off:

- [ ] All icons are **lucide-react style** (professional, consistent)
- [ ] Colors follow **slate, emerald, amber, red, blue** palette
- [ ] Forms have **proper focus states** (ring around inputs)
- [ ] Buttons have **hover effects** (color/shade changes)
- [ ] Guest cards show **status badges** with appropriate colors
- [ ] Layout is **clean with proper spacing**
- [ ] No **overlapping or misaligned** elements
- [ ] All **text is readable** with proper contrast
- [ ] **Search and filters work** as expected
- [ ] **Pagination** displays correctly
- [ ] **Action buttons** have proper icons
- [ ] **Alert messages** display with icons and colors

---

## 📝 Notes for Review

- The redesigns maintain consistency with the sidebar design throughout the application
- All components use the professional slate color scheme with accent colors (emerald, amber, red, blue)
- Lucide React icons are used consistently for a professional appearance
- Form inputs have proper focus states with ring indicators
- Badges and status indicators use color coding for quick visual recognition
- The layout is responsive and adapts to different screen sizes

---

**Status: Ready for Visual Inspection** ✅  
**Date: June 16, 2026**  
**Location: http://localhost:3000/dashboard/events/1**
