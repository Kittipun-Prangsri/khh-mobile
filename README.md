# KHH Safe-Connect — Mobile App (iOS / Android)

A standalone React Native (Expo) app for **Khlong Hat Hospital NCDs Care**,
built as a companion to the existing LINE Flex Message system described in
`SKILL.md`. This is a second **client** of the same backend — it does not
duplicate the HOSxP integration.

## Why this shape

- The LINE bot's "no push messages" constraint exists because LINE charges
  for push messages. **That constraint does not apply here** — this is a
  real installed app with its own push channel (APNs / FCM via
  `expo-notifications`), so it can proactively notify high-risk patients
  about upcoming or missed appointments without the budget-guard logic
  needed on the LINE side. Use this app as the primary channel for
  proactive reminders once it has adoption; keep LINE reply messages as the
  zero-cost fallback for patients who haven't installed the app.
- All Flex Message categories in `SKILL.md` map 1:1 to a screen or tab here
  (Appointments, Vitals/Labs, Health Education, Contacts, Auth/PDPA), so
  patients get feature parity whichever channel they use.
- Colors (`KHH_COLORS`) and contacts (`KHH_CONTACTS`) are copied into
  `src/theme/colors.ts` and `src/constants/contacts.ts` **on purpose, kept
  as literal mirrors** of `apps/web/lib/flex/flexConstants.ts` — React
  Native can't import directly from the Next.js web package without a
  monorepo workspace setup. If this becomes a monorepo, hoist both into a
  shared `packages/design-tokens` package instead of hand-syncing.

## Project structure

```
khh-mobile/
├── App.tsx                          # Entry point
├── src/
│   ├── theme/colors.ts              # Mirrors flexConstants.ts KHH_COLORS
│   ├── constants/contacts.ts        # Mirrors flexConstants.ts KHH_CONTACTS + API base URL
│   ├── types/index.ts               # Patient, Appointment, VitalReading, Badge, HealthArticle
│   ├── services/api.ts              # Typed client for the HOSxP-backed backend (apps/web)
│   ├── context/AuthContext.tsx      # Session state, backed by SecureStore
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # Auth stack vs Main tabs
│   │   └── MainTabs.tsx             # Bottom tabs + Appointments stack
│   ├── screens/
│   │   ├── auth/                    # RoleSelection, Register (CID/HN), PdpaPin
│   │   ├── HomeScreen.tsx
│   │   ├── AppointmentsScreen.tsx
│   │   ├── AppointmentDetailScreen.tsx  # Self check-in QR, confirm/reschedule
│   │   ├── VitalsScreen.tsx         # FBS / HbA1c / eGFR / BP / BMI gauges
│   │   ├── HealthEducationScreen.tsx
│   │   └── ContactScreen.tsx        # Staff contacts + 1669 / B.E.F.A.S.T banner
│   └── components/                  # AppointmentCard, VitalGaugeBar, BadgeCard, PrimaryButton
```

## Required backend work (not in this repo)

This app assumes new REST endpoints on the **existing** `apps/web` backend,
under `/api/mobile/*`. None of these exist yet — they need to be built
reusing the same HOSxP read-replica/sync-table pattern already recommended
for webhook latency:

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/lookup` | CID/HN → patient match (no PIN yet) |
| `POST /auth/pdpa-pin` | Verify hashed PDPA PIN → issue session token |
| `GET /appointments` | List patient's appointments |
| `POST /appointments/:id/confirm` | Confirm attendance |
| `POST /appointments/:id/reschedule` | Submit reschedule request |
| `GET /vitals` | Latest BMI / BP / FBS / HbA1c / eGFR readings |
| `GET /badges` | Earned gamification badges |
| `GET /health-articles` | NCDs education content |

Session tokens should be short-lived JWTs, rate-limited on the PIN endpoint,
and every request logged for audit — matching the security gaps already
flagged for the LINE side (`x-line-signature` verification, hashed PINs,
rate limiting, audit logging).

## Setup

```bash
npm install
npx expo start
```

Set the backend URL before building:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-real-api.example.org/api/mobile npx expo start
```

## Not yet implemented (scaffold boundaries)

- Push notification registration/scheduling (`expo-notifications` is a
  dependency but wiring to a backend notification service is not built)
- Real QR code rendering on `AppointmentDetailScreen` (currently a
  placeholder box — wire up `react-native-qrcode-svg` once the check-in
  code format is finalized)
- Thai font embedding / accessibility text-scaling pass for older patients
- App Store / Play Store submission assets (icons, screenshots, privacy
  nutrition labels — required given this handles health data)
