# Super Admin Role in ARTIC Health Companion — Complete Feature Control System

## Executive Summary

The **Super Admin** is the **system owner** with ultimate authority over the entire ARTIC Health Companion platform. Unlike hospital-level administrators who manage day-to-day operations within their facility, the Super Admin operates at the **global/system level** with three primary responsibilities:

1. **Feature Governance** — Enable/disable any feature across the entire system
2. **Tenant Management** — Onboard hospitals, assign permissions, set limits
3. **Subscription Control** — Enforce paywalls, track usage, manage billing

The Super Admin controls **which features are available**, **to whom**, and **under what conditions**—acting as the gatekeeper of the entire ARTIC ecosystem.

---

## PART 1: SUPER ADMIN DASHBOARD OVERVIEW

### The Super Admin Control Hub

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ARTIC HEALTH COMPANION                                │
│                      SUPER ADMIN DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  System     │  │  Active     │  │  Revenue    │  │  Support    │     │
│  │  Status     │  │  Hospitals │  │  This Month │  │  Tickets    │     │
│  │  🟢 Online  │  │  47/50     │  │  $124,500   │  │  12 Open    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                          MAIN MENU                                  │  │
│  ├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┤  │
│  │ Feature │ Tenant  │ Hospital│ User    │ Billing │ Reports │ System  │  │
│  │ Control │ Manager │ Manager │ Manager │ & Subs  │ & Audit │ Settings│  │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 2: FEATURE CONTROL CENTER (Most Critical)

### 2.1 Feature Management Dashboard

This is the **nerve center** where the Super Admin controls every feature in ARTIC.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FEATURE CONTROL CENTER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔍 Search Features...                    [Filter] [Export] [Bulk Edit]    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ALL FEATURES (45 Total)                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  📱 Core Patient Features (14)  ────────────────────────────── ▶   │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Feature              │  Status    │  Tier   │  Action        │ │   │
│  │  ├───────────────────────┼───────────┼─────────┼────────────────┤ │   │
│  │  │  Patient Registration │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  │  Appointment Booking  │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  │  Medical Records View │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  │  Lab Results Access   │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  🤖 AI Features (8)  ──────────────────────────────────────────── ▶ │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Feature              │  Status    │  Tier   │  Action        │ │   │
│  │  ├───────────────────────┼───────────┼─────────┼────────────────┤ │   │
│  │  │  Health Literacy AI   │  🔒 Locked │  Pro    │ [Edit] [Toggle]│ │   │
│  │  │  Adherence Agent      │  ⚠️ Limited│ Premium │ [Edit] [Toggle]│ │   │
│  │  │  Conversational Agent │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  │  Predictive Analytics │  🔒 Locked │  Pro    │ [Edit] [Toggle]│ │   │
│  │  │  Clinical Decision AI │  🔒 Locked │  Pro    │ [Edit] [Toggle]│ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  🏥 Provider Features (10) ────────────────────────────────────── ▶ │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Feature              │  Status    │  Tier   │  Action        │ │   │
│  │  ├───────────────────────┼───────────┼─────────┼────────────────┤ │   │
│  │  │  Provider Dashboard   │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  │  Telemedicine         │  ✅ Active │  Basic  │ [Edit] [Toggle]│ │   │
│  │  │  EMR Integration      │  ⚠️ Limited│ Premium │ [Edit] [Toggle]│ │   │
│  │  │  Population Analytics │  🔒 Locked │  Pro    │ [Edit] [Toggle]│ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Feature Detail & Control Panel

When Super Admin clicks "Edit" on any feature:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EDIT FEATURE: Health Literacy AI                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  BASIC INFORMATION                                                   │  │
│  │  ──────────────────────────────────────────────                     │  │
│  │  Name: Health Literacy AI Agent                                     │  │
│  │  Category: AI Features                                              │  │
│  │  Description: Translates complex medical information into          │  │
│  │              patient-friendly language with multimedia              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  ACCESS CONTROL                                                      │  │
│  │  ──────────────────────────────────────────────                     │  │
│  │                                                                      │  │
│  │  Current Status:  [🔒 Locked]  ● Active    ○ Inactive   ○ Limited   │  │
│  │                                                                      │  │
│  │  Feature Availability:                                               │  │
│  │  ○ Global (All hospitals)                                            │  │
│  │  ● Tier-based (Based on subscription)                               │  │
│  │  ○ Specific Hospitals only                                           │  │
│  │                                                                      │  │
│  │  Required Tier:  [Pro ▼]                                            │  │
│  │                                                                      │  │
│  │  [✓] Allow trial access (7 days)                                    │  │
│  │  [✓] Require explicit approval                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  MESSAGE CONFIGURATION (For locked features)                        │  │
│  │  ──────────────────────────────────────────────                     │  │
│  │                                                                      │  │
│  │  Access Denied Message:                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐│  │
│  │  │ This feature requires a Pro subscription. Please contact       ││  │
│  │  │ system administrator at support@artic.com or upgrade your      ││  │
│  │  │ plan to access this feature.                                   ││  │
│  │  └─────────────────────────────────────────────────────────────────┘│  │
│  │                                                                      │  │
│  │  Contact Info:                                                       │  │
│  │  📧 support@artic.com  📞 +250 788 123 456                         │  │
│  │                                                                      │  │
│  │  [✓] Show contact button  [✓] Show upgrade option                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  PERMISSIONS                                                         │  │
│  │  ──────────────────────────────────────────────                     │  │
│  │                                                                      │  │
│  │  Who can access this feature:                                        │  │
│  │  ☑️ Super Admin (Always)                                           │  │
│  │  ☑️ Hospital Manager (If tier allows)                               │  │
│  │  ☑️ Doctors (If tier allows)                                        │  │
│  │  ☑️ Nurses (If tier allows)                                         │  │
│  │  ☐ Pharmacists (If tier allows)                                     │  │
│  │  ☑️ Patients (If tier allows)                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  USAGE LIMITS (Optional)                                            │  │
│  │  ──────────────────────────────────────────────                     │  │
│  │                                                                      │  │
│  │  [✓] Limit usage per hospital: [1000 ▼] interactions/month          │  │
│  │  [✓] Limit usage per patient: [50 ▼] interactions/month             │  │
│  │  [ ] Notify when usage reaches: [80 ▼] %                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [Save Changes] [Cancel] [View Usage Logs] [Test Configuration]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Feature Status Types

| Status Icon | Meaning | Description |
|-------------|---------|-------------|
| **✅ Active** | Fully available | Feature works for all eligible users |
| **⚠️ Limited** | Limited access | Feature available but with restrictions |
| **🔒 Locked** | Not available | Feature is not accessible without upgrade |
| **🚧 Beta** | In testing | Feature available to selected users for testing |
| **⏳ Pending** | Awaiting approval | Feature ready but needs Super Admin approval |
| **🚫 Disabled** | Permanently off | Feature turned off globally |

