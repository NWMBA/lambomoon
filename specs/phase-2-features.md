# LamboMoon Phase 2 Features Specification

## Overview
Adding user accounts, community engagement (upvotes/comments) to the crypto discovery platform.

---

## 1. User Profiles

### Database Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_created ON profiles(created_at DESC);
```

### Profile Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | FK to auth.users |
| username | TEXT | Yes | Unique handle (@username) |
| display_name | TEXT | No | Display name (real name) |
| avatar_url | TEXT | No | Profile picture URL |
| bio | TEXT | No | Short bio |
| wallet_address | TEXT | No | Connected wallet |
| created_at | TIMESTAMPTZ | Auto | Signup timestamp |
| updated_at | TIMESTAMPTZ | Auto | Last update |

### UI Components
- **ProfileCard**: Compact user preview (avatar, name, username)
- **ProfilePage**: Full profile with activity feed
- **ProfileEditModal**: Edit profile form
- **AvatarUpload**: Image upload with crop

---

## 2. Upvote System

### Database Schema

```sql
-- Projects table (extends seedProjects)
ALTER TABLE projects ADD COLUMN upvote_count INTEGER DEFAULT 0;

-- Upvotes table (one per user per project)
CREATE TABLE upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL, -- CoinGecko coin ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Upvotes indexes
CREATE INDEX idx_upvotes_user ON upvotes(user_id);
CREATE INDEX idx_upvotes_project ON upvotes(project_id);
```

### Upvote Rules
- **One upvote per user per project** (enforced by UNIQUE constraint)
- Toggle behavior: click to upvote, click again to remove
- Real-time count updates via Supabase Realtime

### API Endpoints

```typescript
// POST /api/upvotes
// Body: { projectId: string }
// Response: { success: boolean, upvoted: boolean, count: number }

// GET /api/upvotes?projectId=bitcoin
// Response: { count: number, userUpvoted: boolean }

// GET /api/users/[id]/upvotes
// Response: { projects: Project[] }
```

### UI Components
- **UpvoteButton**: Animated upvote with count
  - States: default, hovered, upvoted, loading
  - Animation: bounce + particle effect on click
- **UpvoteCount**: Display with K/M formatting
- **UpvoteList**: Users who upvoted (hover card)

---

## 3. Comments System

### Database Schema

```sql
-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL, -- CoinGecko coin ID
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Comments indexes
CREATE INDEX idx_comments_project ON comments(project_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

### Comment Structure
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Comment author |
| project_id | TEXT | CoinGecko coin ID |
| parent_id | UUID | Reply-to comment (nullable) |
| content | TEXT | Comment text (max 2000 chars) |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last edit |
| deleted_at | TIMESTAMPTZ | Soft delete marker |

### API Endpoints

```typescript
// GET /api/comments?projectId=bitcoin&limit=20&offset=0
// Response: { comments: CommentWithUser[], hasMore: boolean }

// POST /api/comments
// Body: { projectId: string, content: string, parentId?: string }
// Response: { comment: Comment }

// PATCH /api/comments/[id]
// Body: { content: string }
// Response: { success: boolean }

// DELETE /api/comments/[id]
// Response: { success: boolean }
```

### UI Components
- **CommentList**: Paginated comments with load more
- **CommentItem**: Single comment with replies
- **CommentForm**: Textarea with markdown preview
- **CommentThread**: Nested replies (max 2 levels)
- **CommentActions**: Edit, delete, reply buttons

---

## Summary: Files to Create/Modify

### New Files
- `web/src/components/user/ProfileCard.tsx`
- `web/src/components/user/ProfileEditModal.tsx`
- `web/src/components/social/UpvoteButton.tsx`
- `web/src/components/social/CommentList.tsx`
- `web/src/components/social/CommentForm.tsx`
- `web/src/app/profile/[username]/page.tsx`
- `web/src/app/api/upvotes/route.ts`
- `web/src/app/api/comments/route.ts`
- `web/src/app/api/profile/route.ts`

### Modified Files
- `web/src/lib/supabase.ts` - Add auth helpers
- `web/src/app/project/[id]/page.tsx` - Add upvotes & comments
- `web/src/app/page.tsx` - Add upvote buttons to cards

### Database
- Run migration: `specs/supabase/migrations/001_phase2.sql`