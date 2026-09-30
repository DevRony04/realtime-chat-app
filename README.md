# Real-Time One-to-One Chat Application

A complete, production-ready, full-stack real-time one-to-one chat application built with **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, and **Appwrite Cloud** (Auth, Databases, and Realtime).

---

## 🚀 Features

- **Appwrite Email/Password Authentication**: User signup, login, persistent session management, and secure logout.
- **User Profile Synchronization**: Automatic application-level user profile creation in the `users` database collection upon sign up.
- **Registered Users Directory**: Dynamic user list in the sidebar displaying registered users (excluding the currently authenticated user).
- **One-to-One Conversation Filtering**: Strict message isolation. Opening a chat with User B only queries and displays messages exchanged between current user and User B (`(sender = A AND recipient = B) OR (sender = B AND recipient = A)`).
- **Appwrite Realtime Subscriptions**: Instant message delivery using Appwrite Realtime WebSockets, filtered dynamically to the active conversation.
- **Unread Message Indicators**: Realtime badges indicating unread messages sent by other users while a different conversation is active.
- **Auto-Scrolling**: Automatic smooth scrolling to the newest message upon opening conversations or receiving new messages.
- **Responsive Layout**: Tailored desktop (two-column split pane) and mobile views (toggleable sidebar and chat pane with clear back navigation).
- **Form Controls & Validation**: Whitespace trimming, disabled send states, loading spinners, error alerts, keyboard shortcuts (`Enter` to send, `Shift + Enter` for new line).
- **Clean Architecture & Types**: Strict TypeScript interfaces, isolated Appwrite service modules, custom React hooks (`useAuth`, `useMessages`, `useRealtimeMessages`), and reusable UI components.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend / BaaS**: Appwrite Cloud Free Plan (`appwrite` Web SDK)
  - Appwrite Authentication (Account API)
  - Appwrite Databases (JSON Documents)
  - Appwrite Realtime (WebSocket Subscriptions)
- **Deployment Platform**: Vercel Free Plan

---

## ⚙️ Prerequisites

