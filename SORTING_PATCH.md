# Sorting Feature - Patch Notes

Status: In Progress

## Changes to make to page.tsx

### 1. Add Button import (if not exists)
```typescript
import { Button } from '@/components/ui/button'
```

### 2. Add sort state (after existing useState)
```typescript
const [sortBy, setSortBy] = useState('trending')
```

### 3. Add sort buttons UI (after search bar)
```tsx
<div className="flex gap-2 mb-6">
  <Button 
    variant={sortBy === 'trending' ? 'default' : 'outline'} 
    size="sm"
    onClick={() => setSortBy('trending')}
  >
    🔥 Trending
  </Button>
  <Button 
    variant={sortBy === 'newest' ? 'default' : 'outline'} 
    size="sm"
    onClick={() => setSortBy('newest')}
  >
    ✨ Newest
  </Button>
  <Button 
    variant={sortBy === 'top' ? 'default' : 'outline'} 
    size="sm"
    onClick={() => setSortBy('top')}
  >
    ⬆️ Top
  </Button>
</div>
```

### 4. Add sorting logic (before return JSX)
```typescript
const sortedProjects = [...projects].sort((a, b) => {
  if (sortBy === 'newest') return new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()
  if (sortBy === 'top') return b.upvotes - a.upvotes
  return b.change_24h - a.change_24h // trending
})
```

### 5. Change projects.map to sortedProjects.map