---

## PART 3: HOSPITAL/TENANT MANAGEMENT

### 3.1 Hospital/Tenant Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TENANT MANAGEMENT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Filters: [All Status ▼] [All Tiers ▼] [Search Hospitals...]     │   │
│  │  [+ Add Hospital]  [Bulk Import]  [Export List]                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ID │ Hospital Name  │ Status │ Tier   │ Users │ Features│ Action  │   │
│  ├─────┼────────────────┼────────┼────────┼───────┼─────────┼────────┤   │
│  │  1  │ Kigali Central │ ✅     │ Pro    │ 245   │ 42/45   │ [View]  │   │
│  │     │ Hospital        │ Active │        │       │         │ [Edit]  │   │
│  │─────┼────────────────┼────────┼────────┼───────┼─────────┼────────┤   │
│  │  2  │ Musanze          │ ✅     │Premium │ 128   │ 35/45   │ [View]  │   │
│  │     │ District Hosp   │ Active │        │       │         │ [Edit]  │   │
│  │─────┼────────────────┼────────┼────────┼───────┼─────────┼────────┤   │
│  │  3  │ Huye Polyclinic │ ⚠️     │ Basic  │ 45    │ 18/45   │ [View]  │   │
│  │     │                  │Limited │        │       │         │ [Edit]  │   │
│  │─────┼────────────────┼────────┼────────┼───────┼─────────┼────────┤   │
│  │  4  │ Rwamagana       │ 🔒     │ Trial  │ 12    │ 12/45   │ [View]  │   │
│  │     │ Hospital        │ Trial  │        │       │         │ [Edit]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Hospital Detail & Feature Assignment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOSPITAL: Kigali Central Hospital                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐│
│  │  Basic Info   │  │ Subscription  │  │ User Count    │  │ Feature Count││
│  │  • Tier: Pro  │  │ Paid until:   │  │ 245 Active    │  │ 42/45 Active ││
│  │  • Since: 2024│  │ Dec 2025      │  │ 12 Admins     │  │ 3 Locked     ││
│  │  • Status: ✅ │  │ $2,400/month  │  │ 150 Doctors   │  │ 0 Pending    ││
│  └───────────────┘  └───────────────┘  └───────────────┘  └──────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FEATURE ASSIGNMENT (Select which features this hospital can use)   │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Core Features (All included in Pro)                                 │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  [✓] Patient Registration      [✓] Appointment Booking       │ │   │
│  │  │  [✓] Medical Records           [✓] Lab Results               │ │   │
│  │  │  [✓] Provider Dashboard        [✓] Telemedicine              │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  │  AI Features (Pro includes all)                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  [✓] Health Literacy AI        [✓] Adherence Agent            │ │   │
│  │  │  [✓] Conversational Agent      [✓] Predictive Analytics       │ │   │
│  │  │  [✓] Clinical Decision AI                                     │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  │  Premium Features (Additional cost)                                   │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  [ ] EMR Full Integration       [ ] Multi-hospital Sync        │ │   │
│  │  │  [ ] Custom AI Models           [ ] White-label Branding       │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Save Hospital Settings] [Suspend Hospital] [Delete Hospital]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 4: SUBSCRIPTION & TIER MANAGEMENT

### 4.1 Tier Definitions

| Tier | Price/Month | Features Included | User Limit | Hospitals |
|------|-------------|-------------------|------------|-----------|
| **Trial** | $0 | Basic patient features | 20 users | 1 hospital |
| **Basic** | $500 | Core features (no AI) | 100 users | 1 hospital |
| **Premium** | $1,200 | Core + Conversational AI + Adherence | 500 users | 2 hospitals |
| **Pro** | $2,400 | All features + Full AI suite | 2,000 users | Unlimited |
| **Enterprise** | Custom | All features + Custom AI + White-label | Unlimited | Unlimited |

### 4.2 Subscription Control Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION & BILLING CONTROL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIER MANAGEMENT                          [+ Add New Tier]          │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Pro Tier - $2,400/month                                             │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Features: 45 total                                            │ │   │
│  │  │  Active Features: 42   Locked Features: 3   Pending: 0        │ │   │
│  │  │                                                               │ │   │
│  │  │  Feature Assignment:                                           │ │   │
│  │  │  [Edit Feature List]  [Add/Remove Features]                   │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PRICING RULES                                                      │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  ✓ Per hospital: $2,400/month                                       │   │
│  │  ✓ Discount for multi-year: 10% off annual, 20% off multi-year     │   │
│  │  ✓ Volume discount: 15% off for 5+ hospitals                       │   │
│  │  ✓ Trial period: 14 days                                           │   │
│  │                                                                      │   │
│  │  Feature add-on pricing:                                            │   │
│  │  • Additional 1,000 users: +$500/month                             │   │
│  │  • Custom AI model: +$1,000/month                                   │   │
│  │  • White-label branding: +$500/month                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Payment & Invoice Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PAYMENTS & INVOICES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Invoice ID] │ Hospital     │ Amount │ Status │  Date   │ Action  │   │
│  │─────────────────────────────────────────────────────────────────────│   │
│  │  INV-2025-001 │ Kigali       │ $2,400 │ Paid ✓ │ Jan 1  │ [View]  │   │
│  │  INV-2025-002 │ Musanze      │ $2,400 │ Paid ✓ │ Jan 1  │ [View]  │   │
│  │  INV-2025-003 │ Huye         │ $1,200 │ 🔴 Over│ Dec 31 │ [View]  │   │
│  │  INV-2025-004 │ Rwamagana    │ $500   │ Pending│ Jan 1  │ [View]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Generate Invoice] [Bulk Pay] [Export All] [Payment Settings]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 5: FEATURE ACCESS — USER EXPERIENCE

### 5.1 When User Tries to Access a Locked Feature

This is what the hospital user sees:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARTIC Health Companion                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │                          🔒 FEATURE LOCKED                           │   │
│  │                                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Health Literacy AI Agent                                     │ │   │
│  │  │                                                               │ │   │
│  │  │  This feature is not currently available for your hospital.   │ │   │
│  │  │                                                               │ │   │
│  │  │  To enable access:                                            │ │   │
│  │  │                                                               │ │   │
│  │  │  🔹 Upgrade your subscription to Pro Tier ( +$1,200/month)   │ │   │
│  │  │  🔹 Contact system administrator for approval                │ │   │
│  │  │  🔹 Request a 7-day trial                                    │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │   │
│  │  │  │  Upgrade Now │  │  Contact SA │  │  Free Trial │          │ │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘          │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Need help? Contact your System Administrator:                │ │   │
│  │  │  📧 admin@kigalihospital.rw    📞 +250 788 123 456           │ │   │
│  │  │  Or ARTIC Support: support@artic.com                         │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Hospital Manager Access Request

