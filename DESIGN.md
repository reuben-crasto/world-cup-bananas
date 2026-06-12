# World Cup Bananas - Design & Component Reference

## Site Overview

A FIFA 2026 World Cup prediction game where users sign up, predict group stage match scores, and earn points based on accuracy. Built with vanilla HTML/CSS/JS and an Express + SQLite backend.

---

## Pages

### 1. Login Page (`login.html`)

**Purpose:** Authentication — sign in or create a new account.

| Component | Type | Description |
|---|---|---|
| **Auth Card** | Container | Centered white card (`max-width: 420px`) on a dark gradient background |
| **Auth Header** | Text block | Title "Prediction Platform" + subtitle |
| **Auth Switch** | Tab toggle | Two buttons (Sign In / Sign Up) with pill-style active state |
| **Sign In Form** | Form | Email + Password fields, Sign In button |
| **Sign Up Form** | Form (hidden by default) | Full Name + Email + Password fields, Sign Up button |
| **Auth Message** | Inline alert | Red error / green success text below the form |
| **Primary Button** | Button | Full-width blue submit button |
| **Form Group** | Input wrapper | Label + text input with focus ring |

**JS:** `js/auth.js` — handles tab switching, form submission via `POST /api/signup` and `POST /api/signin`, stores session in `localStorage`, redirects to `index.html`.

---

### 2. Welcome / Home Page (`index.html`)

**Purpose:** Landing page after login — explains the game rules and points system.

| Component | Type | Description |
|---|---|---|
| **Welcome Card** | Container | Cream/yellow card (`max-width: 980px`) with dashed border accents |
| **Welcome Header** | Header block | "World Cup Bananas" title + trophy icon badge + user greeting |
| **Title Row** | Flex row | Title text left, circular trophy emoji icon right |
| **Trophy Icon** | Badge | 86px circle with trophy emoji, yellow ring |
| **User Greeting** | Dynamic text | "Welcome, {name}!" populated from localStorage |
| **Intro Section** | Content block | "About the Platform" with banana-emoji bullet list |
| **Banana List** | List | Vertical list with emoji prefix per item |
| **Rules Section** | Content block | "How Brackets Can Be Filled" with 2x2 info grid |
| **Info Box** | Card | White card with yellow border — numbered step with description |
| **Info Grid** | Layout | 2-column grid of Info Box cards (stacks to 1 col on mobile) |
| **Points Section** | Content block | "Points System" with three scoring cards (Group, Knockout, Bonus) |
| **Points Card** | Card | White card with amber left border — scoring rules as bullet list |
| **Action Section** | Button group | "Go to Group Stage" (amber) + "Logout" (red tint) buttons |
| **Start Button** | Link button | Amber CTA linking to `group_stage.html` |
| **Logout Button** | Button | Clears localStorage and redirects to login |

**JS:** `js/index.js` — auth guard (redirects to login if not logged in), sets greeting text, logout handler.

---

### 3. Group Stage Predictions (`group_stage.html`)

**Purpose:** Core gameplay — enter predicted scores for all 72 group stage matches across 12 groups.

