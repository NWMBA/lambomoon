# Trending Alpha Component Specification

## Overview
A React component for the LamboMoon homepage that displays trending crypto opportunities — high-upvote, newly launched, or rapidly rising crypto projects.

## Data Model

### Expected Database Table: `projects`

```sql
-- See: trending-alpha.sql for full query
```

| Field | Type | Description |
|-------|------|-------------|
| id | text | Unique identifier |
| name | text | Project name |
| symbol | text | Token symbol |
| category | text | Project category |
| description | text | Short description |
| price | numeric | Current price |
| change_24h | numeric | 24h price change % |
| market_cap | numeric | Market cap |
| launch_date | date | Launch date |
| upvotes | integer | Community upvotes |
| featured | boolean | Featured flag |

## UI/UX Specification

### Layout
- **Container**: Full-width section with max-width 1200px, centered
- **Grid**: 3-column on desktop, 2 on tablet, 1 on mobile
- **Gap**: 24px between cards

### Component Structure
```
TrendingAlpha
├── Header
│   ├── Title ("Trending Alpha 🔥")
│   └── Subtitle ("Top opportunities from the community")
├── Grid
│   └── AlphaCard (×6-8 items)
│       ├── Rank badge
│       ├── Project info (name, symbol, category)
│       ├── Price & change
│       ├── Quick stats (age, market cap)
│       └── Upvote button
└── View All link
```

### Card Design
- **Background**: `#1a1a2e` (dark navy)
- **Border**: 1px `#2d2d4a` on rest, `#ff6b35` (orange glow) on hover
- **Border-radius**: 12px
- **Padding**: 20px

**Card Elements:**
- **Rank badge**: Top-left, pill shape, `#ff6b35` background for top 3
- **Category tag**: Small pill, `#2d2d4a` background
- **Price**: Large, bold, white
- **Change**: Green (`#00d26a`) for positive, red (`#f44336`) for negative
- **Upvotes**: Heart icon + count

### Typography
- **Title**: 32px, bold, white
- **Card title**: 18px, semibold
- **Body**: 14px, regular, `#a0a0b8`
- **Price**: 20px, bold

### Responsive Breakpoints
- Desktop: ≥1024px — 3 columns
- Tablet: 768-1023px — 2 columns  
- Mobile: <768px — 1 column

### Interactions
- **Card hover**: Slight lift (translateY -4px), border glow
- **Upvote**: Heart fills red, count increments (optimistic UI)
- **View All**: Links to /trending

## Props Interface

```typescript
interface TrendingAlphaProps {
  limit?: number;        // Default: 6
  showViewAll?: boolean; // Default: true
}
```

## Data Fetching
- Use Supabase query from `trending-alpha.sql`
- Client-side fetch in useEffect or with React Query
- Show skeleton loaders while loading

## Acceptance Criteria
1. ✅ Displays 6 trending projects by default
2. ✅ Each card shows rank, name, symbol, category, price, 24h change, upvotes
3. ✅ Positive changes green, negative red
4. ✅ Responsive 3/2/1 column layout
5. ✅ Hover effects on cards
6. ✅ Loading skeleton state
7. ✅ Error state with retry button