When a Hospital Manager requests access to a locked feature:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACCESS REQUEST SUBMITTED                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Your request has been submitted to the System Administrator.           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Request Details:                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │  • Feature: Health Literacy AI Agent                                │   │
│  │  • Requested by: Dr. Jean Pierre (Hospital Manager)                 │   │
│  │  • Hospital: Kigali Central Hospital                               │   │
│  │  • Reason: "We have 200 diabetic patients who need education"      │   │
│  │  • Submitted: January 15, 2025, 2:34 PM                            │   │
│  │  • Status: Pending Approval                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  You will receive notification when a decision is made.                     │
│                                                                             │
│  [Back to Dashboard] [Check Status]                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 6: SUPER ADMIN APPROVAL WORKFLOW

### 6.1 Pending Requests Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PENDING APPROVAL REQUESTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Request #] │ Hospital │ Feature  │ Requested By │ Status │ Action│   │
│  │─────────────────────────────────────────────────────────────────────│   │
│  │  REQ-001     │ Kigali   │ Health   │ Dr. Pierre  │ Pending│[View] │   │
│  │              │ Central  │ Literacy │ (Hospital   │        │[Approve]│ │   │
│  │              │          │ AI       │ Manager)    │        │[Deny]  │ │   │
│  │──────────────┼──────────┼──────────┼─────────────┼────────┼───────│   │
│  │  REQ-002     │ Musanze  │ Clinical │ Dr. Marie   │ Pending│[View] │   │
│  │              │ District │ Decision │ (Senior      │        │[Approve]│ │   │
│  │              │          │ AI       │ Doctor)     │        │[Deny]  │ │   │
│  │──────────────┼──────────┼──────────┼─────────────┼────────┼───────│   │
│  │  REQ-003     │ Huye     │ EMR      │ Nurse       │ Pending│[View] │   │
│  │              │ Polyclinic│Integration│ Alphonse   │        │[Approve]│ │   │
│  │              │          │ (Premium)│ (IT Admin)  │        │[Deny]  │ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Approve/Deny Feature Request

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REQUEST REVIEW: REQ-001                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  REQUEST DETAILS                                                    │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Feature: Health Literacy AI Agent                                   │   │
│  │  Hospital: Kigali Central Hospital (Pro Tier)                        │   │
│  │  Current Subscription: $2,400/month                                  │   │
│  │  Requested by: Dr. Jean Pierre (Hospital Manager)                    │   │
│  │  Date Requested: January 15, 2025, 2:34 PM                          │   │
│  │                                                                      │   │
│  │  Justification:                                                      │   │
│  │  "We have 200 diabetic patients who need constant health education.  │   │
│  │  Our clinicians spend too much time explaining basic concepts. The   │   │
│  │  AI would help us scale patient education significantly."            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RECOMMENDATIONS                                                    │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  ○ Approve (Feature will be enabled for this hospital)               │   │
│  │  ○ Approve with conditions (Set usage limits)                       │   │
│  │  ○ Deny (Feature will remain locked)                                 │   │
│  │  ○ Request more information                                         │   │
│  │                                                                      │   │
│  │  Conditions (if applicable):                                         │   │
│  │  [✓] Limit to 500 patient interactions/month                         │   │
│  │  [✓] Require monthly review of usage                                 │   │
│  │  [✓] Approval expires in 3 months (needs renewal)                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SUPER ADMIN NOTES                                                  │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  [Add note...]                                                       │   │
│  │                                                                      │   │
│  │  "This is a valid use case. Approving with usage limit to ensure    │   │
│  │  responsible usage. Will review in 3 months."                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Approve] [Deny] [Request Info] [Cancel]                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: SYSTEM CONFIGURATION

### 7.1 Global Settings

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SYSTEM SETTINGS                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  GENERAL SETTINGS                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  System Name: ARTIC Health Companion                                 │   │
│  │  Version: v3.0.1                                                    │   │
│  │  Environment: Production                                             │   │
│  │  Maintenance Mode: ○ On  ● Off                                      │   │
│  │  Default Language: [English ▼]                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SECURITY SETTINGS                                                  │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  [✓] Require 2FA for all users                                       │   │
│  │  [✓] Password expiry: [90 ▼] days                                  │   │
│  │  [✓] Session timeout: [60 ▼] minutes                               │   │
│  │  [✓] IP whitelisting enabled                                        │   │
│  │  [✓] Audit logs retention: [365 ▼] days                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FEATURE DEFAULTS                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Default feature status for new hospitals:                          │   │
│  │  ○ All features locked by default                                    │   │
│  │  ● Basic features enabled, AI locked                                │   │
│  │  ○ All features enabled                                             │   │
│  │                                                                      │   │
│  │  Trial period: [14 ▼] days                                         │   │
│  │  Auto-lock on trial expiry: [✓]                                    │   │
│  │  Send reminder: [3 ▼] days before expiry                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 8: MONITORING & ANALYTICS

### 8.1 Feature Usage Analytics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FEATURE USAGE ANALYTICS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Most Used Features (Last 30 Days)                                  │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  1. Patient Registration   ████████████████████ 45,000 uses        │   │
│  │  2. Appointment Booking    ██████████████████  42,500 uses        │   │
│  │  3. Medical Records View   █████████████████   38,200 uses        │   │
│  │  4. Telemedicine           ██████████████      30,100 uses        │   │
│  │  5. Conversational Agent   █████████████       28,700 uses        │   │
│  │  6. Health Literacy AI     ████████            16,400 uses        │   │
│  │  7. Clinical Decision AI   ████                 8,200 uses        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Feature Adoption by Hospital Tier                                  │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Pro Tier (10 hospitals)  ████████████████████  92% usage          │   │
│  │  Premium Tier (25 hosp)   ████████████████     68% usage          │   │
│  │  Basic Tier (12 hosp)     ████████████         45% usage          │   │
│  │  Trial (3 hosp)           ████                 15% usage          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Locked Features Requests (Pending/Approved/Denied)                 │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Feature                │ Pending │ Approved │ Denied │ Success %  │   │
│  │  ──────────────────────┼─────────┼──────────┼────────┼───────────│   │
│  │  Health Literacy AI     │ 5       │ 12       │ 3      │ 80%        │   │
│  │  Clinical Decision AI   │ 8       │ 7        │ 6      │ 54%        │   │
│  │  EMR Integration        │ 3       │ 10       │ 2      │ 83%        │   │
│  │  Predictive Analytics   │ 2       │ 4        │ 8      │ 33%        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Audit Logs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUDIT LOGS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filters: [Date Range ▼] [Action ▼] [User ▼] [Search...]                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Date & Time       │ User           │ Action                │ Details│   │
│  │─────────────────────────────────────────────────────────────────────│   │
│  │  2025-01-15 14:34  │ superadmin@    │ Feature Approval      │ Health │   │
│  │                    │ artic.com      │                       │ Literacy│   │
│  │─────────────────────────────────────────────────────────────────────│   │
│  │  2025-01-15 10:22  │ superadmin@    │ Hospital Created      │ Huye   │   │
│  │                    │ artic.com      │                       │ Hospital│   │
│  │─────────────────────────────────────────────────────────────────────│   │
│  │  2025-01-14 16:45  │ dr.pierre@     │ Feature Request       │ Clinical│   │
│  │                    │ kigalihosp.rw  │                       │ Decision│   │
│  │─────────────────────────────────────────────────────────────────────│   │
│  │  2025-01-14 09:12  │ superadmin@    │ Tier Changed          │ Basic→ │   │
│  │                    │ artic.com      │                       │ Premium│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Export Logs] [View Full Details] [Set Alert Rules]                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 9: SUPER ADMIN RESPONSIBILITIES SUMMARY

