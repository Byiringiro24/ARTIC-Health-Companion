# ARTIC HMS — Mobile App Plan
# Technology decision, architecture, and full build plan

---

## Decision: React Native with Expo ✅

**Use React Native + Expo** — not Flutter, not native.

### Why React Native + Expo:

| Factor | React Native + Expo | Flutter | Native (Swift/Kotlin) |
|--------|--------------------|---------|-----------------------|
| Code sharing with web | ✅ TypeScript, same types/API client | ❌ Dart | ❌ Different languages |
| Dev speed | ✅ Fast (JS devs) | 🟡 Medium | ❌ Slow |
| Team expertise | ✅ Same stack as web | ❌ New language | ❌ New language |
| Offline support | ✅ AsyncStorage + SQLite | ✅ Hive | ✅ SQLite |
| Push notifications | ✅ expo-notifications | ✅ | ✅ |
| Camera / QR scan | ✅ expo-barcode-scanner | ✅ | ✅ |
| Biometrics | ✅ expo-local-authentication | ✅ | ✅ |
| OTA updates | ✅ Expo EAS Update | 🟡 | ❌ |
| App Store ready | ✅ EAS Build | ✅ | ✅ |
| **Recommendation** | ✅ **BEST CHOICE** | 2nd choice | Don't use |

---

## Target Users

| User | Primary Use | Key Screens |
|------|------------|-------------|
| Doctor | Consultation on ward rounds | Patient summary, SOAP, prescribe |
| Nurse | Triage, vitals, MAR on the ward | Triage form, vitals, medication admin |
| Community Health Worker (CHW) | Home visits — vaccinations, ANC | Vaccination form, growth chart |
| Receptionist | Quick check-in at desk | Patient search, check-in |
| Patient | Own records, appointments, bills | Portal, book appointment, pay |
| Lab Technician | Scan barcodes, enter results | Barcode scanner, result entry |

---

## Technology Stack (Mobile)

```
React Native     0.76+     Framework
Expo             52+       Build tools, managed workflow
TypeScript       5.7+      Type safety
React Navigation 7+        Screen navigation
Zustand          4.5+      Shared state (same as web)
Axios            1.7+      HTTP client
socket.io-client 4.8+      Real-time WebSocket
AsyncStorage     2+        Persistent local storage
expo-sqlite      14+       Local SQLite for offline queue
expo-camera      15+       Camera + QR scanner
expo-notifications 0.28+   Push notifications
expo-local-auth  14+       Biometric login
expo-print       12+       PDF printing
expo-secure-store 13+      Secure token storage
react-query      5+        Server state + caching
```

Install:
```bash
cd app
npx expo install expo-camera expo-notifications expo-local-authentication expo-secure-store expo-sqlite expo-print
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @tanstack/react-query socket.io-client axios zustand
```

---

## Complete App Structure

