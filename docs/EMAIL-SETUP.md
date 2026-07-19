# ARTIC HMS — Email Service Setup Guide

> **No UI changes required.** The email service is already wired into the backend.
> You only need to add credentials to the `.env` file on the server.

---

## How It Works

The email service (`backend/src/services/email.service.js`) uses **Nodemailer** and activates automatically when SMTP credentials are set in the environment file.

- **Credentials configured** → sends real emails (any provider)
- **No credentials** → logs email content to PM2 console (safe fallback)

Emails are sent for:
- Hospital creation (welcome + MOH code + temp password)
- Password reset requests
- Appointment confirmations
- Invoice notifications

---

## Quick Setup (5 minutes)

### Step 1 — Edit the server `.env` file

SSH into the server:
```bash
ssh artic@172.209.217.176
nano /home/artic/artic-hms/backend/.env.server
```

Add or fill in these fields:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM=ARTIC Health Companion <noreply@artic.health>
FRONTEND_URL=http://172.209.217.176:3001
```

### Step 2 — Restart backend
```bash
cd /home/artic/artic-hms
pm2 restart artic-hms-backend
pm2 logs artic-hms-backend --lines 10
```

You should see:
```
✅ Email service ready — smtp.gmail.com
```

---

## Provider Options

### Option A: Gmail (Free · 500 emails/day)

**Best for:** Testing, small hospitals, development

**Steps:**
1. Go to your Google Account → Security
2. Enable **2-Step Verification** (required)
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select App: **Mail** → Device: **Other** → Name: `ARTIC HMS`
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop    # 16-char app password (no spaces)
EMAIL_FROM=ARTIC Health Companion <your-email@gmail.com>
```

> ⚠️ Do NOT use your regular Gmail password — it will not work. Only App Passwords work.

---

### Option B: SendGrid (Recommended for production · 100/day free)

**Best for:** Production, reliable delivery, analytics

**Steps:**
1. Create account at [sendgrid.com](https://sendgrid.com) (free)
2. Settings → Sender Authentication → Verify your sender email
3. Settings → API Keys → Create key with **Mail Send** permission
4. Copy the key (starts with `SG.`)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
EMAIL_FROM=ARTIC Health Companion <noreply@yourdomain.com>
```

---

### Option C: Outlook / Microsoft 365

**Best for:** Hospitals using Microsoft ecosystem

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
EMAIL_FROM=ARTIC Health Companion <your-email@outlook.com>
```

---

### Option D: AWS SES (3,000 free/month)

**Best for:** Large scale, AWS infrastructure

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_SES_SMTP_USERNAME
SMTP_PASS=YOUR_SES_SMTP_PASSWORD
EMAIL_FROM=ARTIC Health Companion <noreply@yourdomain.com>
```

> AWS SES requires domain verification. New accounts start in sandbox mode.

---

### Option E: Mailgun (300/day free)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
EMAIL_FROM=ARTIC Health Companion <noreply@yourdomain.com>
```

---

## Provider Comparison

| Provider | Free/Day | Setup | Best For |
|----------|----------|-------|----------|
| **Gmail** | 500 | Easy | Dev, small hospitals |
| **SendGrid** | 100 | Medium | Production ✅ Recommended |
| **AWS SES** | 3,000/month | Medium | Large scale |
| **Outlook** | 300 | Easy | Microsoft orgs |
| **Mailgun** | 300 | Easy | Developers |

---

## What Emails Are Sent

### 1. Hospital Welcome Email (on creation)
Triggered when Super Admin creates a hospital via the admin portal.

**Recipient:** Hospital email address  
**Content:**
- Hospital name and auto-generated MOH code
- Subscription tier and trial expiry date
- Admin login email
- Temporary password (auto-generated or custom)
- Login button linking to `FRONTEND_URL`
- Security notice and privacy statement

**Template:** `emailHospitalWelcome()` in `email.service.js`

---

### 2. User Welcome Email (on account creation)
Triggered when a hospital manager creates a staff user account.

**Recipient:** New user's email  
**Content:**
- Name, role, auto-generated password
- Login button
- Password change instructions

**Template:** `emailWelcome()` in `email.service.js`

---

### 3. Password Reset Email
Triggered when user clicks "Forgot Password".

**Recipient:** User's email  
**Content:**
- Reset link (expires in 1 hour)
- Security notice

**Template:** `emailPasswordReset()` in `email.service.js`

---

### 4. Appointment Confirmation
Triggered when appointment is booked.

**Recipient:** Patient email  
**Content:** Date, time, doctor, queue number, hospital name

**Template:** `emailAppointmentConfirmation()` in `email.service.js`

---

## Auto-Generated Passwords

The service includes `generateSecurePassword(length)` which creates passwords like:
- `Xy9!mK#pL2$q` — 12 characters
- Always includes uppercase, lowercase, number, and special character
- Cryptographically random (not predictable)

Used automatically when Super Admin creates a hospital without specifying a custom password.

---

## Testing Email Without Sending

When no SMTP credentials are set, emails print to console:
```
📧 ─────────────────────────────────────────────
📧 EMAIL (dev/no-smtp) → manager@hospital.rw
   Subject: Welcome to ARTIC HMS — Kigali District Hospital is now registered
   Body: ARTIC Health Companion — Hospital Created…
📧 ─────────────────────────────────────────────
```

View with:
```bash
pm2 logs artic-hms-backend --lines 50
```

---

## Production Checklist

```
☐ Choose email provider (SendGrid recommended for production)
☐ Verify sender email/domain with provider
☐ Set SMTP credentials in /home/artic/artic-hms/backend/.env.server
☐ Run: pm2 restart artic-hms-backend
☐ Check: pm2 logs artic-hms-backend | grep "Email service"
☐ Test: Create a hospital with a real email address
☐ Verify email received in inbox (check spam folder too)
☐ For SendGrid: set up SPF/DKIM DNS records to avoid spam
☐ Monitor bounce rates in provider dashboard
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `✅ Email service ready` not showing | Credentials not set or wrong | Double-check SMTP_USER and SMTP_PASS |
| Email goes to spam | No domain verification | Verify domain with provider, add SPF/DKIM |
| Gmail "Less secure app" error | Using regular password | Use App Password instead |
| `ECONNREFUSED` error | Wrong host/port | Check SMTP_HOST and SMTP_PORT |
| `EAUTH` error | Wrong credentials | Re-check username and password |
| SendGrid `Forbidden` | API key permissions | Re-create key with "Mail Send" permission |
| Emails sent in dev but not production | NODE_ENV check removed | Already fixed — now credential-based |

---

## File Locations

| File | Purpose |
|------|---------|
| `backend/src/services/email.service.js` | Email service + all templates |
| `backend/.env` | Local dev credentials (not committed) |
| `backend/.env.server` | Production server credentials |
| `backend/src/modules/super-admin/super-admin.service.js` | Calls email on hospital creation |
| `backend/src/modules/auth/auth.service.js` | Calls email on password reset |

---

## Server Env File Location

```bash
# The server reads from this file (set by server-setup.sh step 3):
/home/artic/artic-hms/backend/.env.server

# Edit it:
ssh artic@172.209.217.176
nano /home/artic/artic-hms/backend/.env.server
```

After editing, restart:
```bash
pm2 restart artic-hms-backend
```

---

*Document version: July 2026 · ARTIC Health Companion v2.0*