### 9.1 Core Responsibilities

| Responsibility | Description | Frequency |
|----------------|-------------|-----------|
| **Feature Governance** | Enable/disable features, set tiers, manage locks | Daily/Weekly |
| **Tenant Management** | Onboard hospitals, assign permissions, manage tiers | Weekly |
| **Access Requests** | Review and approve/deny feature access requests | Daily |
| **Subscription Management** | Monitor payments, handle upgrades/downgrades | Weekly |
| **System Monitoring** | Check system health, respond to alerts | Daily |
| **Security Oversight** | Review audit logs, manage security settings | Weekly |
| **Compliance** | Ensure adherence to MOH/RAAQH requirements | Monthly |
| **Reporting** | Generate usage reports, financial reports | Monthly |
| **Support Escalation** | Handle high-priority issues from support team | As needed |

### 9.2 Checklist — Super Admin Daily Tasks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DAILY ADMIN CHECKLIST                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ☐ System health check (dashboard status)                                  │
│  ☐ Review pending feature requests (approve/deny)                         │
│  ☐ Check for critical security alerts                                     │
│  ☐ Review new hospital registrations                                      │
│  ☐ Monitor system performance metrics                                     │
│  ☐ Respond to support escalations                                         │
│  ☐ Check for failed payments (hospital subscriptions)                     │
│  ☐ Review audit logs for suspicious activity                              │
│  ☐ Update system status page if needed                                    │
│  ☐ Document any critical decisions made                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 10: TECHNICAL IMPLEMENTATION

### 10.1 Feature Flag Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FEATURE FLAG SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FEATURE FLAG DATABASE                            │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  feature_flags table                                         │  │   │
│  │  │  ──────────────────────────────────────────────────────────── │  │   │
│  │  │  id: UUID                                                     │  │   │
│  │  │  name: VARCHAR                                               │  │   │
│  │  │  description: TEXT                                           │  │   │
│  │  │  default_status: 'active' | 'limited' | 'locked'            │  │   │
│  │  │  tier_required: 'basic' | 'premium' | 'pro' | 'enterprise'  │  │   │
│  │  │  requires_approval: BOOLEAN                                 │  │   │
│  │  │  access_message: TEXT                                       │  │   │
│  │  │  usage_limit: INTEGER                                       │  │   │
│  │  │  created_at: TIMESTAMP                                       │  │   │
│  │  │  updated_at: TIMESTAMP                                       │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  hospital_feature_access table                               │  │   │
│  │  │  ──────────────────────────────────────────────────────────── │  │   │
│  │  │  id: UUID                                                     │  │   │
│  │  │  hospital_id: UUID REFERENCES hospitals(id)                  │  │   │
│  │  │  feature_id: UUID REFERENCES feature_flags(id)               │  │   │
│  │  │  access_status: 'active' | 'locked' | 'limited' | 'pending' │  │   │
│  │  │  approved_by: UUID REFERENCES users(id)                     │  │   │
│  │  │  approved_at: TIMESTAMP                                      │  │   │
│  │  │  expires_at: TIMESTAMP                                       │  │   │
│  │  │  usage_count: INTEGER                                        │  │   │
│  │  │  usage_limit: INTEGER                                        │  │   │
│  │  │  request_reason: TEXT                                       │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    API MIDDLEWARE CHECK                              │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  async function checkFeatureAccess(feature_name, hospital_id) {    │   │
│  │    // 1. Check global feature status                                 │   │
│  │    const feature = await FeatureFlag.findOne({                      │   │
│  │      where: { name: feature_name }                                  │   │
│  │    });                                                              │   │
│  │                                                                      │   │
│  │    // 2. Check if feature is globally locked                        │   │
│  │    if (feature.default_status === 'locked') {                       │   │
│  │      throw new FeatureLockedError({                                 │   │
│  │        message: feature.access_message,                            │   │
│  │        contact: config.admin_contact                                │   │
│  │      });                                                            │   │
│  │    }                                                               │   │
│  │                                                                      │   │
│  │    // 3. Check hospital-specific access                             │   │
│  │    const access = await HospitalFeatureAccess.findOne({             │   │
│  │      where: { feature_id: feature.id, hospital_id }                 │   │
│  │    });                                                              │   │
│  │                                                                      │   │
│  │    // 4. If no record, use default                                  │   │
│  │    if (!access) {                                                   │   │
│  │      return { allowed: false, reason: 'not_configured' };          │   │
│  │    }                                                               │   │
│  │                                                                      │   │
│  │    // 5. Check if access is active and within limits               │   │
│  │    if (access.access_status !== 'active') {                         │   │
│  │      throw new FeatureLockedError({                                 │   │
│  │        message: feature.access_message,                            │   │
│  │        contact: config.admin_contact                               │   │
│  │      });                                                            │   │
│  │    }                                                               │   │
│  │                                                                      │   │
│  │    // 6. Check usage limits                                         │   │
│  │    if (access.usage_limit && access.usage_count >= access.usage_limit) {│   │
│  │      throw new FeatureQuotaExceededError();                         │   │
│  │    }                                                               │   │
│  │                                                                      │   │
│  │    return { allowed: true, access: access };                       │   │
│  │  }                                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Database Schema for Feature Control