```
app/
├── App.tsx                         # Entry point
├── app.json                        # Expo config
├── package.json
├── tsconfig.json
│
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Root navigator (auth vs app)
│   │   ├── AuthNavigator.tsx       # Login, register, forgot-pw
│   │   ├── MainNavigator.tsx       # Bottom tab + stack
│   │   └── RoleNavigator.tsx       # Role-based deep links
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx     # Email + password, biometric
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── ChangePasswordScreen.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardScreen.tsx # Role-based KPI widgets
│   │   │   └── NotificationsScreen.tsx
│   │   │
│   │   ├── patients/
│   │   │   ├── PatientListScreen.tsx      # Search, scan QR
│   │   │   ├── PatientDetailScreen.tsx    # Summary, vitals, notes
│   │   │   └── RegisterPatientScreen.tsx  # New patient form
│   │   │
│   │   ├── appointments/
│   │   │   ├── AppointmentsScreen.tsx     # Today's list
│   │   │   ├── BookAppointmentScreen.tsx  # Calendar picker
│   │   │   └── QueueScreen.tsx            # Live queue board
│   │   │
│   │   ├── clinical/
│   │   │   ├── ConsultationScreen.tsx     # SOAP notes
│   │   │   ├── VitalsScreen.tsx           # Record vitals
│   │   │   ├── TriageScreen.tsx           # Nurse triage
│   │   │   ├── PrescribeScreen.tsx        # Write prescription
│   │   │   ├── LabOrderScreen.tsx         # Order lab test
│   │   │   └── DischargeSummaryScreen.tsx
│   │   │
│   │   ├── pharmacy/
│   │   │   ├── PharmacyQueueScreen.tsx    # Pending Rx
│   │   │   ├── DispenseScreen.tsx         # Dispense view
│   │   │   └── InventoryScreen.tsx        # Stock levels
│   │   │
│   │   ├── laboratory/
│   │   │   ├── LabQueueScreen.tsx         # Pending tests
│   │   │   ├── BarcodeScanner.tsx         # Scan specimen
│   │   │   └── ResultEntryScreen.tsx      # Enter result
│   │   │
│   │   ├── billing/
│   │   │   ├── InvoiceScreen.tsx          # View invoice
│   │   │   ├── PaymentScreen.tsx          # Mobile money
│   │   │   └── ReceiptScreen.tsx          # Receipt view
│   │   │
│   │   ├── registries/
│   │   │   ├── VaccinationScreen.tsx      # Administer vaccine
│   │   │   ├── GrowthChartScreen.tsx      # Child growth
│   │   │   ├── ANCVisitScreen.tsx         # ANC visit
│   │   │   ├── BirthRegistrationScreen.tsx
│   │   │   └── DeathRegistrationScreen.tsx
│   │   │
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── StatCard.tsx
│   │   ├── PatientCard.tsx
│   │   ├── VitalsForm.tsx
│   │   ├── QueueItem.tsx
│   │   ├── NotificationBadge.tsx
│   │   └── QRScanner.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Login, logout, session
│   │   ├── useSocket.ts            # WebSocket (same as web)
│   │   ├── useOfflineQueue.ts      # Queue actions for sync
│   │   ├── usePatients.ts
│   │   ├── useAppointments.ts
│   │   └── useBiometric.ts
│   │
│   ├── services/
│   │   ├── api.ts                  # Axios instance + interceptors
│   │   ├── auth.service.ts         # Login, refresh token
│   │   ├── storage.service.ts      # AsyncStorage + SecureStore
│   │   ├── sync.service.ts         # Offline → online sync
│   │   └── notifications.service.ts
│   │
│   ├── store/
│   │   ├── authStore.ts            # User session (Zustand)
│   │   ├── patientStore.ts
│   │   ├── offlineStore.ts         # Pending offline actions
│   │   └── notificationStore.ts
│   │
│   ├── types/
│   │   └── index.ts                # Shared with web (copy or monorepo)
│   │
│   ├── utils/
│   │   ├── formatters.ts           # RWF, date, MRN
│   │   ├── validators.ts           # NID, phone validation
│   │   └── offline.ts              # Offline detection
│   │
│   └── constants/
│       ├── colors.ts
│       ├── api.ts                  # API_URL
│       └── roles.ts
│
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
└── __tests__/
```

---

## Key Features to Build

### 1. Authentication
- Email + password login → JWT stored in SecureStore
- Biometric login (fingerprint/face) using stored token
- Auto-refresh token on expiry
- Role-based navigation on login

### 2. Offline Mode (Critical for CHWs in rural areas)
```typescript
// When offline: save action to local SQLite queue
// When back online: sync queue to server automatically

const offlineQueue = [
  { action: "administer_vaccine", data: {...}, timestamp: ... },
  { action: "record_growth", data: {...}, timestamp: ... },
];

// Sync on reconnect:
await syncOfflineQueue();
```

### 3. QR Code Scanner
- Scan patient QR card → open patient record
- Scan specimen barcode → link to lab request

### 4. Push Notifications
```typescript
// Expo push notification for:
// - Critical lab results (doctor)
// - New prescription (pharmacist)
// - Appointment reminder (patient)
// - Emergency alert (nurse + doctor)
```

### 5. Clinical Workflows (Mobile-optimised)
- Doctor: tap patient in queue → SOAP form → prescribe → done
- Nurse: triage form → vitals → assign level
- CHW: vaccination form → growth chart → ANC visit

---

## Build & Release

```bash
# Development
cd app
npx expo start

# iOS build (requires Mac or EAS)
eas build --platform ios

# Android build
eas build --platform android

# Over-the-air update (no app store needed)
eas update --branch production
```

---

## API Integration

The mobile app uses the exact same backend API as the web:
- Base URL: `http://172.209.217.176:4001`
- Same JWT tokens
- Same endpoints
- Same WebSocket server

The only difference: token stored in `expo-secure-store` instead of localStorage.

---

## Timeline Estimate

| Sprint | Duration | Deliverables |
|--------|----------|-------------|
| Sprint M1 | 2 weeks | Auth, dashboard, patients, appointments |
| Sprint M2 | 2 weeks | Consultation, vitals, triage, pharmacy |
| Sprint M3 | 2 weeks | Lab, billing, notifications, QR scanner |
| Sprint M4 | 2 weeks | Offline mode, registries (vaccination, ANC) |
| Sprint M5 | 1 week | Push notifications, biometric, polish |
| Sprint M6 | 1 week | Build, test on devices, App Store submission |

**Total: ~10 weeks for a production-ready mobile app**