| Component | Type | Description |
|---|---|---|
| **Page Header** | Sticky nav | Logo link (banana emoji + "World Cup Bananas") + autofill dropdown |
| **Logo** | Link | Banana emoji + site name, links to home |
| **Autofill Select** | Dropdown | Options: FIFA Ranking Favorites, Balanced, Random, Clear All |
| **Page Title** | Heading block | "Group Stage Predictions" + helper text |
| **Groups Container** | Layout | Vertical stack of 12 Group Cards |
| **Group Card** | Card | White rounded card for one group (A–L) |
| **Group Card Header** | Header row | Group name (e.g. "Group A") + "Top 2 + best 3rd-place teams advance" badge |
| **Advancement Badge** | Pill | Yellow pill label in the group header |
| **Group Content** | Grid layout | 2-column grid — matches panel left, standings table right |
| **Matches Panel** | List | 6 match rows per group |
| **Match Row** | Row component | Date + Home team + score input + score input + Away team |
| **Match Date** | Label | Small gray date text (e.g. "Jun 11") |
| **Team Name** | Label | Bold team name, right-aligned (home) or left-aligned (away) |
| **Score Input** | Number input | 54px wide, centered, amber focus ring |
| **Table Panel** | Container | Scrollable standings table |
| **Standings Table** | Data table | Columns: Team, P, W, D, L, GF, GA, GD, Pts |
| **Table Header** | Row | Dark navy background with white text |
| **Qualifying Row** | Row highlight | Top 2 rows have green background + checkmark prefix |
| **Points Cell** | Cell | Extra bold points column |
| **Bottom Actions** | Button group | "Save Predictions" (amber) + "Back to Welcome" (gray) buttons |
| **Save Button** | Button | Saves all predictions to localStorage |
| **Secondary Button** | Link button | Gray link back to `index.html` |

**JS:** `js/group_stage.js` — auth guard, renders 12 groups with 6 matches each, real-time standings calculation on score input, autofill strategies (FIFA ranking, balanced, random), localStorage persistence.

---

## Backend Components

### Express Server (`server.js`)

| Component | Description |
|---|---|
| **Static file server** | Serves all frontend files from project root |
| **SQLite Database** | `data/app.db` — single `users` table |
| **`GET /`** | Serves `login.html` |
| **`POST /api/signup`** | Creates user with bcrypt-hashed password, returns user object |
| **`POST /api/signin`** | Validates credentials, returns user object |

### Database Schema

```
users
├── id              INTEGER PRIMARY KEY AUTOINCREMENT
├── full_name       TEXT NOT NULL
├── email           TEXT NOT NULL UNIQUE
├── password_hash   TEXT NOT NULL
└── created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## Shared Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary Blue | `#2563eb` | Login buttons, focus rings |
| Amber/Gold | `#f59e0b` | CTA buttons, focus rings, accents |
| Dark Navy | `#0f172a` | Login background, table headers |
| Deep Red | `#7c2d12` / `#7f1d1d` | Group headings, logo text |
| Light Gray BG | `#f8fafc` | Group stage page background, match rows |
| Cream BG | `#fff7cc` → `#fffbea` | Welcome page gradient |
| Success Green | `#16a34a` | Qualifying row highlight, success messages |
| Error Red | `#dc2626` | Error messages |
| Border Radius (cards) | `18px` – `24px` | All major cards |
| Border Radius (inputs) | `10px` – `12px` | Inputs, buttons |
| Font | Arial, Helvetica, sans-serif | Global |

---

## Data Flow

```
Login Page                  Welcome Page              Group Stage
┌──────────┐  localStorage  ┌──────────┐   link       ┌──────────────┐
│ Sign In/ │ ──────────────>│  Rules & │ ────────────>│ 12 Groups    │
│ Sign Up  │  (userId,      │  Points  │              │ 72 Matches   │
│          │   fullName,    │  System  │              │ Score Inputs │
│  POST    │   email,       │          │              │              │
│  /api/*  │   isLoggedIn)  │  Logout  │              │ Auto-calc    │
└──────────┘                └──────────┘              │ Standings    │
                                                      │              │
                                                      │ localStorage │
                                                      │ (predictions)│
                                                      └──────────────┘
```

---

## Pages Not Yet Built

Based on the rules described on the Welcome page, the following features are referenced but not yet implemented:

- **Knockout Stage Bracket** — Round of 32, Round of 16, Quarter-finals, Semi-finals
- **Third Place Match** — Pick third-place winner
- **Final Match** — Pick finalists and tournament winner
- **Leaderboard / Scoring** — Points calculation against actual results
- **Bonus Points** — Match event participation tracking
- **User Profile / Settings** — Account management
- **Admin Panel** — Enter actual results, manage users