```sql
-- Feature flags table
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    default_status VARCHAR(20) NOT NULL CHECK (default_status IN ('active', 'limited', 'locked', 'beta')),
    tier_required VARCHAR(20) CHECK (tier_required IN ('basic', 'premium', 'pro', 'enterprise')),
    requires_approval BOOLEAN DEFAULT false,
    access_message TEXT,
    contact_info JSONB,
    usage_limit_default INTEGER,
    is_paid_addon BOOLEAN DEFAULT false,
    addon_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospital feature access table
CREATE TABLE hospital_feature_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    access_status VARCHAR(20) NOT NULL CHECK (access_status IN ('active', 'locked', 'limited', 'pending', 'expired')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    request_reason TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, feature_id)
);

-- Feature usage logs
CREATE TABLE feature_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature access requests
CREATE TABLE feature_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    reason TEXT,
    admin_notes TEXT,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## PART 11: SUPER ADMIN UI IMPLEMENTATION SUGGESTIONS

### 11.1 Mockup: Feature Control Main View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARTIC Admin                             🔔 12 Pending    👤 Super Admin  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 Dashboard  │  🎛️ Features  │  🏥 Hospitals  │  📱 Users  │  💰 Billing│
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════════ │
│                                                                             │
│  FEATURE CONTROL CENTER                                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Search: [───────────────────────────]  [🔍]    [Tier: All ▼]      │   │
│  │  [⚙️ Bulk Edit]  [📥 Export]  [📊 Analytics]  [➕ New Feature]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Feature Name            │ Status  │ Tier    │ Usage  │ Actions   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  🏥 Patient Management   │ ✅ Active│ Basic   │ 87%   │ [✏️][🔒]  │   │
│  │  📅 Appointment Booking  │ ✅ Active│ Basic   │ 92%   │ [✏️][🔒]  │   │
│  │  💊 Medication Tracking  │ ✅ Active│ Basic   │ 76%   │ [✏️][🔒]  │   │
│  │  🤖 Health Literacy AI   │ 🔒 Locked │ Pro    │ 12%   │ [✏️][🔓]  │   │
│  │  🧠 Clinical Decision AI │ 🔒 Locked │ Pro    │ 8%    │ [✏️][🔓]  │   │
│  │  💬 Conversational Agent │ ⚠️ Limited│Premium │ 54%   │ [✏️][🔒]  │   │
│  │  📊 Predictive Analytics │ 🔒 Locked │ Pro    │ 5%    │ [✏️][🔓]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ☑️ Feature Legend: ✅ Active  ⚠️ Limited  🔒 Locked  🚧 Beta  🚫 Disabled│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Mockup: Feature Edit Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [x] Edit Feature: Health Literacy AI                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Basic Details                                                      │   │
│  │  Name: [Health Literacy AI Agent────────────────────────────────]  │   │
│  │  Category: [AI Features ▼]                                         │   │
│  │  Description: [Translates complex medical information...───────]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Access Control                                                  ⚙️│   │
│  │  Status: ● Active  ○ Locked  ○ Limited  ○ Beta  ○ Disabled        │   │
│  │  Tier: [Pro ▼]  Approval Required: [✓]  Trial Allowed: [✓]       │   │
│  │  Global: ● All Hospitals  ○ Selected Only                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Access Message                                                   📝│   │
│  │  [This feature requires a Pro subscription. Please contact...────]│   │
│  │  [Contact Email: [support@artic.com──────────────────────────────]│   │
│  │  [Contact Phone: [+250 788 123 456───────────────────────────────]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Permissions                                                       👤│   │
│  │  ☑ Super Admin  ☑ Hospital Manager  ☑ Doctors  ☑ Nurses           │   │
│  │  ☐ Pharmacists  ☑ Patients                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Usage Limits                                                      📊│   │
│  │  ☑ Limit per hospital: [1000───] interactions/month                │   │
│  │  ☑ Limit per patient: [50────] interactions/month                  │   │
│  │  ☑ Alert at: [80────]% usage                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [💾 Save Changes]  [🗑️ Delete Feature]  [📋 View Usage]  [❌ Cancel]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 12: USER EXPERIENCE — LOCKED FEATURE EXAMPLES

### 12.1 Patient Trying to Use Health Literacy AI (Locked)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARTIC Patient Portal                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Hello Marie 👋                                              🔔 2  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Your Health Dashboard                                              │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │  • Blood Pressure: 125/85 (Good)                                    │   │
│  │  • Medication Adherence: 92%                                        │   │
│  │  • Next Appointment: July 22, 2025                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  My Care Plan                                                      │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  💊 Medications:                                                     │   │
│  │  • Amlodipine 5mg - Once daily (Morning)                           │   │
│  │  • Metformin 500mg - Twice daily (With meals)                      │   │
│  │                                                                      │   │
│  │  [🗣️ Ask ARTIC about your medications]   ← 🔒  FEATURE LOCKED      │   │
│  │                                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  🔒  Ask ARTIC AI - Not Available                            │ │   │
│  │  │                                                               │ │   │
│  │  │  This feature is currently locked. To get personalized        │ │   │
│  │  │  health information and medication explanations:              │ │   │
│  │  │                                                               │ │   │
│  │  │  📞 Contact: Kigali Central Hospital Admin                    │ │   │
│  │  │  📧 admin@kigalihospital.rw                                   │ │   │
│  │  │                                                               │ │   │
│  │  │  Or upgrade your hospital's subscription:                     │ │   │
│  │  │  [💰 Check Upgrade Options]                                   │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Doctor Trying to Use Clinical Decision AI (Locked)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARTIC Provider Portal                            Dr. Jean Pierre         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Patient: Marie Umutoni (45F, MRN: 2025-0045)                              │
│  ────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Patient Summary                                                   │   │
│  │  Diagnosis: Type 2 Diabetes, Hypertension                         │   │
│  │  Current Medications: Amlodipine 5mg, Metformin 500mg             │   │
│  │  Recent Labs: HbA1c 7.8% (Jan 2025)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Treatment Plan                                                    │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  Current Plan:                                                      │   │
│  │  • Continue current medications                                    │   │
│  │  • Increase Metformin to 1000mg if HbA1c > 7%                     │   │
│  │  • Lifestyle: Diet + Exercise                                     │   │
│  │                                                                      │   │
│  │  [🧠 Get AI Treatment Recommendations]   ← 🔒  FEATURE LOCKED      │   │
│  │                                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  🔒  Clinical Decision AI - Not Available                     │ │   │
│  │  │                                                               │ │   │
│  │  │  This feature requires a Pro subscription.                    │ │   │
│  │  │                                                               │ │   │
│  │  │  To enable:                                                   │ │   │
│  │  │  ✅ Upgrade your hospital's plan                               │ │   │
│  │  │  ✅ Contact System Administrator: admin@artic.com             │ │   │
│  │  │  ✅ Request a 7-day trial                                     │ │   │
│  │  │                                                               │ │   │
│  │  │  [📧 Contact Admin]  [📱 Request Upgrade]  [🎯 Trial]        │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Conclusion: The Super Admin as System Guardian

The Super Admin role is the **most critical** in the ARTIC Health Companion ecosystem. They are not just IT administrators—they are **business enablers**, **security guardians**, and **platform strategists**.

**Key Responsibilities Reminder:**

1. **Feature Governance** — Control the entire feature set, enable/disable any function, set access tiers, and enforce subscription rules
2. **Tenant Management** — Onboard, configure, and manage all hospital tenants
3. **Access Control** — Approve or deny feature access requests from hospitals
4. **Subscription Management** — Handle billing, tiers, and payments
5. **System Oversight** — Monitor usage, performance, and security

**The Feature Control Superpower:**
The Super Admin's most powerful tool is the ability to lock or unlock any feature—and when a feature is locked, users see:
> *"This feature requires approval. Contact your system administrator."*

This gives the Super Admin **complete control** over the system's functionality, monetization, and growth strategy.

---

*"The Super Admin doesn't just maintain the system—they orchestrate the entire digital health ecosystem, ensuring every feature serves the right user at the right time, under the right terms."*







***************************************************************************************************************************************************


# What Super Admin Should NOT See — Privacy & Separation of Concerns

## Executive Summary

While the Super Admin has **ultimate control** over the ARTIC Health Companion system, there are critical boundaries that **must never be crossed**. The Super Admin is a **system operator**, not a **clinical user** or **patient**. This separation is essential for:

1. **Patient Privacy** — Protected health information must remain confidential
2. **Clinical Independence** — Doctors make treatment decisions, not administrators
3. **Legal Compliance** — Rwanda Data Protection Law, medical ethics, and MOH regulations
4. **Trust** — Patients must trust that their health data is private

---

## PART 1: WHAT SUPER ADMIN SHOULD NEVER ACCESS

### 1.1 Patient Clinical Data (Absolute Prohibition)

| Data Type | Why Super Admin Should NOT See | What They Should See Instead |
|-----------|-------------------------------|-----------------------------|
| **Diagnoses** | Highly sensitive medical information | Only aggregated counts (e.g., "245 diabetic patients in this hospital") |
| **Lab Results** | Personal health information | Only system-level stats (e.g., "150 lab results processed today") |
| **Medications** | Reveals health conditions | Only if medication system is malfunctioning (technical data) |
| **Treatment Plans** | Clinical decision-making | Only anonymized for system performance (not individual patients) |
| **Doctor's Notes** | Private clinical observations | Never — this is strictly clinical |
| **Imaging/Reports** | Contains identifiable patient data | Never — only file storage metrics |

**Example — What Super Admin Dashboard Shows:**
```
✅ Good: "Hospital X has 1,245 active patients" (Aggregated)
❌ Bad: "Patient Marie Umutoni has Diabetes Type 2" (Identifiable)
```

**Technical Enforcement:**
```sql
-- Super Admin is NEVER allowed to query patient clinical data
-- Database-level restrictions:

