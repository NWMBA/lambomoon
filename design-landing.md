# Landing Page Design - LamboMoon.io

## Overview
- **Purpose**: Public landing page to attract users, showcase trending projects, drive signups
- **Target**: Crypto natives + newcomers looking for gem discoveries

---

## Page Sections (top to bottom)

### 1. Navigation Bar (sticky)
```
[LamboMoon Logo]        [Discover] [Submit]        [Sign In] [Get Started]
```

- **Logo**: Custom SVG from `lambomoon/logo.svg` (Lambo flying by moon)
- Left: Discover (browse), Submit (submit project - auth only)
- Right: Sign In, Get Started (CTA - prominent)

---

### 2. Hero Section
```
              Find the next 100x
            before the crowd 🐂

      Curated crypto discoveries with real data
      ─────────────────────────────────────
          [🔍 Start Discovering]   [Connect Wallet]

      ✦ 500+ Projects Tracked   ✦ 2.3M Votes Cast   ✦ 150+ Daily Submissions
```

- **Headline**: Big, bold
- **Sub**: Value prop
- **CTAs**: Primary "Start Discovering", secondary "Connect Wallet"
- **Social proof**: Stats bar below

---

### 3. Trending Projects (logged-out view)
```
      Trending Now 🔥

  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │  🟢 TAO │  │  🔵 HYPE │  │ 🟣 ETHFI│
  │ Bittensor│  │Hyperliquid│ │Ether.fi │
  │  $280   │  │  $18.50  │  │ $2.40   │
  │ +5.2%   │  │ +12.1%   │  │ +3.8%   │
  │  AI     │  │  DeFi    │  │ LSD     │
  │   ★★★☆☆ │  │  ★★★★☆   │  │ ★★★☆☆   │
  └─────────┘  └─────────┘  └─────────┘

        [View All Trending →]
```

- 3-6 project cards
- Show: logo, name, price, 24h change, category, curation score
- Card click → project detail page (if logged out, prompt to sign up)
- "View All" link

---

### 4. Category Browsers
```
      Explore by Category

  [🤖 AI Agents] [⛓️ L1/L2] [🎮 Gaming/NFT] [💰 DeFi] [🪙 RWA] [🐕 Memecoins]
```

- Horizontal scrollable pills
- Click → filtered discover page

---

### 5. Recently Added (with countdown)
```
      Fresh Drops 🚀

  ┌────────────────┐
  │  Project X     │
  │  Launching in  │
  │    2d 14h      │
  └────────────────┘
```

- Projects launching soon
- Countdown timers

---

### 6. How It Works
```
      Discover → Vote → Track

    ① Browse curated     ② Upvote gems     ③ Set alerts
       projects           you love         & track
```

3 simple steps, icons + short text

---

### 7. Footer
```
[About] [Terms] [Privacy] [Contact]
       © 2026 LamboMoon
```

---

### 🐄 Easter Egg (Secret Audio)
```
┌─────────────────────────────────────────┐
│  🎵 Click anywhere to play             │
│                                          │
│   [Lambomoon Song - Nathan's IMT]       │
│   ▶️ 3:42                                │
│                                          │
│            ✕ (close)                    │
└─────────────────────────────────────────┘
```

- Hidden 🐄 symbol in bottom-right corner
- Click → plays `LamboMoon-IMT.mp3` in a modal
- Subtle, not intrusive

---

## Visual Style

### Colors
- **Background**: #0a0a0f (deep dark)
- **Card bg**: #12121a
- **Primary accent**: #22c55e (green - gains)
- **Secondary accent**: #f59e0b (amber - attention)
- **Text**: #f4f4f5 (primary), #a1a1aa (secondary)
- **Borders**: #27272a

### Typography
- **Headlines**: Bold, large (48px+ hero)
- **Body**: Clean sans-serif (Inter or similar)

### Components
- Cards: Rounded (12px), subtle border, hover lift
- Buttons: Rounded, glow on hover
- Dark mode default

---

## Responsive
- Desktop: Full layout
- Tablet: 2-col grids
- Mobile: Single col, hamburger menu

---

## Next: Detail page design