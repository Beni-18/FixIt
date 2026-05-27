# FixIT — Startup Guide

## Quick Start

### Terminal 1 — Rails API (port 3002)
```bash
cd /Users/bennish/projects/FixIt/backend
eval "$(rbenv init -)"
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
bundle exec rails server -p 3002
```

### Terminal 2 — React Frontend (port 5173)
```bash
cd /Users/bennish/projects/FixIt/frontend
npm run dev
```

Open: http://localhost:5173

---

## Seed Login Credentials

| Role    | Email                                      | Password    |
|---------|--------------------------------------------|-------------|
| Admin   | admin@rathinam.edu.in                      | Admin@123   |
| Student | arjun@student.rathinam.edu.in              | Student@123 |
| Staff   | ravi@rathinam.edu.in                       | Staff@123   |

---

## Project Structure

```
FixIT/
├── backend/           Rails 7 API
│   ├── app/
│   │   ├── controllers/api/v1/   Thin controllers
│   │   │   └── admin/            Admin-only routes
│   │   ├── models/               Fat models with scopes
│   │   ├── services/             Business logic
│   │   │   ├── auth/
│   │   │   ├── issues/
│   │   │   ├── upvotes/
│   │   │   └── admin/
│   │   ├── blueprints/           JSON serializers
│   │   └── policies/             Pundit auth policies
│   └── db/
│       ├── migrate/              8 migrations
│       └── seeds.rb              Dev seed data
└── frontend/          React + Vite + Tailwind
    └── src/
        ├── pages/                Landing, Home, RaiseComplaint, Profile
        │   └── admin/            Dashboard, AdminIssues, AdminUsers
        ├── components/
        │   ├── issues/           StickyNoteCard, IssueBoard, IssueDetailPanel
        │   ├── layout/           Navbar, AdminSidebar
        │   ├── chat/             ChatBot (stub, ready for AI integration)
        │   └── ui/               Button, Input, Badge
        ├── api/                  axios.js, auth.js, issues.js, admin.js
        └── store/                authStore.js (Zustand)
```

---

## Key Features

- **Sticky note board** — complaints sorted by upvote count, colour-coded by status
- **Status flow**: Raised → Processed → Being Resolved → Resolved (admin only)
- **Camera access** — mobile camera supported on complaint form & ID verification
- **Chatbot** — floating button wired to `/api/v1/chat`, stub response ready for AI
- **Admin panel** — dashboard stats, issue management, user verification
- **Pagination** — will_paginate on all list endpoints
- **JWT auth** — devise-jwt, 24h token expiry
- **Pundit policies** — students cannot access admin routes

---

## Chatbot Integration (when ready)

Open `backend/app/controllers/api/v1/chat_controller.rb` and replace the stub:
```ruby
bot_reply = "Thanks for your message! ..."
```
with your AI provider call (Claude, OpenAI, etc.)

---

## PostgreSQL Details
- Host: localhost:5432
- Dev DB: fixit_development
- User: bennish