-- This query should FAIL for Super Admin:
SELECT * FROM patients WHERE national_id = '1234567890123456';
-- ❌ ACCESS DENIED — Super Admin role lacks clinical data permissions

-- This is what Super Admin CAN query:
SELECT COUNT(*) FROM patients WHERE hospital_id = 'hospital_uuid';
-- ✅ Allowed — Aggregated, non-identifiable data
```

---

### 1.2 Individual Patient Conversations (Absolute Prohibition)

| Data Type | Why Super Admin Should NOT See | What They Should See Instead |
|-----------|-------------------------------|-----------------------------|
| **Chat Transcripts** | Contains intimate health details | Only system-level metrics (e.g., "1,200 conversations today") |
| **Voice Recordings** | Could identify patient voice | Only if technical issue (then anonymized) |
| **Emotion/Sentiment Data** | Psychological state | Only aggregated trends |
| **Patient Concerns** | Private worries | Categorized themes only (e.g., "50 patients asked about diabetes diet") |

**Example — Acceptable vs Unacceptable:**
```
✅ Good: "Patient engagement increased 20% this month" (Aggregated)
❌ Bad: "Marie said she's worried about her blood sugar" (Identifiable)
```

**Access Control Implementation:**
```javascript
// Middleware that prevents Super Admin from viewing conversation content
function checkConversationAccess(user, conversationId) {
    // Super Admin has NO access to conversation content
    if (user.role === 'super_admin') {
        // Only allow aggregated analytics, NOT individual conversations
        if (request.isIndividualConversation()) {
            throw new Error('Super Admin cannot view individual conversations');
        }
        // Allow only anonymized analytics
        return getAnonymizedAnalytics();
    }
    // Normal clinical users can access their patients' conversations
}
```

---

### 1.3 Doctor-Patient Communication (Absolute Prohibition)

| Communication Type | Why Super Admin Should NOT See |
|-------------------|-------------------------------|
| **Secure Messages** | Confidential clinical communication |
| **Video Consultations** | Contains identifiable patient and doctor |
| **Prescription Requests** | Reveals treatment details |
| **Urgent Alerts** | Contains specific patient conditions |

**What Super Admin CAN See:**
- ✅ Number of messages sent (aggregated)
- ✅ System performance of messaging (delivery success)
- ✅ Wait times (aggregated)
- ✅ Technical issues (e.g., "Video call quality low in Region X")

**What Super Admin CANNOT See:**
- ❌ Content of any message
- ❌ Which doctor talked to which patient
- ❌ Medical advice given
- ❌ Specific symptoms discussed

---

### 1.4 Financial Data of Individual Patients

| Data Type | Why Super Admin Should NOT See | What They Should See Instead |
|-----------|-------------------------------|-----------------------------|
| **Individual Payments** | Personal financial information | Hospital-level revenue totals |
| **Insurance Claims** | Contains sensitive data | Claims success rates (aggregated) |
| **Patient Billing History** | Private financial records | System performance of billing |

**Example:**
```
✅ Good: "Hospital Y processed $45,000 in insurance claims this month"
❌ Bad: "Patient Mukamana owes $200 for her visit on July 15"
```

**Technical Enforcement:**
```sql
-- Super Admin can see billing system performance:
SELECT 
    COUNT(*) as total_claims,
    AVG(processing_time) as avg_processing_time,
    SUM(amount) as total_amount
FROM claims
WHERE hospital_id = 'hospital_uuid';
-- ✅ Allowed — Aggregated