1. **Node.js**: Version 18.17+ or 20+ (tested on Node v22)
2. **Appwrite Cloud Account**: Free tier account at [cloud.appwrite.io](https://cloud.appwrite.io)
3. **GitHub Account**: For version control & deployment
4. **Vercel Account**: For hosting the frontend

---

## 💻 Local Setup

1. **Clone the repository & install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Appwrite Project ID, Database ID, and Collection IDs in `.env.local` (see setup guide below).

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build Verification**:
   ```bash
   npm run build
   ```

---

## ☁️ Detailed Appwrite Console Setup Guide

Follow these exact step-by-step instructions to set up your backend in the Appwrite Console:

### 1. Create Appwrite Project & Add Web Platform
1. Log into [Appwrite Cloud Console](https://cloud.appwrite.io).
2. Click **Create Project** and name it `realtime-chat-app`. Copy your **Project ID**.
3. Under **Add Platform**, select **Web App**:
   - **Name**: `Realtime Chat Frontend`
   - **Hostname**: `localhost` (and later add your Vercel deployment domain, e.g., `realtime-chat-app.vercel.app`).

### 2. Create Database
1. In the sidebar, navigate to **Databases**.
2. Click **Create Database**.
   - **Database Name**: `chat_db`
   - **Database ID**: `chat_db` (or copy auto-generated ID).

### 3. Create `users` Collection
1. Inside `chat_db`, click **Create Collection**.
   - **Collection Name**: `users`
   - **Collection ID**: `users` (or copy auto-generated ID).

#### Attributes to create in `users` collection:
| Attribute Key | Type | Size / Format | Required | Default |
|---------------|------|---------------|----------|---------|
| `userId`      | String | 255 | Yes | None |
| `name`        | String | 255 | Yes | None |
| `email`       | String | 255 | Yes | None |
| `createdAt`   | String (or Datetime) | 255 | Yes | None |

#### Permissions for `users` collection:
Under **Settings -> Permissions**:
- Add Role: `Any` (or `Users`) -> Grant **Read** permission so registered users can see profiles.
- Add Role: `Users` (authenticated users) -> Grant **Create**, **Update** permissions.

---

### 4. Create `messages` Collection
1. Inside `chat_db`, click **Create Collection**.
   - **Collection Name**: `messages`
   - **Collection ID**: `messages` (or copy auto-generated ID).

#### Attributes to create in `messages` collection:
| Attribute Key | Type | Size / Format | Required | Default |
|---------------|------|---------------|----------|---------|
| `senderId`    | String | 255 | Yes | None |
| `recipientId` | String | 255 | Yes | None |
| `senderName`  | String | 255 | Yes | None |
| `content`     | String | 5000 | Yes | None |
| `createdAt`   | String (or Datetime) | 255 | Yes | None |

#### Indexes to create in `messages` collection:
Under **Indexes**:
1. **Index 1**:
   - Key: `senderId_idx`
   - Type: `Key`
   - Attributes: `senderId` (ASC)
2. **Index 2**:
   - Key: `recipientId_idx`
   - Type: `Key`
   - Attributes: `recipientId` (ASC)
3. **Index 3**:
   - Key: `sender_recipient_idx`
   - Type: `Key`
   - Attributes: `senderId` (ASC), `recipientId` (ASC)
4. **Index 4**:
   - Key: `createdAt_idx`
   - Type: `Key`
   - Attributes: `createdAt` (ASC)

#### Permissions for `messages` collection:
Under **Settings -> Permissions**:
- Add Role: `Users` (authenticated users) -> Grant **Read** and **Create** permissions.
- *Security Note*: Standard client-side Appwrite querying requires `Users` or `Any` read/create collection level permissions. Appwrite Realtime events filter incoming payload on the client to ensure messages are only displayed to the intended sender/recipient.

---

## 🔑 Environment Variables

In `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=chat_db
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=messages
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
```

> ⚠️ **Important Security Rule**: NEVER put an Appwrite API Secret Key into `NEXT_PUBLIC_*` variables. The application strictly relies on Appwrite's client-side Web SDK and authenticated user sessions.

---

## 🚀 Vercel Deployment Instructions

1. Push your repository code to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository (`realtime-chat-app`).
4. Configure Environment Variables in Vercel settings:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
   - `NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID`
   - `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID`
5. Click **Deploy**.
6. Once deployed, copy your production domain (e.g. `realtime-chat-app.vercel.app`).
7. **Crucial Final Step**: Go back to your Appwrite Cloud Console -> **Settings** -> **Web App Platform**, click **Add Platform** (or edit existing) and add your Vercel production domain to the allowed hostnames list so Appwrite CORS and WebSocket subscriptions function seamlessly in production.

---

## 🧪 Two-User Realtime Testing Procedure

To test real-time chat functionality locally or in production:

1. Open **Browser Window A** (e.g. Chrome):
   - Navigate to `/signup`.
   - Register User A: `Alice` (`alice@example.com`, password: `Password123!`).
   - You will be redirected to `/chat`.

2. Open **Browser Window B** (e.g. Chrome Incognito or Firefox):
   - Navigate to `/signup`.
   - Register User B: `Bob` (`bob@example.com`, password: `Password123!`).
   - You will be redirected to `/chat`.

3. **Test One-to-One Messaging**:
   - In Browser A (Alice), select `Bob` from the user list.
   - Type `"Hello Bob!"` and press Enter.
   - Observe in Browser B (Bob) that Alice's user profile highlights or receives the message in real-time without refreshing!
   - In Browser B (Bob), select `Alice` and reply `"Hi Alice, how are you?"`.
   - Verify that Browser A receives Bob's response immediately.

4. **Test Conversation Isolation**:
   - Register User C (`Charlie`) in a third window.
   - Verify that messages exchanged between Alice and Bob NEVER appear in Charlie's chat window.
