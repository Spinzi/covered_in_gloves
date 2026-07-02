# Frontend Architecture Notes (v1)

## 1. URL = Source of Truth (Routing Layer)

Rule: The application state must always be derivable from the URL.

Examples:

- /home
- /questions
- /question/:id
- /day/:date
- /dashboard

Responsibilities:

- Determines what view is rendered
- Determines what data is requested from backend
- Must always work on page refresh

Rule:
If URL and any local state conflict → URL always wins

---

## 2. history.state = Navigation Context (Ephemeral)

Purpose: only for UI flow behavior, not data.

Examples:
{ from: "home" }
{ from: "questions" }

Used for:

- Back button behavior
- UI transition hints
- Conditional navigation logic

Rule:

- Must be safe to lose at any time
- Never required for correctness

---

## 3. localStorage = Persistent UI Cache (NOT state source)

Purpose: convenience only.

Allowed uses:

- autosave drafts (temporary)
- last opened route
- UI preferences
- recent items list

Forbidden uses:

- authentication logic
- authoritative data
- critical app state

Rule:
If localStorage is corrupted or wiped → app must still fully function

---

## 4. Startup Initialization Flow

On page load:

1. Read URL
2. Render correct page from URL
3. Fetch required backend data
4. Optionally hydrate UI from localStorage

Important rule:
URL overrides localStorage ALWAYS

---

## 5. LocalStorage Validation Rule

On route change:
if (localStorage.route !== currentURL) {
localStorage.clearRelevantKeys()
}

Or stricter:
Only keep localStorage if it matches current URL context

---

## 6. Autosave System

- Trigger: every 3–5 seconds OR on change
- Scope: current active question/day only
- Storage: localStorage only (temporary buffer)
- Backend sync: separate mechanism later

---

## 7. Mental Model

URL → WHAT is shown
history.state → HOW you got there
localStorage → WHAT was temporarily remembered
Backend → REAL data

---

## 8. Critical Stability Rule

The application must function perfectly with:

- empty localStorage
- fresh reload
- direct URL entry

If not → architecture is wrong.

---

---

---

---

---

---

---

---

---

# FRONTEND ARCHITECTURE NOTES

This file explains the structure of the frontend and what each part is responsible for.

The goal is:

- clear separation of responsibilities
- predictable data flow
- easy scaling without confusion

---

# ROOT FILES

## index.html

Entry point of the application.

Responsibilities:

- loads the app
- provides root container (e.g. #app)
- includes scripts and styles

Does NOT:

- contain logic
- manage state
- handle UI behavior

---

## main.js

Application bootstrap file.

Responsibilities:

- initializes the app
- connects core systems
- starts router / API / socket
- sets initial page

Example role:

- initAPI()
- connect socket
- load initial route

---

# CORE SYSTEM

This is the “engine” of the app.

---

## api.js

High-level interface for sending actions to the backend.

Responsibilities:

- defines app actions (login, loadDay, etc.)
- wraps socket.send()
- exposes clean functions for UI

Does NOT:

- handle raw WebSocket logic
- manage UI
- store state

---

## socket.js

Low-level WebSocket communication layer.

Responsibilities:

- open WebSocket connection
- send raw messages
- receive raw messages
- forward messages to api.js handler system

Does NOT:

- understand app logic
- manage actions
- update UI or state

---

## state.js

Temporary in-memory application state.

Responsibilities:

- stores current session data
- stores loaded data temporarily
- holds UI state (current page, user, etc.)

Example:

- currentUser
- currentDay
- loading flags

Does NOT:

- persist data permanently
- communicate with backend

---

## storage.js

Persistent browser storage layer.

Responsibilities:

- localStorage / sessionStorage access
- saving tokens
- saving preferences

Example:

- auth token
- theme setting

Does NOT:

- store runtime UI state

---

## router.js

Controls navigation between pages.

Responsidbilities:

- switches views/pages
- handles route changes
- manages URL state

Example routes:

- /dashboard
- /day
- /login

Does NOT:

- fetch data
- manage backend communication

---

## config.js

Global configuration file.

Responsibilities:

- API/WebSocket URL
- static constants
- environment settings

Example:

- WS_URL
- APP_VERSION

---

# PAGES

Pages are full-screen application views.

Pages combine components + call core systems.

---

## dashboard/

Main overview screen.

Responsibilities:

- display summary data
- load stats
- show navigation widgets

---

## day/

Core feature page.

Responsibilities:

- load specific day data
- display questions/entries
- interact with backend via api.js

---

## login/

Authentication screen.

Responsibilities:

- login form
- calls api.login()
- stores token via storage.js

---

## settings/

User configuration page.

Responsibilities:

- theme settings
- preferences
- account settings

---

# COMPONENTS

Reusable UI building blocks.

Each component is:

- isolated
- reusable
- independent from backend

---

## button

Clickable UI element.

Responsibilities:

- trigger actions
- emit events via callbacks

---

## card

Container UI block.

Responsibilities:

- display grouped information

---

## input

Text input field.

Responsibilities:

- capture user input
- validation triggers (optional)

---

## modal

Popup overlay system.

Responsibilities:

- show dialogs
- confirm actions
- focus user attention

---

## sidebar

Navigation menu.

Responsibilities:

- page switching
- route triggers

---

## toast

Temporary notifications.

Responsibilities:

- show success/error messages
- auto-dismiss alerts

---

# STYLES

CSS architecture split for maintainability.

---

## variables.css

Design system variables.

Responsibilities:

- colors
- spacing
- fonts

Example:
--primary-color

---

## base.css

Global reset and base styling.

Responsibilities:

- body styling
- resets
- typography defaults

---

## layout.css

Page structure styles.

Responsibilities:

- grid systems
- app layout structure

---

## components.css

Shared component styles.

Responsibilities:

- reusable UI styling
- buttons, cards, inputs, etc.

---

# UTILS

Pure helper functions.

No DOM. No state. No backend.

---

## date.js

Date formatting and manipulation.

---

## helper.js

General reusable logic.

Example:

- string utilities
- formatting helpers

---

## validation.js

Input validation logic.

Example:

- email validation
- required fields
- constraints checking

---

# SUMMARY FLOW

User interaction flow:

UI (components)
→ Page logic
→ api.js (intent layer)
→ socket.js (transport)
→ backend
→ response
→ state.js update
→ UI re-render

---

# CORE PRINCIPLE

Each layer has one responsibility:

- Components → UI
- Pages → logic assembly
- Core → system infrastructure
- Utils → pure logic
- Styles → appearance
- Main → bootstrap
