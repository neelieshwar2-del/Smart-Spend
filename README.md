# SmartSpend — Neo-Fintech Expense & Budget Manager

A modern, responsive Neo-Fintech frontend for **SmartSpend**, crafted using the design specifications, tokens, and layouts from the provided mockups and code.

---

## 🌟 Key Features

1. **Unified Single-Page Architecture (SPA)**
   - **Home Screen**:
     - Monthly Spend Limit card with neon lime accent, dynamic safe balance computation (`₹16,550`), and animated progress bar (`63%`).
     - Quick Action pills: *Add Expense*, *Scan UPI*, *Insights*, *Smart AI*.
     - Today's Spending card with pacing indicator (`₹840` spent of `₹1,200` target).
     - Contextual AI budget insight tip.
     - Live Recent Transactions ledger with category tags and payment methods.
   - **Add Expense Screen (Stack Mode)**:
     - Full interactive tactile numeric keypad (`0-9`, `.`, `backspace`) and quick preset chips (`+₹50`, `+₹100`, `+₹500`, `+₹1,000`).
     - Segmented switcher: *Expense* vs *Income*.
     - Recipient/merchant input with one-click clear button and note field.
     - Horizontally scrollable Category Carousel (*Food & Dining*, *Groceries*, *Transport*, *Shopping*, *Bills & Utility*, *Entertainment*).
     - Payment account selection chips (*UPI*, *Cash*, *ICICI Coral Card*).
     - Anti-duplicate transaction shield indicator.
     - Real-time saving animation with instant recalculation across all tabs!
   - **Activity Screen**:
     - Live search bar (searches merchants, notes, and categories).
     - Interactive filter chips (*All Types*, *Food & Dining*, *UPI*, *Amount > ₹500*, *Income Only*).
     - October 2024 monthly overview snapshot card with budget burn bar.
     - Grouped date-wise transactions (*Today*, *Yesterday*, *22 October*, *Earlier*).
     - Interactive transaction details sheet modal with **Edit** and **Delete** actions.
     - One-click **Export to CSV** feature for monthly statement downloads.
   - **Insights Screen**:
     - Period selector pill tabs (*Week*, *Month*, *Quarter*, *Year*).
     - 2×2 key analytics metric cards (*Total Spent*, *Daily Average*, *Top Category*, *Safe to Spend*).
     - Weekly Spending Trend Bar Chart with daily target reference line and hover tooltips.
     - Segmented proportional spending meter and category breakdown breakdown list.
     - Upcoming subscriptions reminder card (*Netflix Premium*, *Spotify Duo*, *Cult.fit Pass*).
   - **Profile Screen**:
     - User overview (*Rohan Sharma*, Pro fintech member).
     - Active linked bank accounts and credit cards.
     - Interactive budget configuration (adjust Monthly Spend Limit and Daily Allowance).
     - App preferences (Audio haptic clicks toggle, Device Frame toggle, Reset demo data).

2. **Interactive Modals & Extras**:
   - **Scan UPI Simulator**: Laser scanning animation with quick sample QR codes (*Blue Tokai*, *Uber*, *Grocery*) that auto-fill the transaction form.
   - **SmartSpend AI Assistant**: Conversational financial copilot with suggestions ("*Can I afford dinner tonight?*", "*Top spend category?*", etc.).
   - **Notifications Center**: Slide-up sheet with unread badges and notification history.
   - **Web Audio Haptics**: Subtle, pleasant fintech synth feedback on keypad clicks and successful transaction saves (toggleable in Profile).
   - **Device Frame / Fluid Toggle**: On desktop, view inside an authentic mobile device shell or toggle to fluid full-screen responsive layout.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)

### Starting the Local Server
From the project folder, run:
```bash
node server.js
```
or
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📁 File Structure
```
SMARTSPEND/
├── index.html        # Complete Single Page Application with all views & modals
├── styles.css        # Neo-Fintech design system, animations & device frame styles
├── app.js            # Reactive state manager, router, keypad, and ledger calculations
├── server.js         # Zero-dependency local Node.js static server
├── package.json      # NPM scripts configuration
└── README.md         # Documentation
```