-- Super Admin CANNOT see individual claims:
SELECT * FROM claims WHERE patient_id = 'patient_uuid';
-- ❌ ACCESS DENIED
```

---

### 1.5 Individual Employee/Staff Data

| Data Type | Why Super Admin Should NOT See | What They Should See Instead |
|-----------|-------------------------------|-----------------------------|
| **Personal Staff Info** | HR data belongs to hospitals | Only number of staff per hospital |
| **Individual Salaries** | Private HR information | System licensing (e.g., "Pro tier supports up to 200 users") |
| **Staff Performance** | Hospital management data | System performance metrics |

**What Super Admin CAN See:**
- ✅ Total users per hospital (user count only)
- ✅ Feature usage by department (aggregated)
- ✅ System access logs (technical, not personal)

**What Super Admin CANNOT See:**
- ❌ Individual doctor profiles
- ❌ Staff performance reviews
- ❌ Staff contact details (except for system administrators)

---

### 1.6 Hospital-Specific Operational Decisions

| Data Type | Why Super Admin Should NOT See | What They Should See Instead |
|-----------|-------------------------------|-----------------------------|
| **Staff Schedules** | Hospital management | Only system usage patterns |
| **Internal Policies** | Hospital-specific | Feature adoption rates |
| **Department Budgets** | Hospital financials | System-level revenue |

**Example:**
```
✅ Good: "Hospital Z is using ARTIC for all 3 departments" (Technical)
❌ Bad: "Hospital Z's oncology department budget is $50,000" (Operational)
```

---

## PART 2: WHAT SUPER ADMIN CAN SEE (BUT ANONYMIZED)

### 2.1 Anonymized Clinical Data (For System Improvement)

Super Admin can access **de-identified, anonymized data** for:
- System performance optimization
- AI model training (with consent)
- Quality improvement

**Example of Acceptable Anonymized Data:**
```json
{
    "clinical_condition": "Diabetes Type 2",
    "age_range": "55-64",
    "region": "Kigali",
    "outcome": "Adherence improved 15% with ARTIC",
    "patient_identifier": null  // No way to identify individual
}
```

### 2.2 System Analytics (Aggregated)

Super Admin can see all **non-identifiable** analytics:

| Analytics Type | Example Data |
|----------------|--------------|
| **Adoption Rates** | "65% of patients use ARTIC daily" |
| **System Performance** | "API response time: 120ms" |
| **Feature Usage** | "Health Literacy AI used 8,200 times this month" |
| **Hospital Engagement** | "15 hospitals have >80% patient engagement" |
| **Revenue Metrics** | "Total MRR: $124,500" |

---

## PART 3: DATA ACCESS MATRIX

### Complete Access Control Matrix

| Data Category | Super Admin | Hospital Admin | Doctors | Nurses | Patients |
|---------------|-------------|----------------|---------|--------|----------|
| **Patient Clinical Data** | ❌ No | ❌ No* | ✅ Yes | ✅ Yes | ✅ Yes |
| **Patient Demographics** | ❌ No | ❌ No* | ✅ Yes | ✅ Yes | ✅ Yes |
| **Patient Conversations** | ❌ No | ❌ No* | ✅ Yes | ❌ No | ✅ Yes |
| **Doctor Notes** | ❌ No | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **Billing (Patient)** | ❌ No | ❌ No* | ❌ No | ❌ No | ✅ Yes |
| **Billing (Hospital)** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Staff Information** | ❌ No | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **System Settings** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Feature Flags** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Anonymized Analytics** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Audit Logs (Technical)** | ✅ Yes | ✅ Yes* | ❌ No | ❌ No | ❌ No |
| **Audit Logs (Clinical)** | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |

> *Hospital Admin can see data **within their hospital only**, not all hospitals. Super Admin sees NO individual patient data across any hospital.

---

## PART 4: TECHNICAL ENFORCEMENT

### 4.1 Database-Level Access Controls

```sql
-- Row Level Security (RLS) in PostgreSQL

-- Patient table with RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Super Admin can never see individual patients
CREATE POLICY super_admin_patient_restriction ON patients
    USING (false);  -- Super Admin cannot see ANY patient data

-- Only doctor can see their patients
CREATE POLICY doctor_patient_access ON patients
    USING (doctor_id = current_user_id());

-- Only patient can see their own data
CREATE POLICY patient_self_access ON patients
    USING (patient_id = current_user_id());

-- Anonymized view for Super Admin
CREATE VIEW anonymized_patient_stats AS
SELECT 
    hospital_id,
    COUNT(*) as patient_count,
    AVG(adherence_score) as avg_adherence,
    COUNT(CASE WHEN condition = 'diabetes' THEN 1 END) as diabetes_patients
FROM patients
GROUP BY hospital_id;
-- This view strips ALL identifiable data
```

### 4.2 API-Level Enforcement

```javascript
// API Middleware for Super Admin Access Control

function restrictClinicalDataForSuperAdmin(req, res, next) {
    const userRole = req.user.role;
    const resourceType = req.params.resourceType;
    
    // If Super Admin, restrict clinical data access
    if (userRole === 'super_admin') {
        // Clinical resources are OFF LIMITS
        const forbiddenResources = [
            'patients', 'patient-data', 'clinical-notes', 
            'diagnoses', 'prescriptions', 'lab-results',
            'conversations', 'messages', 'video-consultations'
        ];
        
        if (forbiddenResources.includes(resourceType)) {
            return res.status(403).json({
                error: 'Super Admin cannot access clinical data',
                code: 'ACCESS_DENIED_CLINICAL_DATA',
                message: 'This resource contains protected health information'
            });
        }
        
        // Allow only aggregated/technical data
        if (req.query.include_patient_data === 'true') {
            return res.status(403).json({
                error: 'Individual patient data not allowed for Super Admin',
                suggestion: 'Use aggregated endpoints like /api/stats/patients'
            });
        }
    }
    next();
}

// Example Usage
app.get('/api/patients', restrictClinicalDataForSuperAdmin, (req, res) => {
    // This will be blocked for Super Admin
});
```

### 4.3 Audit Logging for Data Access

```sql
-- Audit table for tracking who accessed what
CREATE TABLE data_access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_role VARCHAR(50),
    action VARCHAR(255),
    resource_type VARCHAR(100),
    hospital_id UUID,
    patient_id UUID,  -- NULL if not patient-specific
    success BOOLEAN,
    reason TEXT,
    ip_address INET,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to log ALL patient data access
CREATE OR REPLACE FUNCTION log_patient_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO data_access_audit (
        user_id, user_role, action, resource_type, 
        hospital_id, patient_id, success, reason
    )
    SELECT 
        current_user_id(), 
        current_user_role(),
        TG_OP,
        TG_TABLE_NAME,
        NEW.hospital_id,
        NEW.id,
        true,
        'Patient data access recorded'
    WHERE current_user_role() != 'super_admin';  -- Super Admin access is blocked
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## PART 5: WHY THESE RESTRICTIONS MATTER

### 5.1 Legal Requirements

| Law/Regulation | Requirement | ARTIC Compliance |
|----------------|-------------|------------------|
| **Rwanda Data Protection Law (2021)** | Personal data must be protected | Super Admin cannot access personal health data |
| **MOH Guidelines** | Patient confidentiality | Clinical data only for clinical staff |
| **Medical Ethics** | Doctor-patient confidentiality | Super Admin is NOT a medical professional |
| **RAAQH Standards** | Patient safety and privacy | No unauthorized access to health records |

### 5.2 Ethical Considerations

