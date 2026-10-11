# Foundlily REST API Documentation

Base URL: `http://localhost:3000/api`

---

## 1. Authentication Endpoints

### Register User
- **Method:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "Sarah Chen",
    "email": "sarah@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "...",
    "user": {
      "_id": "u-...",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "role": "user",
      "avatar": "https://api.dicebear.com/..."
    }
  }
  ```
- **Cookie:** Sets secure HTTP-only `token` cookie.

### Login User
- **Method:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "sarah@example.com",
    "password": "securepassword123"
  }
  ```

### Logout User
- **Method:** `POST /api/auth/logout`
- **Clears:** Auth token cookie.

### Current User Session
- **Method:** `GET /api/auth/session`
- **Headers:** `Authorization: Bearer <token>` or Cookie

---

## 2. Startup Profiles

### Explore / Filter Profiles
- **Method:** `GET /api/profiles`
- **Query Params:**
  - `category`: Filter by category ID (e.g. `cat-ai`)
  - `country`: Filter by country ID (e.g. `reg-us`)
  - `state`: Filter by state ID
  - `stage`: Filter by stage (`Seed`, `Series A`, etc.)
  - `q`: Search query across name, founder, description, product
  - `sort`: `trending` | `recent` | `followers` | `views`
  - `page`: Page number (default: 1)
  - `limit`: Limit per page (default: 20)
- **Response:**
  ```json
  {
    "profiles": [...],
    "total": 6,
    "page": 1,
    "pages": 1
  }
  ```

### Trending Profiles Leaderboard
- **Method:** `GET /api/trending`
- **Ranking Formula:**
  $$\text{Trending Score} = (\text{Views} \times 0.20) + (\text{Followers} \times 0.25) + (\text{Saves} \times 0.15) + (\text{Engagement} \times 0.20) + (\text{Recent Activity} \times 0.20)$$

### Public SEO Profile
- **Method:** `GET /api/public/profiles/:slug`
- Increments view count, records analytics view event, and recalculates dynamic trending score.

### Create Profile
- **Method:** `POST /api/profiles` (Requires Authentication)
- **Status:** Automatically sets to `PENDING` (or `APPROVED` if created by Admin).

### Edit Profile
- **Method:** `PATCH /api/profiles/:id` (Requires Owner or Admin)

### Delete Profile
- **Method:** `DELETE /api/profiles/:id` (Requires Owner or Admin)

---

## 3. Social & Analytics

### Follow / Unfollow
- **Method:** `POST /api/profiles/:id/follow`
- **Method:** `DELETE /api/profiles/:id/follow`

### Save / Unsave
- **Method:** `POST /api/profiles/:id/save`
- **Method:** `DELETE /api/profiles/:id/save`

### Analytics Event
- **Method:** `POST /api/analytics/event`
- **Body:** `{ "profileId": "...", "eventType": "view" | "click" | "save" | "follow" | "share" }`

### Owner Profile Analytics
- **Method:** `GET /api/analytics/profile/:id`

---

## 4. Admin Management

- `GET /api/admin/dashboard` - Global platform statistics.
- `GET /api/admin/profiles/pending` - Review queue for pending profiles.
- `PATCH /api/admin/profiles/:id/approve` - Approve profile for public visibility.
- `PATCH /api/admin/profiles/:id/reject` - Reject profile.
- `PATCH /api/admin/profiles/:id/feature` - Toggle featured spotlight badge.
- `DELETE /api/admin/profiles/:id` - Delete profile.

---

## 5. AI Advisor

- `POST /api/ai/pitch-review` - AI VC analysis and score recommendation powered by Gemini 2.5 Flash.
