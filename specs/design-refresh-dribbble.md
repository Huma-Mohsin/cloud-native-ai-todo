# Task Management App - Design Refresh

**Reference:** https://dribbble.com/shots/18468605-Task-Management-App

**Status:** Draft - Ready for implementation when session resets

**Date:** 2026-01-21

---

## Design Overview

This document captures the design elements from the Dribbble reference to be applied to the TaskFlow application.

## Color Palette

> **Action Required:** Extract exact color codes from the Dribbble design

### Primary Colors
- **Primary/Brand:** `#______` (update from design)
- **Primary Dark:** `#______`
- **Primary Light:** `#______`

### Secondary Colors
- **Secondary/Accent:** `#______` (update from design)
- **Secondary Dark:** `#______`
- **Secondary Light:** `#______`

### Neutral Colors
- **Background:** `#______`
- **Surface:** `#______`
- **Text Primary:** `#______`
- **Text Secondary:** `#______`
- **Border/Divider:** `#______`

### Status/State Colors
- **Success/Complete:** `#______`
- **Warning/In Progress:** `#______`
- **Error/Overdue:** `#______`
- **Info:** `#______`

---

## Typography

### Font Families
- **Primary Font:** (extract from design)
- **Secondary Font:** (if applicable)
- **Mono Font:** (for code/technical elements)

### Font Sizes
- **Heading 1:** __px
- **Heading 2:** __px
- **Heading 3:** __px
- **Body:** __px
- **Small/Caption:** __px

### Font Weights
- **Bold:** 600-700
- **Medium:** 500
- **Regular:** 400

---

## Layout & Spacing

### Spacing Scale
- **xs:** __px
- **sm:** __px
- **md:** __px
- **lg:** __px
- **xl:** __px

### Border Radius
- **Small:** __px
- **Medium:** __px
- **Large:** __px
- **Full:** 9999px (pills/circles)

### Shadows
- **Card:** (extract shadow values)
- **Hover:** (extract shadow values)
- **Modal:** (extract shadow values)

---

## UI Components to Implement

### Navigation
- [ ] Top navigation bar style
- [ ] Logo placement and styling
- [ ] User profile/avatar position
- [ ] Mobile menu design

### Task Cards
- [ ] Card layout and spacing
- [ ] Task status indicators
- [ ] Priority badges
- [ ] Due date display
- [ ] Hover/active states

### Buttons
- [ ] Primary button style
- [ ] Secondary button style
- [ ] Icon buttons
- [ ] Button sizes (sm, md, lg)
- [ ] Loading states

### Forms
- [ ] Input field styling
- [ ] Textarea styling
- [ ] Select/dropdown styling
- [ ] Checkbox/radio styling
- [ ] Form validation states

### Modals/Dialogs
- [ ] Modal backdrop
- [ ] Modal content container
- [ ] Modal header/footer
- [ ] Close button design

---

## Design Principles from Reference

### Visual Hierarchy
- (Describe how the design establishes hierarchy)

### Whitespace Usage
- (Note spacing patterns and breathing room)

### Iconography
- **Icon Set:** (identify icon library or style)
- **Icon Size:** __px
- **Icon Color:** (describe how icons are colored)

### Animations/Transitions
- (Note any micro-interactions or transitions visible)

---

## Implementation Plan

### Phase 1: Foundation (30 min)
1. Update color tokens in Tailwind config
2. Set up typography scale
3. Define spacing and border radius utilities

### Phase 2: Component Updates (1-2 hours)
1. Update existing TaskCard component
2. Refresh button styles
3. Update form inputs
4. Refresh navigation bar

### Phase 3: Layout Refinements (30 min)
1. Adjust page layouts
2. Update responsive breakpoints
3. Refine mobile experience

### Phase 4: Polish (30 min)
1. Add transitions and animations
2. Test all states (hover, active, disabled)
3. Cross-browser testing

---

## Files to Modify

### Configuration
- `phase-2-web-app/frontend/tailwind.config.ts` - Color palette, spacing, typography

### Components
- `phase-2-web-app/frontend/src/components/tasks/TaskCard.tsx` - Card styling
- `phase-2-web-app/frontend/src/components/tasks/TaskForm.tsx` - Form styling
- `phase-2-web-app/frontend/src/components/layout/Navbar.tsx` - Navigation styling
- `phase-2-web-app/frontend/src/app/globals.css` - Global styles

### Theme
- Consider creating: `phase-2-web-app/frontend/src/styles/theme.ts` - Centralized theme tokens

---

## Notes

- Session used: 97% (implementation deferred)
- Ensure accessibility (WCAG AA contrast ratios)
- Test with existing tasks and data
- Maintain dark mode support if applicable
- Keep mobile-first approach

---

## Next Steps (When Session Resets)

1. **Extract Design Values:**
   - Visit the Dribbble link
   - Use browser DevTools or color picker to extract exact colors
   - Note font families, sizes, and weights
   - Screenshot key components for reference

2. **Update This Document:**
   - Fill in all `#______` color placeholders
   - Complete typography values
   - Add spacing measurements
   - Note any specific design patterns

3. **Begin Implementation:**
   - Start with Phase 1 (Foundation)
   - Test incrementally
   - Commit changes in logical chunks

4. **Create PHR:**
   - Document the design refresh work
   - Link to this spec and the Dribbble reference