```
Why Super Admin Cannot See Clinical Data:
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. PATIENT TRUST                                                          │
│     Patients must trust that their health data is seen only by those       │
│     directly involved in their care.                                       │
│                                                                             │
│  2. MEDICAL PROFESSIONAL BOUNDARIES                                        │
│     Doctors make clinical decisions. System administrators do not.         │
│                                                                             │
│  3. PRIVACY BY DESIGN                                                      │
│     ARTIC is designed with privacy as a fundamental principle.             │
│                                                                             │
│  4. NEED-TO-KNOW PRINCIPLE                                                 │
│     Super Admin needs technical access, NOT clinical access.               │
│                                                                             │
│  5. COMPLIANCE                                                             │
│     Violating this breaks laws and regulations.                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Real-World Scenario

**SCENARIO:** Super Admin sees a patient's diagnosis

```
❌ PROBLEM:
Super Admin sees "Patient Mukamana has HIV"
→ This is a data breach
→ Patient trust is destroyed
→ Legal consequences
→ The hospital and ARTIC are sued
→ System reputation is ruined

✅ SOLUTION:
Super Admin sees "Hospital X has 12 HIV patients" (aggregated)
→ Patient privacy is protected
→ System performs normally
→ No data breach
→ Everyone is safe
```

---

## PART 6: WHAT SUPER ADMIN'S DASHBOARD ACTUALLY SHOWS

### Super Admin Dashboard (Safe Version)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ARTIC SUPER ADMIN DASHBOARD                           │
│                      (NO PATIENT CLINICAL DATA)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  System     │  │  Active     │  │  Revenue    │  │  Feature    │     │
│  │  Status     │  │  Hospitals │  │  This Month │  │  Usage      │     │
│  │  🟢 Online  │  │  47/50     │  │  $124,500   │  │  82% active │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SYSTEM PERFORMANCE (Technical Only)                                │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │  • API Response Time: 120ms (p95)                                   │   │
│  │  • Uptime: 99.98% in last 30 days                                   │   │
│  │  • Total Users (All Hospitals): 12,847                              │   │
│  │  • Daily Active Users (DAU): 8,234 (64%)                            │   │
│  │  • Total Conversations: 45,289 this month                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FEATURE ADOPTION (Aggregated)                                      │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │  • Health Literacy AI: Used 8,200 times this month                  │   │
│  │  • Adherence Agent: Used 12,400 times this month                   │   │
│  │  • Conversational Agent: Used 45,000 times this month              │   │
│  │  • Most Active Region: Kigali (34% of usage)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🚨 SECURITY ALERTS (Technical Issues Only)                        │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │  • 🔴 Failed login attempts: 12 from IP 192.168.1.45              │   │
│  │  • 🟡 Unusual API traffic detected: Hospital Z                    │   │
│  │  • ✅ All encryption certificates valid                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NO CLINICAL DATA EVER APPEARS HERE!                               │   │
│  │  ─────────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  ✅ Patient Count: 12,847 total                                     │   │
│  │  ❌ Individual Patient Names: NEVER SHOWN                          │   │
│  │  ❌ Diagnoses: NEVER SHOWN (except aggregated stats)               │   │
│  │  ❌ Lab Results: NEVER SHOWN                                       │   │
│  │  ❌ Treatment Plans: NEVER SHOWN                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: TRAINING & COMPLIANCE

### 7.1 Super Admin Training Requirements

| Training Module | Content | Duration |
|-----------------|---------|----------|
| **Data Privacy** | What you can and cannot access | 2 hours |
| **Legal Compliance** | Rwanda laws, MOH guidelines | 2 hours |
| **Ethical Boundaries** | Medical ethics, patient trust | 1 hour |
| **Access Controls** | System limitations, technical enforcement | 2 hours |
| **Audit & Accountability** | What gets logged, consequences | 1 hour |
| **Incident Response** | What to do if breach occurs | 2 hours |

### 7.2 Annual Certification

Super Admin must complete **annual certification**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SUPER ADMIN CERTIFICATION CHECKLIST                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ☐ I understand I MUST NOT access patient clinical data                   │
│  ☐ I understand I MUST NOT view individual patient conversations          │
│  ☐ I understand I MUST NOT view doctor-patient communications             │
│  ☐ I understand I MUST NOT view individual patient bills                  │
│  ☐ I understand all my actions are audited                                │
│  ☐ I understand breach consequences include legal action                  │
│  ☐ I commit to protecting patient privacy                                 │
│  ☐ I have completed the Data Privacy training                             │
│                                                                             │
│  Signed: _______________________  Date: _______________                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Consequence Matrix

| Violation | Consequence |
|-----------|-------------|
| **Accessing patient clinical data** | Immediate termination, legal action |
| **Viewing patient conversations** | Immediate termination, legal action |
| **Sharing patient data** | Criminal prosecution |
| **Accidental exposure** | Warning + mandatory retraining |
| **First violation** | Suspension + investigation |
| **Second violation** | Termination, blacklisting |

---

## PART 8: BEST PRACTICES SUMMARY

### DO's for Super Admin ✅

```
✅ DO manage feature flags
✅ DO configure hospital settings
✅ DO control user permissions at system level
✅ DO monitor system performance
✅ DO review anonymized analytics
✅ DO handle technical support escalations
✅ DO maintain system security
✅ DO manage subscriptions and billing
✅ DO review technical audit logs
✅ DO respond to system alerts
```

### DON'Ts for Super Admin ❌

```
❌ DON'T access patient clinical data
❌ DON'T view patient conversations
❌ DON'T read doctor's notes
❌ DON'T view lab results
❌ DON'T look at individual prescriptions
❌ DON'T access patient bills
❌ DON'T view staff personal information
❌ DON'T interfere with clinical decisions
❌ DON'T use the system as a medical tool
❌ DON'T share identifiable data with anyone
```

---

## Conclusion: Separation of Powers

The Super Admin's power is **technical and organizational**, not **clinical**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    SUPER ADMIN = SYSTEM OPERATOR                            │
│                        NOT MEDICAL PROVIDER                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  WHAT SUPER ADMIN DOES:                 WHAT SUPER ADMIN DOESN'T:    │   │
│  │  ─────────────────────────              ─────────────────────────    │   │
│  │  ✅ Controls features                    ❌ Diagnoses patients        │   │
│  │  ✅ Manages hospitals                    ❌ Reviews lab results       │   │
│  │  ✅ Sets subscriptions                   ❌ Reads doctor's notes      │   │
│  │  ✅ Monitors performance                 ❌ Sees patient names        │   │
│  │  ✅ Secures the system                   ❌ Views conversations       │   │
│  │  ✅ Handles technical issues             ❌ Makes clinical decisions  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  "The Super Admin controls the system, but NEVER controls the patient       │
│   data within it. That belongs to the patient and their care team."        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Bottom Line:** The Super Admin is the **guardian of the technical platform**, not the **guardian of patient health**. This separation protects patient privacy, ensures clinical independence, and maintains trust in the ARTIC Health Companion system.


